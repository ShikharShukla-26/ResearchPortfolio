'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  researchHasVersionChoice,
  researchSingleExternalUrl
} from '@/lib/cms/research-document-urls';
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

  function openExternal(url: string) {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    close();
  }

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
              <button
                key={item.href}
                type="button"
                className="blog-row blog-row-button"
                onClick={() => openExternal(singleUrl)}
              >
                <span>{item.title}</span>
                <time dateTime={item.dateTime}>{item.date}</time>
              </button>
            );
          }

          return (
            <a key={item.href} className="blog-row" href={item.href}>
              <span>{item.title}</span>
              <time dateTime={item.dateTime}>{item.date}</time>
            </a>
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
              <button
                type="button"
                className="research-modal-btn"
                disabled={!active.briefUrl}
                onClick={() => openExternal(active.briefUrl)}
              >
                Brief version
              </button>
              <button
                type="button"
                className="research-modal-btn primary"
                disabled={!active.fullUrl}
                onClick={() => openExternal(active.fullUrl)}
              >
                Full version
              </button>
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
