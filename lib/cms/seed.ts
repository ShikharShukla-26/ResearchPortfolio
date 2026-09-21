import { promises as fs } from 'fs';
import path from 'path';
import {
  elsewhere,
  research as staticResearch,
  site,
  writing as staticWriting
} from '../../app/site-data';
import { defaultSiteSettings } from './defaults';
import { getSql } from './db';

function parseMdxMetadata(raw: string) {
  const title =
    raw.match(/title:\s*'((?:\\'|[^'])*)'/)?.[1]?.replace(/\\'/g, "'") ??
    raw.match(/title:\s*"((?:\\"|[^"])*)"/)?.[1]?.replace(/\\"/g, '"') ??
    '';
  const description =
    raw.match(/description:\s*\n?\s*'((?:\\'|[^'])*)'/)?.[1]?.replace(/\\'/g, "'") ??
    raw.match(/description:\s*\n?\s*"((?:\\"|[^"])*)"/)?.[1]?.replace(/\\"/g, '"') ??
    '';
  const bodyMdx = raw.replace(/export const metadata = \{[\s\S]*?\};\n\n?/, '');
  const metaLine =
    bodyMdx.match(/<Meta>([\s\S]*?)<\/Meta>/)?.[1]?.trim() ?? '';
  return { title, description, bodyMdx, metaLine };
}

export async function seedIfEmpty() {
  const sql = getSql();
  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM cms_research
  `;

  if (Number(count) > 0) {
    return { seeded: false };
  }

  await sql`
    INSERT INTO cms_site (id, data)
    VALUES (1, ${sql.json(defaultSiteSettings)})
    ON CONFLICT (id) DO NOTHING
  `;

  const seedDir = path.join(process.cwd(), 'content', 'seed');
  let order = 0;
  for (const item of staticResearch) {
    const slug = item.href.replace(/^\/work\//, '');
    const filePath = path.join(seedDir, `${slug}.mdx`);
    let title: string = item.title;
    let description = '';
    let bodyMdx = `# ${item.title}\n\n`;
    let metaLine = '';

    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = parseMdxMetadata(raw);
      title = parsed.title || item.title;
      description = parsed.description;
      bodyMdx = parsed.bodyMdx;
      metaLine = parsed.metaLine;
    } catch {
      /* use list metadata only */
    }

    await sql`
      INSERT INTO cms_research (
        slug, title, description, date_display, date_time, meta_line, body_mdx, sort_order
      ) VALUES (
        ${slug},
        ${title},
        ${description},
        ${item.date},
        ${item.dateTime},
        ${metaLine},
        ${bodyMdx},
        ${order}
      )
    `;
    order += 1;
  }

  order = 0;
  for (const item of staticWriting) {
    await sql`
      INSERT INTO cms_writing (title, href, date_display, date_time, sort_order)
      VALUES (${item.title}, ${item.href}, ${item.date}, ${item.dateTime}, ${order})
    `;
    order += 1;
  }

  order = 0;
  for (const link of elsewhere) {
    await sql`
      INSERT INTO cms_links (section, label, href, sort_order)
      VALUES ('elsewhere', ${link.label}, ${link.href}, ${order})
    `;
    order += 1;
  }

  const footerLinks = [
    { label: 'LinkedIn', href: site.linkedin },
    { label: 'Substack', href: site.substack },
    { label: 'Email', href: `mailto:${site.email}` },
    { label: 'Resume', href: site.resume }
  ];
  order = 0;
  for (const link of footerLinks) {
    await sql`
      INSERT INTO cms_links (section, label, href, sort_order)
      VALUES ('footer', ${link.label}, ${link.href}, ${order})
    `;
    order += 1;
  }

  return { seeded: true };
}

export async function bootstrapCms() {
  await runMigrationsFromSeed();
  return seedIfEmpty();
}

async function runMigrationsFromSeed() {
  const { runMigrations } = await import('./migrate');
  await runMigrations();
}
