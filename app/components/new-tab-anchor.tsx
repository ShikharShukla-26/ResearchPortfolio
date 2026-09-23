import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import {
  isInternalAppPath,
  newTabLinkProps
} from '@/lib/new-tab-link';

type AnchorProps = ComponentPropsWithoutRef<'a'>;

export function NewTabAnchor({ href, children, ...props }: AnchorProps) {
  if (!href) {
    return <a {...props}>{children}</a>;
  }

  const tab = newTabLinkProps(href);

  if (isInternalAppPath(href)) {
    return (
      <Link href={href} {...props} {...tab}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...props} {...tab}>
      {children}
    </a>
  );
}
