import { getSql } from './db';
import type {
  CmsLink,
  LogEntry,
  ResearchItem,
  SiteSettings,
  WritingItem
} from './types';
import { defaultSiteSettings } from './defaults';

function mapResearch(row: Record<string, unknown>): ResearchItem {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    description: row.description as string,
    dateDisplay: row.date_display as string,
    dateTime: row.date_time as string,
    metaLine: row.meta_line as string,
    bodyMdx: row.body_mdx as string,
    published: row.published as boolean,
    sortOrder: row.sort_order as number
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const sql = getSql();
  const rows = await sql<{ data: SiteSettings }[]>`
    SELECT data FROM cms_site WHERE id = 1
  `;
  if (!rows[0]?.data) {
    return defaultSiteSettings;
  }
  return { ...defaultSiteSettings, ...rows[0].data };
}

export async function updateSiteSettings(data: SiteSettings) {
  const sql = getSql();
  await sql`
    INSERT INTO cms_site (id, data, updated_at)
    VALUES (1, ${sql.json(data)}, NOW())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;
}

export async function listResearch(includeDrafts = false) {
  const sql = getSql();
  const rows = includeDrafts
    ? await sql`SELECT * FROM cms_research ORDER BY sort_order ASC, id ASC`
    : await sql`
        SELECT * FROM cms_research
        WHERE published = TRUE
        ORDER BY sort_order ASC, id ASC
      `;
  return rows.map(mapResearch);
}

export async function getResearchBySlug(slug: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM cms_research WHERE slug = ${slug} AND published = TRUE LIMIT 1
  `;
  return rows[0] ? mapResearch(rows[0]) : null;
}

export async function getResearchById(id: number) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM cms_research WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapResearch(rows[0]) : null;
}

export async function createResearch(input: Omit<ResearchItem, 'id'>) {
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO cms_research (
      slug, title, description, date_display, date_time, meta_line, body_mdx, published, sort_order
    ) VALUES (
      ${input.slug},
      ${input.title},
      ${input.description},
      ${input.dateDisplay},
      ${input.dateTime},
      ${input.metaLine},
      ${input.bodyMdx},
      ${input.published},
      ${input.sortOrder}
    )
    RETURNING *
  `;
  return mapResearch(row);
}

export async function updateResearch(id: number, input: Partial<ResearchItem>) {
  const sql = getSql();
  const existing = await getResearchById(id);
  if (!existing) return null;
  const merged = { ...existing, ...input, id };
  const [row] = await sql`
    UPDATE cms_research SET
      slug = ${merged.slug},
      title = ${merged.title},
      description = ${merged.description},
      date_display = ${merged.dateDisplay},
      date_time = ${merged.dateTime},
      meta_line = ${merged.metaLine},
      body_mdx = ${merged.bodyMdx},
      published = ${merged.published},
      sort_order = ${merged.sortOrder},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return mapResearch(row);
}

export async function deleteResearch(id: number) {
  const sql = getSql();
  await sql`DELETE FROM cms_research WHERE id = ${id}`;
}

export async function listWriting(includeDrafts = false) {
  const sql = getSql();
  const rows = includeDrafts
    ? await sql`SELECT * FROM cms_writing ORDER BY sort_order ASC, id ASC`
    : await sql`
        SELECT * FROM cms_writing
        WHERE published = TRUE
        ORDER BY sort_order ASC, id ASC
      `;
  return rows.map(
    (row): WritingItem => ({
      id: row.id as number,
      title: row.title as string,
      href: row.href as string,
      dateDisplay: row.date_display as string,
      dateTime: row.date_time as string,
      sortOrder: row.sort_order as number,
      published: row.published as boolean
    })
  );
}

export async function createWriting(input: Omit<WritingItem, 'id'>) {
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO cms_writing (title, href, date_display, date_time, sort_order, published)
    VALUES (${input.title}, ${input.href}, ${input.dateDisplay}, ${input.dateTime}, ${input.sortOrder}, ${input.published})
    RETURNING *
  `;
  return row;
}

export async function updateWriting(id: number, input: Partial<WritingItem>) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM cms_writing WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return;
  const row = rows[0];
  await sql`
    UPDATE cms_writing SET
      title = ${input.title ?? (row.title as string)},
      href = ${input.href ?? (row.href as string)},
      date_display = ${input.dateDisplay ?? (row.date_display as string)},
      date_time = ${input.dateTime ?? (row.date_time as string)},
      sort_order = ${input.sortOrder ?? (row.sort_order as number)},
      published = ${input.published ?? (row.published as boolean)}
    WHERE id = ${id}
  `;
}

export async function deleteWriting(id: number) {
  const sql = getSql();
  await sql`DELETE FROM cms_writing WHERE id = ${id}`;
}

export async function listLinks(section?: CmsLink['section']) {
  const sql = getSql();
  const rows = section
    ? await sql`
        SELECT * FROM cms_links WHERE section = ${section} ORDER BY sort_order ASC, id ASC
      `
    : await sql`SELECT * FROM cms_links ORDER BY section ASC, sort_order ASC, id ASC`;
  return rows.map(
    (row): CmsLink => ({
      id: row.id as number,
      section: row.section as CmsLink['section'],
      label: row.label as string,
      href: row.href as string,
      sortOrder: row.sort_order as number
    })
  );
}

export async function replaceLinks(section: CmsLink['section'], links: Omit<CmsLink, 'id' | 'section'>[]) {
  const sql = getSql();
  await sql.begin(async (tx) => {
    await tx`DELETE FROM cms_links WHERE section = ${section}`;
    let order = 0;
    for (const link of links) {
      await tx`
        INSERT INTO cms_links (section, label, href, sort_order)
        VALUES (${section}, ${link.label}, ${link.href}, ${order})
      `;
      order += 1;
    }
  });
}

function mapLog(row: Record<string, unknown>): LogEntry {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    bodyMd: row.body_md as string,
    coverImageUrl: (row.cover_image_url as string | null) ?? null,
    dateDisplay: row.date_display as string,
    dateTime: row.date_time as string,
    published: row.published as boolean
  };
}

export async function listLogs(includeDrafts = false) {
  const sql = getSql();
  const rows = includeDrafts
    ? await sql`SELECT * FROM cms_logs ORDER BY date_time DESC, id DESC`
    : await sql`
        SELECT * FROM cms_logs
        WHERE published = TRUE
        ORDER BY date_time DESC, id DESC
      `;
  return rows.map(mapLog);
}

export async function getLogBySlug(slug: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM cms_logs WHERE slug = ${slug} AND published = TRUE LIMIT 1
  `;
  return rows[0] ? mapLog(rows[0]) : null;
}

export async function getLogById(id: number) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM cms_logs WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapLog(rows[0]) : null;
}

export async function createLog(input: Omit<LogEntry, 'id'>) {
  const sql = getSql();
  const [row] = await sql`
    INSERT INTO cms_logs (
      slug, title, excerpt, body_md, cover_image_url, date_display, date_time, published
    ) VALUES (
      ${input.slug},
      ${input.title},
      ${input.excerpt},
      ${input.bodyMd},
      ${input.coverImageUrl},
      ${input.dateDisplay},
      ${input.dateTime},
      ${input.published}
    )
    RETURNING *
  `;
  return mapLog(row);
}

export async function updateLog(id: number, input: Partial<LogEntry>) {
  const sql = getSql();
  const existing = await getLogById(id);
  if (!existing) return null;
  const merged = { ...existing, ...input, id };
  const [row] = await sql`
    UPDATE cms_logs SET
      slug = ${merged.slug},
      title = ${merged.title},
      excerpt = ${merged.excerpt},
      body_md = ${merged.bodyMd},
      cover_image_url = ${merged.coverImageUrl},
      date_display = ${merged.dateDisplay},
      date_time = ${merged.dateTime},
      published = ${merged.published},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return mapLog(row);
}

export async function deleteLog(id: number) {
  const sql = getSql();
  await sql`DELETE FROM cms_logs WHERE id = ${id}`;
}
