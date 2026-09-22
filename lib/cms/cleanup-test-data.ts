import { getSql } from './db';

export type CleanupResult = {
  research: number;
  writing: number;
  links: number;
  logs: number;
};

/** Removes rows created by Playwright E2E runs against production. */
export async function cleanupTestContent(): Promise<CleanupResult> {
  const sql = getSql();

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

  return {
    research: researchRows.length,
    writing: writingRows.length,
    links: linkRows.length,
    logs: logRows.length
  };
}
