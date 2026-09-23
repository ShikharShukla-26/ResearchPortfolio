'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  researchHasVersionChoice,
  researchSingleExternalUrl
} from '@/lib/cms/research-document-urls';
import { NewTabAnchor } from '@/app/components/new-tab-anchor';
import './research-modal.css';

export type ResearchListItem = {
  slug: string;
  href: string;
  title: string;
  date: string;
  dateTime: string;
  briefUrl: string;
  fullUrl: string;
};

export function ResearchList({ items }: { items: ResearchListItem[] }) {
  const [active, setActive] = useState<ResearchListItem | null>(null);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close]);

  return (
    <>
      <div className="blogs-list">
        {items.map((item) => {
          const showModal = researchHasVersionChoice(
            item.briefUrl,
            item.fullUrl
          );
          const singleUrl = researchSingleExternalUrl(
            item.briefUrl,
            item.fullUrl
          );

          if (showModal) {
            return (
              <button
                key={item.href}
                type="button"
                className="blog-row blog-row-button"
                onClick={() => setActive(item)}
              >
                <span>{item.title}</span>
                <time dateTime={item.dateTime}>{item.date}</time>
              </button>
            );
          }

          if (singleUrl) {
            return (
              <NewTabAnchor
                key={item.href}
                className="blog-row"
                href={singleUrl}
              >
                <span>{item.title}</span>
                <time dateTime={item.dateTime}>{item.date}</time>
              </NewTabAnchor>
            );
          }

          return (
            <NewTabAnchor key={item.href} className="blog-row" href={item.href}>
              <span>{item.title}</span>
              <time dateTime={item.dateTime}>{item.date}</time>
            </NewTabAnchor>
          );
        })}
      </div>

      {active ? (
        <div
          className="research-modal-backdrop"
          role="presentation"
          onClick={close}
        >
          <div
            className="research-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="research-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="research-modal-title" className="research-modal-title">
              {active.title}
            </h3>
            <p className="research-modal-hint">Choose a version to open.</p>
            <div className="research-modal-actions">
              {active.briefUrl ? (
                <NewTabAnchor
                  className="research-modal-btn"
                  href={active.briefUrl}
                  onClick={close}
                >
                  Brief version
                </NewTabAnchor>
              ) : (
                <span className="research-modal-btn" aria-disabled="true">
                  Brief version
                </span>
              )}
              {active.fullUrl ? (
                <NewTabAnchor
                  className="research-modal-btn primary"
                  href={active.fullUrl}
                  onClick={close}
                >
                  Full version
                </NewTabAnchor>
              ) : (
                <span
                  className="research-modal-btn primary"
                  aria-disabled="true"
                >
                  Full version
                </span>
              )}
            </div>
            <button type="button" className="research-modal-cancel" onClick={close}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
