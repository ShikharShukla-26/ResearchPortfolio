import { NextResponse } from 'next/server';
import { requireCmsAdmin, jsonError } from '@/lib/cms/api-utils';
import { revalidatePublicContent } from '@/lib/cms/revalidate-public';
import { deleteLog, getLogById, updateLog } from '@/lib/cms/queries';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireCmsAdmin();
    const id = Number((await params).id);
    const item = await getLogById(id);
    if (!item) return jsonError('Not found', 404);
    return NextResponse.json(item);
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to load log', 500);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireCmsAdmin();
    const id = Number((await params).id);
    const body = await request.json();
    const item = await updateLog(id, {
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt,
      bodyMd: body.bodyMd,
      coverImageUrl: body.coverImageUrl,
      dateDisplay: body.dateDisplay,
      dateTime: body.dateTime,
      published: body.published
    });
    if (!item) return jsonError('Not found', 404);
    revalidatePublicContent();
    return NextResponse.json(item);
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to update log', 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireCmsAdmin();
    const id = Number((await params).id);
    await deleteLog(id);
    revalidatePublicContent();
    return NextResponse.json({ ok: true });
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to delete log', 500);
  }
}
