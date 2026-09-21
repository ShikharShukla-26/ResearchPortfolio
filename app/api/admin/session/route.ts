import { NextResponse } from 'next/server';
import { adminConfigured, isAdminSessionValid } from '@/lib/cms/auth';
import { cmsEnabled } from '@/lib/cms/db';

export async function GET() {
  return NextResponse.json({
    cmsEnabled: cmsEnabled(),
    adminConfigured: adminConfigured(),
    authenticated: await isAdminSessionValid()
  });
}
