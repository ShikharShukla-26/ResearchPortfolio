import { NextResponse } from 'next/server';
import { requireCmsAdmin, jsonError } from '@/lib/cms/api-utils';
import { revalidatePublicContent } from '@/lib/cms/revalidate-public';
import { createLog, listLogs } from '@/lib/cms/queries';

export async function GET() {
  try {
    await requireCmsAdmin();
    return NextResponse.json(await listLogs(true));
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to load logs', 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireCmsAdmin();
    const body = await request.json();
    const item = await createLog({
      slug: String(body.slug ?? ''),
      title: String(body.title ?? ''),
      excerpt: String(body.excerpt ?? ''),
      bodyMd: String(body.bodyMd ?? ''),
      coverImageUrl: body.coverImageUrl ? String(body.coverImageUrl) : null,
      dateDisplay: String(body.dateDisplay ?? ''),
      dateTime: String(body.dateTime ?? ''),
      published: Boolean(body.published ?? true)
    });
    revalidatePublicContent();
    return NextResponse.json(item);
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to create log', 500);
  }
}
