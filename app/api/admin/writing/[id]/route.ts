import { NextResponse } from 'next/server';
import { requireCmsAdmin, jsonError } from '@/lib/cms/api-utils';
import { revalidatePublicContent } from '@/lib/cms/revalidate-public';
import { deleteWriting, updateWriting } from '@/lib/cms/queries';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireCmsAdmin();
    const id = Number((await params).id);
    const body = await request.json();
    await updateWriting(id, {
      title: body.title,
      href: body.href,
      dateDisplay: body.dateDisplay,
      dateTime: body.dateTime,
      sortOrder: body.sortOrder,
      published: body.published
    });
    revalidatePublicContent();
    return NextResponse.json({ ok: true });
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to update writing item', 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireCmsAdmin();
    const id = Number((await params).id);
    await deleteWriting(id);
    revalidatePublicContent();
    return NextResponse.json({ ok: true });
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to delete writing item', 500);
  }
}
