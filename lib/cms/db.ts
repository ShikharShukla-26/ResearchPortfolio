import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | null = null;

export function cmsEnabled() {
  return Boolean(process.env.POSTGRES_URL);
}

export function getSql() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not configured');
  }
  if (!sql) {
    sql = postgres(process.env.POSTGRES_URL, { ssl: 'allow' });
  }
  return sql;
}
