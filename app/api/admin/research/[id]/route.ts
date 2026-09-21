import { NextResponse } from 'next/server';
import { requireCmsAdmin, jsonError } from '@/lib/cms/api-utils';
import { revalidatePublicContent } from '@/lib/cms/revalidate-public';
import {
  deleteResearch,
  getResearchById,
  updateResearch
} from '@/lib/cms/queries';
import { normalizeSlug } from '@/lib/cms/slug';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireCmsAdmin();
    const id = Number((await params).id);
    const item = await getResearchById(id);
    if (!item) return jsonError('Not found', 404);
    return NextResponse.json(item);
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to load research', 500);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireCmsAdmin();
    const id = Number((await params).id);
    const existing = await getResearchById(id);
    if (!existing) return jsonError('Not found', 404);
    const body = await request.json();
    const slug = normalizeSlug(String(body.slug ?? ''));
    if (!slug) return jsonError('Slug is required (use letters and numbers)', 400);
    const item = await updateResearch(id, {
      slug,
      title: body.title,
      description: body.description,
      dateDisplay: body.dateDisplay,
      dateTime: body.dateTime,
      metaLine: body.metaLine,
      bodyMdx: body.bodyMdx,
      published: body.published,
      sortOrder: body.sortOrder
    });
    if (!item) return jsonError('Not found', 404);
    revalidatePublicContent({ workSlug: item.slug });
    if (existing.slug !== item.slug) {
      revalidatePublicContent({ workSlug: existing.slug });
    }
    return NextResponse.json(item);
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to update research', 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireCmsAdmin();
    const id = Number((await params).id);
    await deleteResearch(id);
    revalidatePublicContent();
    return NextResponse.json({ ok: true });
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to delete research', 500);
  }
}
