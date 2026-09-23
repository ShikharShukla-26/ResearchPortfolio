'use client';

import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { newTabLinkProps, shouldOpenInSameTab } from '@/lib/new-tab-link';

type AnchorProps = ComponentPropsWithoutRef<'a'>;

function openInNewTab(anchor: HTMLAnchorElement) {
  window.open(anchor.href, '_blank', 'noopener,noreferrer');
}

/** Native anchor with reliable new-tab behavior (incl. same-origin PDFs). */
export function NewTabAnchor({
  href,
  children,
  onClick,
  ...props
}: AnchorProps) {
  if (!href) {
    return <a {...props}>{children}</a>;
  }

  const tab = newTabLinkProps(href);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (shouldOpenInSameTab(href)) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    openInNewTab(event.currentTarget);
  }

  return (
    <a href={href} {...props} {...tab} onClick={handleClick}>
      {children}
    </a>
  );
}
