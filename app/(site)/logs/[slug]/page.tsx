import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarkdownBody } from '@/app/components/cms/markdown-body';
import { NewTabAnchor } from '@/app/components/new-tab-anchor';
import { cmsEnabled } from '@/lib/cms/db';
import { getLogBySlug } from '@/lib/cms/queries';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!cmsEnabled()) return { title: slug };
  const log = await getLogBySlug(slug);
  if (!log) return { title: slug };
  return {
    title: log.title,
    description: log.excerpt,
    alternates: { canonical: `/logs/${log.slug}` }
  };
}

export default async function LogPage({ params }: PageProps) {
  const { slug } = await params;
  if (!cmsEnabled()) notFound();
  const log = await getLogBySlug(slug);
  if (!log) notFound();

  return (
    <>
      <nav className="work-nav" aria-label="Back to logs">
        <NewTabAnchor href="/logs" className="text-nav work-back">
          &larr; Logs
        </NewTabAnchor>
      </nav>
      <h1 className="content-title">{log.title}</h1>
      {log.dateDisplay ? (
        <p className="article-meta">{log.dateDisplay}</p>
      ) : null}
      {log.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={log.coverImageUrl}
          alt=""
          className="cms-log-cover"
        />
      ) : null}
      <MarkdownBody source={log.bodyMd} />
    </>
  );
}
