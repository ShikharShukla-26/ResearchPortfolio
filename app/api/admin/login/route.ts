import { NextResponse } from 'next/server';
import {
  adminConfigured,
  createAdminSession,
  verifyAdminPassword
} from '@/lib/cms/auth';
import { cmsEnabled } from '@/lib/cms/db';
import { bootstrapCms } from '@/lib/cms/seed';

export async function POST(request: Request) {
  if (!cmsEnabled() || !adminConfigured()) {
    return NextResponse.json(
      {
        error:
          'Set POSTGRES_URL, ADMIN_PASSWORD, and SESSION_SECRET in the environment.'
      },
      { status: 503 }
    );
  }

  const body = (await request.json()) as { password?: string };
  if (!body.password || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  await bootstrapCms();
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
