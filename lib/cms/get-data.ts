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

  try {
    const [site, researchRows, writingRows, links, logs] = await Promise.all([
      getSiteSettings(),
      listResearch(),
      listWriting(),
      listLinks(),
      listLogs()
    ]);

    const elsewhereLinks = links
      .filter((l) => l.section === 'elsewhere')
      .map((l) => ({ href: l.href, label: l.label }));
    const footerLinks = links
      .filter((l) => l.section === 'footer')
      .map((l) => ({ href: l.href, label: l.label }));

    return {
      site,
      research: researchRows.map((r) => ({
        href: `/work/${r.slug}`,
        title: r.title,
        date: r.dateDisplay,
        dateTime: r.dateTime
      })),
      writing: writingRows.map((w) => ({
        href: w.href,
        title: w.title,
        date: w.dateDisplay,
        dateTime: w.dateTime
      })),
      elsewhere:
        elsewhereLinks.length > 0
          ? elsewhereLinks
          : elsewhere.map((l) => ({ href: l.href, label: l.label })),
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
  } catch {
    return staticPortfolio();
  }
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
