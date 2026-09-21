import { NextResponse } from 'next/server';
import { cmsEnabled } from './db';

export function cmsUnavailable() {
  return NextResponse.json(
    { error: 'CMS requires POSTGRES_URL and admin env vars on the server.' },
    { status: 503 }
  );
}

export async function requireCmsAdmin() {
  if (!cmsEnabled()) {
    throw cmsUnavailable();
  }
  const { isAdminSessionValid } = await import('./auth');
  if (!(await isAdminSessionValid())) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { ensureCmsSchema } = await import('./ensure');
  await ensureCmsSchema();
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
