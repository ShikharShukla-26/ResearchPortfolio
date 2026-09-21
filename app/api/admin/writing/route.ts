import { NextResponse } from 'next/server';
import { requireCmsAdmin, jsonError } from '@/lib/cms/api-utils';
import { revalidatePublicContent } from '@/lib/cms/revalidate-public';
import { createWriting, listWriting } from '@/lib/cms/queries';

export async function GET() {
  try {
    await requireCmsAdmin();
    return NextResponse.json(await listWriting(true));
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to load writing', 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireCmsAdmin();
    const body = await request.json();
    const item = await createWriting({
      title: String(body.title ?? ''),
      href: String(body.href ?? ''),
      dateDisplay: String(body.dateDisplay ?? ''),
      dateTime: String(body.dateTime ?? ''),
      sortOrder: Number(body.sortOrder ?? 0),
      published: Boolean(body.published ?? true)
    });
    revalidatePublicContent();
    return NextResponse.json(item);
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to create writing item', 500);
  }
}
