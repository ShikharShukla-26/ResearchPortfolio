import {
  elsewhere,
  research as staticResearch,
  site as staticSite,
  writing as staticWriting
} from '../../app/site-data';
import { defaultSiteSettings } from './defaults';
import { cmsEnabled } from './db';
import {
  listLinks,
  listLogs,
  listResearch,
  listWriting,
  getSiteSettings
} from './queries';
import type { PortfolioData, SiteSettings } from './types';

export async function getPortfolioData(): Promise<PortfolioData> {
  if (!cmsEnabled()) {
    return staticPortfolio();
  }

  let site: SiteSettings;
  try {
    site = await getSiteSettings();
  } catch {
    return staticPortfolio();
  }

  const [researchResult, writingResult, linksResult, logsResult] =
    await Promise.allSettled([
      listResearch(),
      listWriting(),
      listLinks(),
      listLogs()
    ]);

  const researchRows =
    researchResult.status === 'fulfilled' ? researchResult.value : [];
  const writingRows =
    writingResult.status === 'fulfilled' ? writingResult.value : [];
  const links =
    linksResult.status === 'fulfilled' ? linksResult.value : [];
  const logs = logsResult.status === 'fulfilled' ? logsResult.value : [];

  const elsewhereLinks = links
    .filter((l) => l.section === 'elsewhere')
    .map((l) => ({ href: l.href, label: l.label }));
  const footerLinks = links
    .filter((l) => l.section === 'footer')
    .map((l) => ({ href: l.href, label: l.label }));

  const fallback = staticPortfolio();

  return {
    site,
    research:
      researchResult.status === 'fulfilled'
        ? researchRows.map((r) => ({
            href: `/work/${r.slug}`,
            title: r.title,
            date: r.dateDisplay,
            dateTime: r.dateTime
          }))
        : fallback.research,
    writing:
      writingResult.status === 'fulfilled'
        ? writingRows.map((w) => ({
            href: w.href,
            title: w.title,
            date: w.dateDisplay,
            dateTime: w.dateTime
          }))
        : fallback.writing,
    elsewhere:
      linksResult.status === 'fulfilled'
        ? elsewhereLinks
        : fallback.elsewhere,
    footer:
      footerLinks.length > 0
        ? footerLinks
        : [
            { href: site.linkedin, label: 'LinkedIn' },
            { href: site.substack, label: 'Substack' },
            { href: `mailto:${site.email}`, label: 'Email' },
            { href: site.resume, label: 'Resume' }
          ],
    logs: logs.map((log) => ({
      href: `/logs/${log.slug}`,
      title: log.title,
      date: log.dateDisplay,
      dateTime: log.dateTime,
      excerpt: log.excerpt,
      coverImageUrl: log.coverImageUrl
    }))
  };
}

export async function getSiteSettingsSafe(): Promise<SiteSettings> {
  if (!cmsEnabled()) {
    return {
      ...defaultSiteSettings,
      name: staticSite.name,
      tagline: staticSite.tagline,
      email: staticSite.email,
      linkedin: staticSite.linkedin,
      substack: staticSite.substack,
      portfolio: staticSite.portfolio,
      resume: staticSite.resume
    };
  }
  try {
    return await getSiteSettings();
  } catch {
    return defaultSiteSettings;
  }
}

function staticPortfolio(): PortfolioData {
  return {
    site: {
      ...defaultSiteSettings,
      name: staticSite.name,
      tagline: staticSite.tagline,
      email: staticSite.email,
      linkedin: staticSite.linkedin,
      substack: staticSite.substack,
      portfolio: staticSite.portfolio,
      resume: staticSite.resume
    },
    research: staticResearch.map((r) => ({
      href: r.href,
      title: r.title,
      date: r.date,
      dateTime: r.dateTime
    })),
    writing: staticWriting.map((w) => ({
      href: w.href,
      title: w.title,
      date: w.date,
      dateTime: w.dateTime
    })),
    elsewhere: elsewhere.map((l) => ({ href: l.href, label: l.label })),
    footer: [
      { href: staticSite.linkedin, label: 'LinkedIn' },
      { href: staticSite.substack, label: 'Substack' },
      { href: `mailto:${staticSite.email}`, label: 'Email' },
      { href: staticSite.resume, label: 'Resume' }
    ],
    logs: []
  };
}
