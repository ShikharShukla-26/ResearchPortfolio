#!/usr/bin/env node
/**
 * Point all production vanity URLs at the latest Ready production deployment.
 * Run after every git push to main (Vercel only auto-updates one primary alias).
 *
 * Usage: npm run deploy:sync-aliases
 * Env: VERCEL_PROJECT (default shikhar-research)
 *      VERCEL_PRODUCTION_ALIASES (comma-separated hostnames)
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

function runVercel(args) {
  const bin = vercelCommand();
  try {
    return execFileSync(bin, [...args, '--non-interactive'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });
  } catch {
    return execSync(`npx vercel ${args.join(' ')} --non-interactive`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  }
}

function latestProductionDeploymentHost() {
  const raw = runVercel(['ls', PROJECT, '--json']);
  const data = JSON.parse(raw);
  const deployments = data.deployments ?? [];
  const latest = deployments.find(
    (d) => d.state === 'READY' && d.target === 'production'
  );
  if (!latest?.url) {
    throw new Error(`No Ready production deployment for project "${PROJECT}".`);
  }
  return latest.url.replace(/^https?:\/\//, '');
}

const deploymentHost = latestProductionDeploymentHost();
console.log(`Latest production: ${deploymentHost}`);

for (const alias of ALIASES) {
  console.log(`→ ${alias}`);
  runVercel(['alias', 'set', deploymentHost, alias]);
}

console.log('Done. Both URLs should match the latest production build.');
