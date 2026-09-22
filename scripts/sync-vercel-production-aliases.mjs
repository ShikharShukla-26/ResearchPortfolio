#!/usr/bin/env node
/**
 * Point all production vanity URLs at the latest Ready production deployment.
 *
 * Usage: npm run deploy:sync-aliases
 * CI: set GITHUB_SHA to wait for that commit's production deploy (up to ~12 min).
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

const EXPECTED_SHA = process.env.GITHUB_SHA?.trim() || '';
const POLL_MS = 15_000;
const MAX_POLLS = 48;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runVercel(args) {
  const bin = vercelCommand();
  const env = { ...process.env };
  if (!env.VERCEL_TOKEN) {
    throw new Error('VERCEL_TOKEN is not set.');
  }
  try {
    return execFileSync(bin, [...args, '--non-interactive'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      env
    });
  } catch {
    return execSync(`npx vercel ${args.join(' ')} --non-interactive`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env
    });
  }
}

function listProductionDeployments() {
  const raw = runVercel(['ls', PROJECT, '--json']);
  const data = JSON.parse(raw);
  return data.deployments ?? [];
}

function pickDeployment(deployments) {
  const production = deployments.filter(
    (d) => d.state === 'READY' && d.target === 'production'
  );
  if (!EXPECTED_SHA) {
    return production[0];
  }
  const forSha = production.find(
    (d) => d.meta?.githubCommitSha === EXPECTED_SHA
  );
  return forSha ?? production[0];
}

async function resolveDeploymentHost() {
  for (let attempt = 0; attempt <= MAX_POLLS; attempt++) {
    const deployments = listProductionDeployments();
    const chosen = pickDeployment(deployments);
    if (chosen?.url) {
      if (
        EXPECTED_SHA &&
        chosen.meta?.githubCommitSha === EXPECTED_SHA
      ) {
        console.log(`Matched deploy for commit ${EXPECTED_SHA.slice(0, 7)}`);
      } else if (EXPECTED_SHA && attempt === MAX_POLLS) {
        console.warn(
          `Timed out waiting for commit ${EXPECTED_SHA.slice(0, 7)}; using latest production.`
        );
      }
      return chosen.url.replace(/^https?:\/\//, '');
    }
    if (!EXPECTED_SHA || attempt === MAX_POLLS) {
      break;
    }
    console.log(`Waiting for production deploy (${attempt + 1}/${MAX_POLLS})…`);
    await sleep(POLL_MS);
  }
  throw new Error(`No Ready production deployment for project "${PROJECT}".`);
}

const deploymentHost = await resolveDeploymentHost();
console.log(`Latest production: ${deploymentHost}`);

for (const alias of ALIASES) {
  console.log(`→ ${alias}`);
  runVercel(['alias', 'set', deploymentHost, alias]);
}

console.log('Done. Both URLs should match the latest production build.');
