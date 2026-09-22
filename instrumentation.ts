/**
 * After a production deploy, point both *.vercel.app hostnames at this deployment.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.VERCEL_ENV !== 'production') return;
  if (!process.env.VERCEL_TOKEN?.trim()) return;
  if (!process.env.VERCEL_URL) return;

  const g = globalThis as typeof globalThis & { __vercelAliasSync?: boolean };
  if (g.__vercelAliasSync) return;
  g.__vercelAliasSync = true;

  try {
    const { syncProductionAliases } = await import(
      './lib/vercel/sync-production-aliases'
    );
    await syncProductionAliases();
  } catch (err) {
    console.error(
      '[sync-vercel-aliases]',
      err instanceof Error ? err.message : err
    );
  }
}
