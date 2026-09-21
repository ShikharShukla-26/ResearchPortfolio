import { NextResponse } from 'next/server';
import {
  adminConfigured,
  createAdminSession,
  verifyAdminPassword
} from '@/lib/cms/auth';
import { cmsEnabled } from '@/lib/cms/db';
import { getCmsSetupStatus } from '@/lib/cms/setup-status';
import { bootstrapCms } from '@/lib/cms/seed';

export async function POST(request: Request) {
  const status = getCmsSetupStatus();
  if (!status.ready) {
    return NextResponse.json(
      {
        error: status.missing.join(' '),
        missing: status.missing,
        hasDatabase: status.hasDatabase,
        hasAdmin: status.hasAdmin
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
