import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MdxBody } from '@/app/components/cms/mdx-body';
import { cmsEnabled } from '@/lib/cms/db';
import { readResearchFallback } from '@/lib/cms/fallback';
import { getResearchBySlug } from '@/lib/cms/queries';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!cmsEnabled()) return { title: slug };
  const post = await getResearchBySlug(slug);
  if (!post) return { title: slug };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/work/${post.slug}` }
  };
}

export default async function ResearchPage({ params }: PageProps) {
  const { slug } = await params;
  let bodyMdx: string | null = null;

  if (cmsEnabled()) {
    const post = await getResearchBySlug(slug);
    if (post) bodyMdx = post.bodyMdx;
  }

  if (!bodyMdx) {
    const fallback = await readResearchFallback(slug);
    if (!fallback) notFound();
    bodyMdx = fallback.bodyMdx;
  }

  return <MdxBody source={bodyMdx} />;
}
