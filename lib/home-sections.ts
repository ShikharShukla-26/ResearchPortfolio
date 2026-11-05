/** Featured on the homepage Selected Work section (operational diagnosis). */
export const FEATURED_RESEARCH_SLUGS = new Set([
  'surface-compliance',
  'surface-compliance-exit-arc',
  'six-week-silence'
]);

/** Featured on the homepage Writing section; remainder goes under Other Writing. */
export const FEATURED_WRITING_HREFS = new Set([
  'https://shikharshukla26.substack.com/p/research-project-001-the-six-week',
  'https://shikharshukla26.substack.com/p/counterfeit-certainty'
]);

export type HomeListItem = {
  href: string;
  title: string;
  date: string;
  dateTime: string;
  slug?: string;
};

export function splitResearch<T extends HomeListItem & { slug: string }>(
  items: T[]
): { featured: T[]; other: T[] } {
  const featured: T[] = [];
  const other: T[] = [];
  for (const item of items) {
    if (FEATURED_RESEARCH_SLUGS.has(item.slug)) {
      featured.push(item);
    } else {
      other.push(item);
    }
  }
  return { featured, other };
}

export function splitWriting<T extends HomeListItem>(items: T[]): {
  featured: T[];
  other: T[];
} {
  const featured: T[] = [];
  const other: T[] = [];
  for (const item of items) {
    if (FEATURED_WRITING_HREFS.has(item.href)) {
      featured.push(item);
    } else {
      other.push(item);
    }
  }
  return { featured, other };
}
