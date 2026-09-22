'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { SortableList } from './sortable-list';
import type {
  CmsLink,
  LogEntry,
  ResearchItem,
  ReorderKind,
  SiteSettings,
  WritingItem
} from '@/lib/cms/types';
import { normalizeSlug } from '@/lib/cms/slug';

type Tab = 'site' | 'research' | 'writing' | 'links' | 'logs';

async function readJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function uploadImage(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  const data = (await res.json()) as { url: string };
  return data.url;
}

const emptyResearch = (): Omit<ResearchItem, 'id'> => ({
  slug: '',
  title: '',
  description: '',
  dateDisplay: '',
  dateTime: '',
  metaLine: '',
  bodyMdx: '# New case study\n\n<Meta>Method · Date</Meta>\n',
  briefUrl: '',
  fullUrl: '',
  published: true,
  sortOrder: 0
});

const emptyLog = (): Omit<LogEntry, 'id'> => ({
  slug: '',
  title: '',
  excerpt: '',
  bodyMd: '',
  coverImageUrl: null,
  dateDisplay: '',
  dateTime: '',
  published: true,
  sortOrder: 0
});

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('site');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const [site, setSite] = useState<SiteSettings | null>(null);
  const [research, setResearch] = useState<ResearchItem[]>([]);
  const [writing, setWriting] = useState<WritingItem[]>([]);
  const [links, setLinks] = useState<CmsLink[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [researchDraft, setResearchDraft] = useState<ResearchItem | null>(null);
  const [logDraft, setLogDraft] = useState<LogEntry | null>(null);

  const loadAll = useCallback(async () => {
    setError('');
    const [siteData, researchData, writingData, linksData, logsData] =
      await Promise.all([
        readJson<SiteSettings>('/api/admin/site'),
        readJson<ResearchItem[]>('/api/admin/research'),
        readJson<WritingItem[]>('/api/admin/writing'),
        readJson<CmsLink[]>('/api/admin/links'),
        readJson<LogEntry[]>('/api/admin/logs')
      ]);
    setSite(siteData);
    setResearch(researchData);
    setWriting(writingData);
    setLinks(linksData);
    setLogs(logsData);
  }, []);

  useEffect(() => {
    void loadAll().catch((err: Error) => setError(err.message));
  }, [loadAll]);

  async function runAction(label: string, action: () => Promise<void>) {
    setError('');
    setStatus(label);
    try {
      await action();
    } catch (err) {
      setStatus('');
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  }

  async function persistReorder(
    kind: ReorderKind,
    ordered: Array<{ id: number }>,
    section?: CmsLink['section']
  ) {
    await runAction('Updating order…', async () => {
      try {
        await readJson('/api/admin/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind,
            ids: ordered.map((item) => item.id),
            section
          })
        });
      } catch (err) {
        await loadAll();
        throw err;
      }
      setStatus('Order updated.');
    });
  }

  async function saveSite() {
    if (!site) return;
    setStatus('Saving site…');
    setError('');
    try {
      await readJson('/api/admin/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site)
      });
      await loadAll();
      setStatus('Site saved. Open the homepage in a new tab to confirm changes.');
    } catch (err) {
      setStatus('');
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }

  async function saveResearch() {
    if (!researchDraft) return;
    const slug = normalizeSlug(researchDraft.slug);
    if (!slug) {
      setError('Slug is required — use a short URL segment like my-case-study');
      return;
    }
    await runAction('Saving research…', async () => {
      const payload = { ...researchDraft, slug };
      if (payload.id) {
        await readJson(`/api/admin/research/${payload.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const { id: _id, ...createPayload } = payload;
        await readJson('/api/admin/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload)
        });
      }
      await loadAll();
      setResearchDraft(null);
      setStatus(
        payload.published
          ? 'Research saved. It should appear on the homepage within a few seconds.'
          : 'Research saved as draft — check Published to show it on the homepage.'
      );
    });
  }

  async function deleteResearchItem(id: number) {
    if (!confirm('Delete this case study permanently?')) return;
    await runAction('Deleting research…', async () => {
      await readJson(`/api/admin/research/${id}`, { method: 'DELETE' });
      if (researchDraft?.id === id) setResearchDraft(null);
      await loadAll();
      setStatus('Research deleted.');
    });
  }

  async function saveWritingItem(item: WritingItem) {
    await runAction('Saving writing…', async () => {
      await readJson(`/api/admin/writing/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      await loadAll();
      setStatus('Writing saved.');
    });
  }

  async function deleteWritingItem(id: number) {
    if (!confirm('Delete this writing link?')) return;
    await runAction('Deleting writing…', async () => {
      await readJson(`/api/admin/writing/${id}`, { method: 'DELETE' });
      await loadAll();
      setStatus('Writing deleted.');
    });
  }

  async function addWritingItem() {
    await runAction('Adding writing…', async () => {
      await readJson('/api/admin/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New essay',
          href: 'https://',
          dateDisplay: '',
          dateTime: '',
          sortOrder: writing.length,
          published: true
        })
      });
      await loadAll();
      setStatus('Writing item added.');
    });
  }

  async function saveLinks(section: CmsLink['section']) {
    const sectionLinks = links
      .filter((l) => l.section === section)
      .map(({ label, href }, index) => ({ label, href, sortOrder: index }));
    await runAction('Saving links…', async () => {
      await readJson('/api/admin/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, links: sectionLinks })
      });
      await loadAll();
      setStatus('Links saved.');
    });
  }

  async function addLink(section: CmsLink['section']) {
    await runAction('Adding link…', async () => {
      await readJson('/api/admin/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          label: 'New link',
          href: 'https://',
          sortOrder: links.filter((l) => l.section === section).length
        })
      });
      await loadAll();
      setStatus('Link added.');
    });
  }

  async function deleteLinkItem(id: number) {
    if (!confirm('Delete this link?')) return;
    await runAction('Deleting link…', async () => {
      await readJson(`/api/admin/links/${id}`, { method: 'DELETE' });
      await loadAll();
      setStatus('Link deleted.');
    });
  }

  async function saveLog() {
    if (!logDraft) return;
    await runAction('Saving log…', async () => {
      if (logDraft.id) {
        await readJson(`/api/admin/logs/${logDraft.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logDraft)
        });
      } else {
        const { id: _id, ...createPayload } = logDraft;
        await readJson('/api/admin/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload)
        });
      }
      await loadAll();
      setLogDraft(null);
      setStatus('Log saved.');
    });
  }

  async function deleteLogItem(id: number) {
    if (!confirm('Delete this log permanently?')) return;
    await runAction('Deleting log…', async () => {
      await readJson(`/api/admin/logs/${id}`, { method: 'DELETE' });
      if (logDraft?.id === id) setLogDraft(null);
      await loadAll();
      setStatus('Log deleted.');
    });
  }

  async function insertImageInto(
    field: 'bodyMdx' | 'bodyMd',
    setter: (value: string) => void,
    current: string
  ) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setStatus('Uploading image…');
      try {
        const url = await uploadImage(file);
        const snippet =
          field === 'bodyMd'
            ? `\n\n![Image description](${url})\n\n`
            : `\n\n![Image description](${url})\n\n`;
        setter(current + snippet);
        setStatus('Image uploaded and inserted.');
      } catch {
        setError('Image upload failed.');
      }
    };
    input.click();
  }

  async function cleanupTestData() {
    if (
      !confirm(
        'Remove E2E test rows (e2e-* slugs, "New link", "New essay" placeholders)?'
      )
    ) {
      return;
    }
    await runAction('Removing test data…', async () => {
      await readJson<{ removed: Record<string, number> }>(
        '/api/admin/cleanup-test-data',
        { method: 'POST' }
      );
      await loadAll();
      setStatus('Test data removed. Refresh the homepage.');
    });
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>Portfolio admin</h1>
          <p className="admin-hint">Changes publish immediately on save.</p>
        </div>
        <div className="admin-actions">
          <a href="/" className="text-nav">
            View site
          </a>
          <button type="button" onClick={() => void cleanupTestData()}>
            Remove test junk
          </button>
          <button type="button" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </header>

      <div className="admin-tabs" role="tablist">
        {(
          [
            ['site', 'Site & bios'],
            ['research', 'Research'],
            ['writing', 'Writing'],
            ['links', 'Links & social'],
            ['logs', 'Logs']
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {status ? <p className="admin-status">{status}</p> : null}
      {error ? <p className="admin-error">{error}</p> : null}

      {tab === 'site' && site ? (
        <div className="admin-card admin-grid">
          <div className="admin-grid admin-grid-2">
            <div className="admin-field">
              <label>Name</label>
              <input
                value={site.name}
                onChange={(e) => setSite({ ...site, name: e.target.value })}
              />
            </div>
            <div className="admin-field">
              <label>Email</label>
              <input
                value={site.email}
                onChange={(e) => setSite({ ...site, email: e.target.value })}
              />
            </div>
            <div className="admin-field">
              <label>LinkedIn URL</label>
              <input
                value={site.linkedin}
                onChange={(e) =>
                  setSite({ ...site, linkedin: e.target.value })
                }
              />
            </div>
            <div className="admin-field">
              <label>Substack URL</label>
              <input
                value={site.substack}
                onChange={(e) =>
                  setSite({ ...site, substack: e.target.value })
                }
              />
            </div>
            <div className="admin-field">
              <label>Portfolio URL</label>
              <input
                value={site.portfolio}
                onChange={(e) =>
                  setSite({ ...site, portfolio: e.target.value })
                }
              />
            </div>
            <div className="admin-field">
              <label>Resume path or URL</label>
              <input
                value={site.resume}
                onChange={(e) => setSite({ ...site, resume: e.target.value })}
              />
            </div>
          </div>
          <div className="admin-field">
            <label>Tagline / description</label>
            <textarea
              value={site.tagline}
              onChange={(e) => setSite({ ...site, tagline: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label>Default bio (Markdown)</label>
            <textarea
              value={site.bioDefaultMd}
              onChange={(e) =>
                setSite({ ...site, bioDefaultMd: e.target.value })
              }
            />
          </div>
          <div className="admin-field">
            <label>Long bio (Markdown)</label>
            <textarea
              value={site.bioLongMd}
              onChange={(e) => setSite({ ...site, bioLongMd: e.target.value })}
            />
          </div>
          <div className="admin-actions">
            <button type="button" className="primary" onClick={() => void saveSite()}>
              Save site & bios
            </button>
          </div>
        </div>
      ) : null}

      {tab === 'research' ? (
        <div className="admin-grid">
          <div className="admin-card">
            <div className="admin-actions">
              <button
                type="button"
                className="primary"
                onClick={() =>
                  setResearchDraft({
                    id: 0,
                    ...emptyResearch(),
                    sortOrder: research.length
                  })
                }
              >
                New case study
              </button>
            </div>
            <SortableList
              items={research}
              onReorder={(next) => {
                setResearch(next);
                void persistReorder('research', next);
              }}
              renderItem={(item) => (
                <>
                  <div>
                    <strong>{item.title}</strong>
                    <div className="admin-hint">
                      /work/{item.slug}
                      {!item.published ? ' · draft' : ''}
                    </div>
                  </div>
                  <div className="admin-row-actions">
                    <button type="button" onClick={() => setResearchDraft(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => void deleteResearchItem(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            />
          </div>

          {researchDraft ? (
            <div className="admin-card admin-grid">
              {!researchDraft.published ? (
                <p className="admin-draft-banner" role="status">
                  Draft — this case study is hidden from the public Research list until
                  Published is checked.
                </p>
              ) : null}
              <div className="admin-grid admin-grid-2">
                <div className="admin-field">
                  <label>Slug (URL segment)</label>
                  <input
                    value={researchDraft.slug}
                    placeholder="my-case-study"
                    onChange={(e) =>
                      setResearchDraft({ ...researchDraft, slug: e.target.value })
                    }
                  />
                  <p className="admin-hint" style={{ marginTop: '0.35rem' }}>
                    Public URL: /work/{normalizeSlug(researchDraft.slug) || '…'}
                  </p>
                </div>
              </div>
              <div className="admin-field">
                <label>Meta line (optional, shown under title on page)</label>
                <input
                  value={researchDraft.metaLine}
                  onChange={(e) =>
                    setResearchDraft({
                      ...researchDraft,
                      metaLine: e.target.value
                    })
                  }
                />
              </div>
              <div className="admin-field">
                <label>Title</label>
                <input
                  value={researchDraft.title}
                  onChange={(e) =>
                    setResearchDraft({ ...researchDraft, title: e.target.value })
                  }
                />
              </div>
              <div className="admin-field">
                <label>SEO description</label>
                <textarea
                  value={researchDraft.description}
                  onChange={(e) =>
                    setResearchDraft({
                      ...researchDraft,
                      description: e.target.value
                    })
                  }
                />
              </div>
              <div className="admin-grid admin-grid-2">
                <div className="admin-field">
                  <label>Date (display)</label>
                  <input
                    value={researchDraft.dateDisplay}
                    onChange={(e) =>
                      setResearchDraft({
                        ...researchDraft,
                        dateDisplay: e.target.value
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Date (ISO-ish)</label>
                  <input
                    value={researchDraft.dateTime}
                    onChange={(e) =>
                      setResearchDraft({
                        ...researchDraft,
                        dateTime: e.target.value
                      })
                    }
                  />
                </div>
              </div>
              <div className="admin-grid admin-grid-2">
                <div className="admin-field">
                  <label>Brief version URL</label>
                  <input
                    value={researchDraft.briefUrl}
                    placeholder="https://drive.google.com/… or /file.pdf"
                    onChange={(e) =>
                      setResearchDraft({
                        ...researchDraft,
                        briefUrl: e.target.value
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Full version URL</label>
                  <input
                    value={researchDraft.fullUrl}
                    placeholder="https://drive.google.com/… or /file.pdf"
                    onChange={(e) =>
                      setResearchDraft({
                        ...researchDraft,
                        fullUrl: e.target.value
                      })
                    }
                  />
                </div>
              </div>
              <p className="admin-hint">
                Two different Brief and Full URLs show a chooser on the homepage; leave
                Brief empty for a single direct link. /work/[slug] redirects to Full.
              </p>
              <div className="admin-field">
                <label>Body (MDX — supports Meta, Callout, Table components)</label>
                <textarea
                  value={researchDraft.bodyMdx}
                  onChange={(e) =>
                    setResearchDraft({
                      ...researchDraft,
                      bodyMdx: e.target.value
                    })
                  }
                  style={{ minHeight: 320 }}
                />
              </div>
              <div className="admin-actions">
                <button
                  type="button"
                  onClick={() =>
                    void insertImageInto(
                      'bodyMdx',
                      (value) =>
                        setResearchDraft((draft) =>
                          draft ? { ...draft, bodyMdx: value } : draft
                        ),
                      researchDraft.bodyMdx
                    )
                  }
                >
                  Upload image into body
                </button>
                <label className="admin-hint">
                  <input
                    type="checkbox"
                    checked={researchDraft.published}
                    onChange={(e) =>
                      setResearchDraft({
                        ...researchDraft,
                        published: e.target.checked
                      })
                    }
                  />{' '}
                  Published
                </label>
                <button type="button" className="primary" onClick={() => void saveResearch()}>
                  Save research
                </button>
                {researchDraft.id ? (
                  <button
                    type="button"
                    className="danger"
                    onClick={() => void deleteResearchItem(researchDraft.id)}
                  >
                    Delete
                  </button>
                ) : null}
                <button type="button" onClick={() => setResearchDraft(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === 'writing' ? (
        <div className="admin-card admin-grid">
          <div className="admin-actions">
            <button type="button" className="primary" onClick={() => void addWritingItem()}>
              Add writing link
            </button>
          </div>
          <SortableList
            items={writing}
            onReorder={(next) => {
              setWriting(next);
              void persistReorder('writing', next);
            }}
            renderItem={(item) => (
              <div className="admin-grid admin-grid-2" style={{ width: '100%' }}>
                <div className="admin-field">
                  <label>Title</label>
                  <input
                    value={item.title}
                    onChange={(e) =>
                      setWriting((rows) =>
                        rows.map((row) =>
                          row.id === item.id ? { ...row, title: e.target.value } : row
                        )
                      )
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>URL</label>
                  <input
                    value={item.href}
                    onChange={(e) =>
                      setWriting((rows) =>
                        rows.map((row) =>
                          row.id === item.id ? { ...row, href: e.target.value } : row
                        )
                      )
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Date (display)</label>
                  <input
                    value={item.dateDisplay}
                    onChange={(e) =>
                      setWriting((rows) =>
                        rows.map((row) =>
                          row.id === item.id
                            ? { ...row, dateDisplay: e.target.value }
                            : row
                        )
                      )
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Date (ISO-ish)</label>
                  <input
                    value={item.dateTime}
                    onChange={(e) =>
                      setWriting((rows) =>
                        rows.map((row) =>
                          row.id === item.id
                            ? { ...row, dateTime: e.target.value }
                            : row
                        )
                      )
                    }
                  />
                </div>
                <label className="admin-hint">
                  <input
                    type="checkbox"
                    checked={item.published}
                    onChange={(e) =>
                      setWriting((rows) =>
                        rows.map((row) =>
                          row.id === item.id
                            ? { ...row, published: e.target.checked }
                            : row
                        )
                      )
                    }
                  />{' '}
                  Published
                </label>
                <div className="admin-row-actions">
                  <button type="button" onClick={() => void saveWritingItem(item)}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => void deleteWritingItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          />
        </div>
      ) : null}

      {tab === 'links' ? (
        <div className="admin-grid">
          {(['elsewhere', 'footer'] as const).map((section) => {
            const sectionLinks = links.filter((l) => l.section === section);
            return (
              <div key={section} className="admin-card admin-grid">
                <h2>{section === 'elsewhere' ? 'Elsewhere list' : 'Footer links'}</h2>
                <div className="admin-actions">
                  <button type="button" onClick={() => void addLink(section)}>
                    Add link
                  </button>
                </div>
                <SortableList
                  items={sectionLinks}
                  onReorder={async (next) => {
                    setLinks((rows) => {
                      const other = rows.filter((l) => l.section !== section);
                      return [...other, ...next];
                    });
                    await persistReorder('links', next, section);
                  }}
                  renderItem={(link) => (
                    <div className="admin-grid admin-grid-2" style={{ width: '100%' }}>
                      <div className="admin-field">
                        <label>Label</label>
                        <input
                          value={link.label}
                          onChange={(e) =>
                            setLinks((rows) =>
                              rows.map((row) =>
                                row.id === link.id
                                  ? { ...row, label: e.target.value }
                                  : row
                              )
                            )
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>URL</label>
                        <input
                          value={link.href}
                          onChange={(e) =>
                            setLinks((rows) =>
                              rows.map((row) =>
                                row.id === link.id
                                  ? { ...row, href: e.target.value }
                                  : row
                              )
                            )
                          }
                        />
                      </div>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="danger"
                          onClick={() => void deleteLinkItem(link.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                />
                <div className="admin-actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={() => void saveLinks(section)}
                  >
                    Save {section}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {tab === 'logs' ? (
        <div className="admin-grid">
          <div className="admin-card">
            <div className="admin-actions">
              <button
                type="button"
                className="primary"
                onClick={() =>
                  setLogDraft({
                    id: 0,
                    ...emptyLog(),
                    sortOrder: logs.length
                  })
                }
              >
                New log
              </button>
            </div>
            <SortableList
              items={logs}
              onReorder={(next) => {
                setLogs(next);
                void persistReorder('logs', next);
              }}
              renderItem={(item) => (
                <>
                  <div>
                    <strong>{item.title}</strong>
                    <div className="admin-hint">
                      /logs/{item.slug}
                      {!item.published ? ' · draft' : ''}
                    </div>
                  </div>
                  <div className="admin-row-actions">
                    <button type="button" onClick={() => setLogDraft(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => void deleteLogItem(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            />
          </div>

          {logDraft ? (
            <div className="admin-card admin-grid">
              <div className="admin-grid admin-grid-2">
                <div className="admin-field">
                  <label>Slug</label>
                  <input
                    value={logDraft.slug}
                    onChange={(e) =>
                      setLogDraft({ ...logDraft, slug: e.target.value })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Date (display)</label>
                  <input
                    value={logDraft.dateDisplay}
                    onChange={(e) =>
                      setLogDraft({ ...logDraft, dateDisplay: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="admin-field">
                <label>Title</label>
                <input
                  value={logDraft.title}
                  onChange={(e) =>
                    setLogDraft({ ...logDraft, title: e.target.value })
                  }
                />
              </div>
              <div className="admin-field">
                <label>Excerpt</label>
                <textarea
                  value={logDraft.excerpt}
                  onChange={(e) =>
                    setLogDraft({ ...logDraft, excerpt: e.target.value })
                  }
                />
              </div>
              <div className="admin-field">
                <label>Cover image URL</label>
                <input
                  value={logDraft.coverImageUrl ?? ''}
                  onChange={(e) =>
                    setLogDraft({
                      ...logDraft,
                      coverImageUrl: e.target.value || null
                    })
                  }
                />
              </div>
              <div className="admin-field">
                <label>Body (Markdown)</label>
                <textarea
                  value={logDraft.bodyMd}
                  onChange={(e) =>
                    setLogDraft({ ...logDraft, bodyMd: e.target.value })
                  }
                  style={{ minHeight: 260 }}
                />
              </div>
              <div className="admin-actions">
                <button
                  type="button"
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async () => {
                      const file = input.files?.[0];
                      if (!file) return;
                      const url = await uploadImage(file);
                      setLogDraft((draft) =>
                        draft ? { ...draft, coverImageUrl: url } : draft
                      );
                    };
                    input.click();
                  }}
                >
                  Upload cover image
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void insertImageInto(
                      'bodyMd',
                      (value) =>
                        setLogDraft((draft) =>
                          draft ? { ...draft, bodyMd: value } : draft
                        ),
                      logDraft.bodyMd
                    )
                  }
                >
                  Upload image into body
                </button>
                <label className="admin-hint">
                  <input
                    type="checkbox"
                    checked={logDraft.published}
                    onChange={(e) =>
                      setLogDraft({ ...logDraft, published: e.target.checked })
                    }
                  />{' '}
                  Published
                </label>
                <button type="button" className="primary" onClick={() => void saveLog()}>
                  Save log
                </button>
                {logDraft.id ? (
                  <button
                    type="button"
                    className="danger"
                    onClick={() => void deleteLogItem(logDraft.id)}
                  >
                    Delete
                  </button>
                ) : null}
                <button type="button" onClick={() => setLogDraft(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
