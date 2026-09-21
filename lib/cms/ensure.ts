let schemaReady = false;

export async function ensureCmsSchema() {
  if (schemaReady) return;
  const { runMigrations } = await import('./migrate');
  await runMigrations();
  schemaReady = true;
}
