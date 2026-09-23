import type { ComponentPropsWithoutRef } from 'react';
import { newTabLinkProps } from '@/lib/new-tab-link';

type AnchorProps = ComponentPropsWithoutRef<'a'>;

/** Native anchor only — avoids Next.js client router overriding target="_blank". */
export function NewTabAnchor({ href, children, ...props }: AnchorProps) {
  if (!href) {
    return <a {...props}>{children}</a>;
  }

  const tab = newTabLinkProps(href);

  return (
    <a href={href} {...props} {...tab}>
      {children}
    </a>
  );
}
