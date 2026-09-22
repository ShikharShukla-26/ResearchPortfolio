import { NextResponse } from 'next/server';
import { requireCmsAdmin, jsonError } from '@/lib/cms/api-utils';
import { cleanupTestContent } from '@/lib/cms/cleanup-test-data';
import { revalidatePublicContent } from '@/lib/cms/revalidate-public';

export async function POST() {
  try {
    await requireCmsAdmin();
    const removed = await cleanupTestContent();
    revalidatePublicContent();
    return NextResponse.json({ ok: true, removed });
  } catch (response) {
    if (response instanceof NextResponse) return response;
    return jsonError('Failed to clean test data', 500);
  }
}
