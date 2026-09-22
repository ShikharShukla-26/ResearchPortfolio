import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileMDX } from 'next-mdx-remote/rsc';

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

const base = 'https://shikhar-shukla-research.vercel.app';
const password = process.env.E2E_ADMIN_PASSWORD ?? '';

const loginRes = await fetch(`${base}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password })
});
const setCookie = loginRes.headers.getSetCookie?.() ?? [];
const cookie = setCookie.map((c) => c.split(';')[0]).join('; ');

const listRes = await fetch(`${base}/api/admin/research`, {
  headers: { Cookie: cookie }
});
const items = await listRes.json();
const item = items.find((i) => i.slug === 'six-week-silence');
if (!item) {
  console.error('Not found');
  process.exit(1);
}
console.log('title', item.title, 'bodyLen', item.bodyMdx?.length);
try {
  await compileMDX({ source: item.bodyMdx, components: {} });
  console.log('DB body compile OK');
} catch (err) {
  console.error('DB body compile FAIL', err.message);
}
