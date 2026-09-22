import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv(name) {
  const path = resolve(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv('.env.e2e');
loadEnv('.env.local');

const base =
  process.env.PLAYWRIGHT_BASE_URL ?? 'https://shikhar-research.vercel.app';
const password =
  process.env.E2E_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? '';

if (!password) {
  console.error('Set E2E_ADMIN_PASSWORD in .env.e2e');
  process.exit(1);
}

const loginRes = await fetch(`${base}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password })
});

const setCookie = loginRes.headers.getSetCookie?.() ?? [];
const cookie = setCookie.map((c) => c.split(';')[0]).join('; ');

if (!loginRes.ok) {
  console.error('Login failed', loginRes.status, await loginRes.text());
  process.exit(1);
}

const cleanRes = await fetch(`${base}/api/admin/cleanup-test-data`, {
  method: 'POST',
  headers: cookie ? { Cookie: cookie } : {}
});

const body = await cleanRes.json().catch(() => ({}));
if (!cleanRes.ok) {
  console.error('Cleanup failed', cleanRes.status, body);
  process.exit(1);
}

console.log('Production cleanup OK:', body);
