import { adminConfigured } from './auth';
import { cmsEnabled } from './db';

export function getCmsSetupStatus() {
  const hasDatabase = cmsEnabled();
  const hasAdmin = adminConfigured();
  const missing: string[] = [];
  if (!hasDatabase) {
    missing.push('POSTGRES_URL (add Neon Postgres in Vercel → Storage, then redeploy)');
  }
  if (!hasAdmin) {
    missing.push('ADMIN_PASSWORD (and SESSION_SECRET) in Vercel Environment Variables');
  }
  return {
    ready: hasDatabase && hasAdmin,
    hasDatabase,
    hasAdmin,
    missing
  };
}
