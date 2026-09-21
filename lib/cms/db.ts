import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | null = null;

function postgresUrl() {
  return (
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING
  );
}

export function cmsEnabled() {
  return Boolean(postgresUrl());
}

export function getSql() {
  const url = postgresUrl();
  if (!url) {
    throw new Error('POSTGRES_URL (or DATABASE_URL) is not configured');
  }
  if (!sql) {
    sql = postgres(url, { ssl: 'allow' });
  }
  return sql;
}
