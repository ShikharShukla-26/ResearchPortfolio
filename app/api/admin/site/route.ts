import { NextResponse } from 'next/server';
import { requireCmsAdmin, jsonError } from '@/lib/cms/api-utils';
import { revalidatePublicContent } from '@/lib/cms/revalidate-public';
import { getSiteSettings, updateSiteSettings } from '@/lib/cms/queries';
import type { SiteSettings } from '@/lib/cms/types';

export async function GET() {
  try {
    await requireCmsAdmin();
    const site = await getSiteSettings();
    return NextResponse.json(site);
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to load site settings', 500);
  }
}

export async function PUT(request: Request) {
  try {
    await requireCmsAdmin();
    const body = (await request.json()) as SiteSettings;
    await updateSiteSettings(body);
    revalidatePublicContent();
    return NextResponse.json({ ok: true });
  } catch (response) {
    if (response instanceof NextResponse) return response;
    console.error('PUT /api/admin/site failed', response);
    const message =
      response instanceof Error ? response.message : 'Failed to save site settings';
    return jsonError(message, 500);
  }
}
