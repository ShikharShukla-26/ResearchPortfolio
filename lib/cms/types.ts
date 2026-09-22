export type SiteSettings = {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  substack: string;
  portfolio: string;
  resume: string;
  bioDefaultMd: string;
  bioLongMd: string;
};

export type ResearchItem = {
  id: number;
  slug: string;
  title: string;
  description: string;
  dateDisplay: string;
  dateTime: string;
  metaLine: string;
  bodyMdx: string;
  briefUrl: string;
  fullUrl: string;
  published: boolean;
  sortOrder: number;
};

export type WritingItem = {
  id: number;
  title: string;
  href: string;
  dateDisplay: string;
  dateTime: string;
  sortOrder: number;
  published: boolean;
};

export type CmsLink = {
  id: number;
  section: 'elsewhere' | 'footer';
  label: string;
  href: string;
  sortOrder: number;
};

export type LogEntry = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  bodyMd: string;
  coverImageUrl: string | null;
  dateDisplay: string;
  dateTime: string;
  published: boolean;
  sortOrder: number;
};

export type PortfolioData = {
  site: SiteSettings;
  research: Array<{
    slug: string;
    href: string;
    title: string;
    date: string;
    dateTime: string;
    briefUrl: string;
    fullUrl: string;
  }>;
  writing: Array<{
    href: string;
    title: string;
    date: string;
    dateTime: string;
  }>;
  elsewhere: Array<{ href: string; label: string }>;
  footer: Array<{ href: string; label: string }>;
  logs: Array<{
    href: string;
    title: string;
    date: string;
    dateTime: string;
    excerpt: string;
    coverImageUrl: string | null;
  }>;
};

export type ReorderKind = 'research' | 'writing' | 'logs' | 'links';
