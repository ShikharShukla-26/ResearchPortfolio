import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

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

loadEnv('.env.local');
loadEnv('.env.vercel.pull');

const url =
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL_NON_POOLING;

if (!url) {
  console.error('POSTGRES_URL not found in .env.local or .env.vercel.pull');
  process.exit(1);
}

const sql = postgres(url, { ssl: 'require', prepare: false, max: 1 });

const researchRows = await sql`
  DELETE FROM cms_research
  WHERE slug LIKE 'e2e-%'
     OR slug LIKE 'e2e-draft-%'
     OR title ILIKE 'E2E %'
     OR TRIM(COALESCE(title, '')) = ''
     OR date_display = 'E2E 2026'
  RETURNING id
`;

const writingRows = await sql`
  DELETE FROM cms_writing
  WHERE title ILIKE 'E2E Writing%'
     OR (title = 'New essay' AND href IN ('https://', 'https://example.com/e2e-writing'))
  RETURNING id
`;

const linkRows = await sql`
  DELETE FROM cms_links
  WHERE label = 'New link'
     OR label ILIKE 'E2E Link%'
  RETURNING id
`;

const logRows = await sql`
  DELETE FROM cms_logs
  WHERE slug LIKE 'e2e-%'
     OR slug LIKE 'e2e-log-%'
     OR title ILIKE 'E2E Log%'
  RETURNING id
`;

await sql.end();

console.log('Removed test rows:', {
  research: researchRows.length,
  writing: writingRows.length,
  links: linkRows.length,
  logs: logRows.length
});
