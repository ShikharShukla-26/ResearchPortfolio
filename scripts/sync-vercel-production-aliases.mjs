#!/usr/bin/env node
/**
 * Point all production vanity URLs at the latest Ready production deployment.
 * Run after every git push to main (Vercel only auto-updates one primary alias).
 *
 * Usage: npm run deploy:sync-aliases
 * Env: VERCEL_PROJECT (default shikhar-research)
 *      VERCEL_PRODUCTION_ALIASES (comma-separated hostnames)
 *      GITHUB_SHA — when set (CI), wait for that commit's production deploy
 */
import { execFileSync, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

function vercelCommand() {
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA ?? '';
    const cmd = path.join(appData, 'npm', 'vercel.cmd');
    if (existsSync(cmd)) return cmd;
  }
  return 'vercel';
}

const PROJECT = process.env.VERCEL_PROJECT ?? 'shikhar-research';
const ALIASES = (
  process.env.VERCEL_PRODUCTION_ALIASES ??
  'shikhar-research.vercel.app,next-mdx-blog-xi.vercel.app'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const EXPECTED_SHA = process.env.GITHUB_SHA?.trim() ?? '';
const POLL_MS = Number(process.env.VERCEL_SYNC_POLL_MS ?? 30_000);
const MAX_WAIT_MS = Number(process.env.VERCEL_SYNC_MAX_WAIT_MS ?? 600_000);

function runVercel(args) {
  const bin = vercelCommand();
  try {
    return execFileSync(bin, [...args, '--non-interactive'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      env: process.env
    });
  } catch {
    return execSync(`npx vercel ${args.join(' ')} --non-interactive`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env
    });
  }
}

function listProductionDeployments() {
  const raw = runVercel(['ls', PROJECT, '--json']);
  const data = JSON.parse(raw);
  return (data.deployments ?? []).filter(
    (d) => d.target === 'production' && d.state === 'READY'
  );
}

function hostFromDeployment(d) {
  return d.url.replace(/^https?:\/\//, '');
}

function deploymentMatchesSha(d, sha) {
  const deployed = d.meta?.githubCommitSha ?? '';
  if (!deployed || !sha) return false;
  return deployed === sha || deployed.startsWith(sha.slice(0, 7));
}

function pickDeploymentHost(deployments) {
  if (EXPECTED_SHA) {
    const match = deployments.find((d) => deploymentMatchesSha(d, EXPECTED_SHA));
    if (match) return hostFromDeployment(match);
  }
  const latest = deployments[0];
  if (!latest?.url) {
    throw new Error(`No Ready production deployment for project "${PROJECT}".`);
  }
  return hostFromDeployment(latest);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveDeploymentHost() {
  const start = Date.now();
  while (true) {
    const deployments = listProductionDeployments();
    try {
      const host = pickDeploymentHost(deployments);
      if (EXPECTED_SHA) {
        const match = deployments.find((d) => deploymentMatchesSha(d, EXPECTED_SHA));
        if (match) {
          console.log(`Matched commit ${EXPECTED_SHA.slice(0, 7)} → ${host}`);
          return host;
        }
        console.log(
          `Waiting for Vercel production deploy of ${EXPECTED_SHA.slice(0, 7)}…`
        );
      } else {
        console.log(`Latest production: ${host}`);
        return host;
      }
    } catch {
      console.log('Waiting for a Ready production deployment…');
    }
    if (Date.now() - start > MAX_WAIT_MS) {
      throw new Error(
        `Timed out after ${MAX_WAIT_MS / 1000}s waiting for Vercel production.`
      );
    }
    await sleep(POLL_MS);
  }
}

if (process.env.GITHUB_ACTIONS === 'true' && !process.env.VERCEL_TOKEN) {
  console.error(
    'VERCEL_TOKEN is not set. Add it to GitHub Actions secrets (see docs/SETUP-AUTO-SYNC.md).'
  );
  process.exit(1);
}

const deploymentHost = await resolveDeploymentHost();

for (const alias of ALIASES) {
  console.log(`→ ${alias}`);
  runVercel(['alias', 'set', deploymentHost, alias]);
}

console.log('Done. Both URLs should match the latest production build.');
