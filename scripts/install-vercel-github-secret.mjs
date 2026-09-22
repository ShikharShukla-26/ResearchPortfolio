#!/usr/bin/env node
/**
 * Store local Vercel CLI token in GitHub Actions as VERCEL_TOKEN.
 * Requires: gh auth login (then run with --use-gh)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const REPO = 'ShikharShukla-26/ResearchPortfolio';
const SECRET_NAME = 'VERCEL_TOKEN';

function vercelTokenFromCliAuth() {
  const authPath = path.join(
    process.env.APPDATA ?? '',
    'com.vercel.cli',
    'Data',
    'auth.json'
  );
  if (!existsSync(authPath)) {
    throw new Error(`Vercel auth not found. Run: vercel login`);
  }
  const { token } = JSON.parse(readFileSync(authPath, 'utf8'));
  if (!token) throw new Error('No token in Vercel auth.json');
  return token;
}

try {
  execFileSync('gh', ['auth', 'status'], { stdio: 'pipe' });
} catch {
  console.error('Run first: gh auth login -h github.com -p https -w');
  process.exit(1);
}

const vercelToken = vercelTokenFromCliAuth();
execFileSync('gh', ['secret', 'set', SECRET_NAME, '--repo', REPO], {
  input: vercelToken,
  stdio: ['pipe', 'inherit', 'inherit']
});
console.log(`Set ${SECRET_NAME} on ${REPO}. Open Actions → Sync Vercel production aliases → Run workflow.`);
