import { cmsEnabled } from '@/lib/cms/db';
import { getPortfolioData } from '@/lib/cms/get-data';
import { listResearch } from '@/lib/cms/queries';
import { promises as fs } from 'fs';
import path from 'path';

import { getSiteUrl } from '@/lib/site-url';

async function getSeedSlugs() {
  const seedDir = path.join(process.cwd(), 'content', 'seed');
  try {
    const files = await fs.readdir(seedDir);
    return files.filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''));
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const routes = [{ url: `${siteUrl}/`, lastModified: new Date().toISOString() }];

  let slugs: string[] = [];
  if (cmsEnabled()) {
    try {
      const research = await listResearch();
      slugs = research.map((r) => r.slug);
    } catch {
      slugs = await getSeedSlugs();
    }
  } else {
    slugs = await getSeedSlugs();
  }

  const work = slugs.map((slug) => ({
    url: `${siteUrl}/work/${slug}`,
    lastModified: new Date().toISOString()
  }));

  const data = await getPortfolioData();
  const logs = data.logs.map((log) => ({
    url: `${siteUrl}${log.href}`,
    lastModified: new Date().toISOString()
  }));

  if (data.logs.length > 0) {
    routes.push({
      url: `${siteUrl}/logs`,
      lastModified: new Date().toISOString()
    });
  }

  return [...routes, ...work, ...logs];
}
