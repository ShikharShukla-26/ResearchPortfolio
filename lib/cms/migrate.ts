import { getSql } from './db';

export async function runMigrations() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS redirects (
      id SERIAL PRIMARY KEY,
      source VARCHAR(255) NOT NULL,
      destination VARCHAR(255) NOT NULL,
      permanent BOOLEAN NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cms_site (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cms_research (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      date_display TEXT NOT NULL DEFAULT '',
      date_time TEXT NOT NULL DEFAULT '',
      meta_line TEXT NOT NULL DEFAULT '',
      body_mdx TEXT NOT NULL DEFAULT '',
      published BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cms_writing (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      href TEXT NOT NULL,
      date_display TEXT NOT NULL DEFAULT '',
      date_time TEXT NOT NULL DEFAULT '',
      sort_order INT NOT NULL DEFAULT 0,
      published BOOLEAN NOT NULL DEFAULT TRUE
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cms_links (
      id SERIAL PRIMARY KEY,
      section TEXT NOT NULL,
      label TEXT NOT NULL,
      href TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cms_logs (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      body_md TEXT NOT NULL DEFAULT '',
      cover_image_url TEXT,
      date_display TEXT NOT NULL DEFAULT '',
      date_time TEXT NOT NULL DEFAULT '',
      published BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}
