'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SiteSettings } from '@/lib/cms/types';
import './research-modal.css';
import './contact-modal.css';

function phoneTel(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits ? `tel:+${digits.replace(/^0/, '')}` : '';
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ContactFooter({ site }: { site: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setCopied(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  async function onCopy(label: string, value: string) {
    const ok = await copyText(value);
    if (ok) {
      setCopied(label);
      window.setTimeout(() => setCopied((c) => (c === label ? null : c)), 2000);
    }
  }

  const tel = phoneTel(site.phone);

  const rows = [
    site.email
      ? {
          label: 'Email',
          value: site.email,
          href: `mailto:${site.email}`,
          copy: site.email
        }
      : null,
    site.phone
      ? {
          label: 'Phone',
          value: site.phone,
          href: tel || undefined,
          copy: site.phone
        }
      : null,
    site.address
      ? {
          label: 'Address',
          value: site.address,
          href: undefined,
          copy: site.address
        }
      : null
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    href?: string;
    copy: string;
  }>;

  return (
    <>
      <button
        type="button"
        className="text-nav site-footer-contact-btn"
        onClick={() => setOpen(true)}
      >
        Contact
      </button>

      {open ? (
        <div
          className="research-modal-backdrop"
          role="presentation"
          onClick={close}
        >
          <div
            className="research-modal contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="contact-modal-title" className="research-modal-title">
              Contact
            </h3>
            <p className="research-modal-hint">
              Tap to open or use Copy.
            </p>
            <ul className="contact-modal-list">
              {rows.map((row) => (
                <li key={row.label} className="contact-modal-row">
                  <span className="contact-modal-label">{row.label}</span>
                  <div className="contact-modal-value-wrap">
                    {row.href ? (
                      <a
                        className="contact-modal-value"
                        href={row.href}
                        target={row.href.startsWith('mailto:') ? undefined : undefined}
                        rel={row.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {row.value}
                      </a>
                    ) : (
                      <span className="contact-modal-value">{row.value}</span>
                    )}
                    <button
                      type="button"
                      className="contact-modal-copy"
                      onClick={() => void onCopy(row.label, row.copy)}
                    >
                      {copied === row.label ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="research-modal-cancel"
              onClick={close}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
