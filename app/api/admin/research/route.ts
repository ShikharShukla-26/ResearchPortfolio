import { NextResponse } from 'next/server';
import { requireCmsAdmin, jsonError } from '@/lib/cms/api-utils';
import { revalidatePublicContent } from '@/lib/cms/revalidate-public';
import { createResearch, listResearch } from '@/lib/cms/queries';
import { normalizeSlug } from '@/lib/cms/slug';

export async function GET() {
  try {
    await requireCmsAdmin();
    const items = await listResearch(true);
    return NextResponse.json(items);
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to load research', 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireCmsAdmin();
    const body = await request.json();
    const slug = normalizeSlug(String(body.slug ?? ''));
    if (!slug) return jsonError('Slug is required (use letters and numbers)', 400);
    const item = await createResearch({
      slug,
      title: String(body.title ?? ''),
      description: String(body.description ?? ''),
      dateDisplay: String(body.dateDisplay ?? ''),
      dateTime: String(body.dateTime ?? ''),
      metaLine: String(body.metaLine ?? ''),
      bodyMdx: String(body.bodyMdx ?? ''),
      published: Boolean(body.published ?? true),
      sortOrder: Number(body.sortOrder ?? 0)
    });
    revalidatePublicContent({ workSlug: item.slug });
    return NextResponse.json(item);
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to create research', 500);
  }
}
