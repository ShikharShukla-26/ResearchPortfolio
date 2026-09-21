import { NextResponse } from 'next/server';
import { requireCmsAdmin, jsonError } from '@/lib/cms/api-utils';
import { revalidatePublicContent } from '@/lib/cms/revalidate-public';
import { listLinks, replaceLinks } from '@/lib/cms/queries';
import type { CmsLink } from '@/lib/cms/types';

export async function GET() {
  try {
    await requireCmsAdmin();
    return NextResponse.json(await listLinks());
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to load links', 500);
  }
}

export async function PUT(request: Request) {
  try {
    await requireCmsAdmin();
    const body = (await request.json()) as {
      section: CmsLink['section'];
      links: Array<{ label: string; href: string; sortOrder?: number }>;
    };
    await replaceLinks(
      body.section,
      body.links.map((link, index) => ({
        label: link.label,
        href: link.href,
        sortOrder: link.sortOrder ?? index
      }))
    );
    revalidatePublicContent();
    return NextResponse.json({ ok: true });
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to save links', 500);
  }
}
