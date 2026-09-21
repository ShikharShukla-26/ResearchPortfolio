import { NextResponse } from 'next/server';
import { requireCmsAdmin, jsonError } from '@/lib/cms/api-utils';
import { revalidatePublicContent } from '@/lib/cms/revalidate-public';
import {
  deleteResearch,
  getResearchById,
  updateResearch
} from '@/lib/cms/queries';

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
    const body = await request.json();
    const item = await updateResearch(id, {
      slug: body.slug,
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
    revalidatePublicContent();
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
