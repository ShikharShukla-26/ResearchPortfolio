/**
 * After a production deploy, point both *.vercel.app hostnames at this deployment.
 * Runs once per Node runtime (serverless cold start); alias updates are idempotent.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.VERCEL_ENV !== 'production') return;
  if (!process.env.VERCEL_TOKEN?.trim()) return;
  if (!process.env.VERCEL_URL) return;

  const g = globalThis as typeof globalThis & { __vercelAliasSync?: boolean };
  if (g.__vercelAliasSync) return;
  g.__vercelAliasSync = true;

  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);

  void run('node', ['scripts/sync-vercel-production-aliases.mjs'], {
    env: process.env,
    cwd: process.cwd(),
    maxBuffer: 10 * 1024 * 1024
  }).catch((err) => {
    console.error('[sync-vercel-aliases]', err.stderr ?? err.message ?? err);
  });
}
