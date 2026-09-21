import { NextResponse } from 'next/server';
import { isAdminSessionValid } from '@/lib/cms/auth';
import { getCmsSetupStatus } from '@/lib/cms/setup-status';

export async function GET() {
  const status = getCmsSetupStatus();
  return NextResponse.json({
    ...status,
    authenticated: await isAdminSessionValid()
  });
}
