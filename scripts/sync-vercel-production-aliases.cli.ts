import { syncProductionAliases } from '../lib/vercel/sync-production-aliases.ts';

syncProductionAliases().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
