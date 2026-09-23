export const NEW_TAB_LINK = {
  target: '_blank',
  rel: 'noopener noreferrer'
} as const;

export function shouldOpenInSameTab(href: string | undefined): boolean {
  if (!href) return true;
  const h = href.trim().toLowerCase();
  return (
    h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('#')
  );
}

export function isInternalAppPath(href: string): boolean {
  if (!href.startsWith('/')) return false;
  return !/\.(pdf|pptx|docx?|xlsx?|zip)$/i.test(href);
}

export function newTabLinkProps(href: string | undefined) {
  return shouldOpenInSameTab(href) ? {} : NEW_TAB_LINK;
}
