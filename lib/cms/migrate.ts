import { getSql } from './db';
import { defaultSiteSettings } from './defaults';
import { RESEARCH_DOCUMENT_DEFAULTS } from './research-document-urls';

export async function runMigrations() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS redirects (
      id SERIAL PRIMARY KEY,
      source VARCHAR(255) NOT NULL,
      destination VARCHAR(255) NOT NULL,
      permanent BOOLEAN NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cms_site (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cms_research (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      date_display TEXT NOT NULL DEFAULT '',
      date_time TEXT NOT NULL DEFAULT '',
      meta_line TEXT NOT NULL DEFAULT '',
      body_mdx TEXT NOT NULL DEFAULT '',
      published BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cms_writing (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      href TEXT NOT NULL,
      date_display TEXT NOT NULL DEFAULT '',
      date_time TEXT NOT NULL DEFAULT '',
      sort_order INT NOT NULL DEFAULT 0,
      published BOOLEAN NOT NULL DEFAULT TRUE
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cms_links (
      id SERIAL PRIMARY KEY,
      section TEXT NOT NULL,
      label TEXT NOT NULL,
      href TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cms_logs (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      body_md TEXT NOT NULL DEFAULT '',
      cover_image_url TEXT,
      date_display TEXT NOT NULL DEFAULT '',
      date_time TEXT NOT NULL DEFAULT '',
      published BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    ALTER TABLE cms_logs
    ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0
  `;

  await sql`
    ALTER TABLE cms_research
    ADD COLUMN IF NOT EXISTS brief_url TEXT NOT NULL DEFAULT ''
  `;
  await sql`
    ALTER TABLE cms_research
    ADD COLUMN IF NOT EXISTS full_url TEXT NOT NULL DEFAULT ''
  `;

  await sql`
    UPDATE cms_site
    SET data = data || ${sql.json({
      phone: defaultSiteSettings.phone,
      address: defaultSiteSettings.address
    })},
        updated_at = NOW()
    WHERE id = 1
      AND (
        (data->>'phone' IS NULL OR trim(data->>'phone') = '')
        OR (data->>'address' IS NULL OR trim(data->>'address') = '')
        OR data->>'address' LIKE '122/C%'
        OR data->>'address' NOT LIKE '%Mangalpur%'
        OR data->>'address' LIKE '%Gujarat 390011, India%'
      )
  `;

  for (const [slug, urls] of Object.entries(RESEARCH_DOCUMENT_DEFAULTS)) {
    await sql`
      UPDATE cms_research
      SET brief_url = ${urls.briefUrl}, full_url = ${urls.fullUrl}
      WHERE slug = ${slug}
        AND (
          (brief_url = '' AND full_url = '')
          OR brief_url LIKE '/work/%'
          OR full_url LIKE '/work/%'
          OR brief_url = '/Shikhar_Shukla_Research.pdf'
          OR full_url = '/Shikhar_Shukla_Research.pdf'
        )
    `;
  }

  const presentationSlugs = [
    'surface-compliance',
    'surface-compliance-exit-arc',
    'youtube-thinking'
  ] as const;

  for (const slug of presentationSlugs) {
    const urls = RESEARCH_DOCUMENT_DEFAULTS[slug];
    if (!urls) continue;
    await sql`
      UPDATE cms_research
      SET
        brief_url = ${urls.briefUrl},
        full_url = ${urls.fullUrl},
        updated_at = NOW()
      WHERE slug = ${slug}
    `;
  }

  const youtube = RESEARCH_DOCUMENT_DEFAULTS['youtube-thinking'];
  const [{ nextOrder }] = await sql<{ nextOrder: number }[]>`
    SELECT COALESCE(MAX(sort_order), -1) + 1 AS "nextOrder" FROM cms_research
  `;

  await sql`
    INSERT INTO cms_research (
      slug,
      title,
      description,
      date_display,
      date_time,
      meta_line,
      body_mdx,
      sort_order,
      brief_url,
      full_url
    )
    VALUES (
      ${'youtube-thinking'},
      ${'YouTube — first-person UX analysis of attention, autoplay, and metacognitive hijacking'},
      ${''},
      ${'May 2026'},
      ${'2026-05'},
      ${''},
      ${'# YouTube — UX case study\n\nBrief and full Google Slides decks.\n'},
      ${nextOrder ?? 0},
      ${youtube.briefUrl},
      ${youtube.fullUrl}
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      date_display = EXCLUDED.date_display,
      date_time = EXCLUDED.date_time,
      brief_url = EXCLUDED.brief_url,
      full_url = EXCLUDED.full_url,
      updated_at = NOW()
  `;
}
