# Shikhar Shukla — Research Portfolio

Next.js portfolio with a **Postgres-backed admin dashboard** so you can update content after deploy without editing code.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Production (interim):** [https://shikhar-research.vercel.app](https://shikhar-research.vercel.app)

### Custom URL without `vercel.app`

Vercel free hosting always gives a `*.vercel.app` backup URL. For a clean link like **`https://research.shikharshukla.dev`**:

1. In [Vercel → shikhar-research → Settings → Domains](https://vercel.com/dashboard), add **`research.shikharshukla.dev`** (or buy a domain such as `shikhar-research.com`).
2. At your DNS provider (where `shikharshukla.dev` is registered), add the **CNAME** record Vercel shows (usually `research` → `cname.vercel-dns.com`).
3. In Vercel **Environment Variables**, set **`NEXT_PUBLIC_SITE_URL`** = `https://research.shikharshukla.dev` for Production, then redeploy.

Legacy aliases (`next-mdx-blog-xi.vercel.app`, `shikhar-shukla-research.vercel.app`) may still work until you remove them in Vercel.

Without `POSTGRES_URL`, the site uses bundled fallback content (`app/site-data.ts` and `content/seed/*.mdx` for case studies).

## Admin dashboard (after deploy)

1. Add a Postgres database (e.g. [Vercel Postgres](https://vercel.com/storage/postgres) or Neon) and set **`POSTGRES_URL`** on your project.
2. Set **`ADMIN_PASSWORD`** and **`SESSION_SECRET`** (long random strings).
3. For image uploads on Vercel, enable [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) and set **`BLOB_READ_WRITE_TOKEN`**.  
   Locally, uploads are saved under `public/uploads/`.
4. Visit **`/admin/login`**, sign in with `ADMIN_PASSWORD`.  
   First login creates tables and imports your existing portfolio (bios, research MDX, writing links, elsewhere/footer links).

### What you can edit in `/admin`

| Tab | Updates |
|-----|---------|
| **Site & bios** | Name, tagline, email, social URLs, resume link, default/long bio (Markdown) |
| **Research** | Case studies on `/work/[slug]` (MDX body with `Meta`, `Callout`, `Table`) |
| **Writing** | External essay links on the homepage |
| **Links & social** | Elsewhere list + footer links |
| **Logs** | Short posts at `/logs/[slug]` with cover image + Markdown body and inline images |

Changes revalidate the public site on save.

## E2E tests (browser)

```bash
# Copy .env.e2e.example → .env.e2e and set E2E_ADMIN_PASSWORD to your Vercel ADMIN_PASSWORD
npm run test:e2e
```

See `e2e/TEST-CASES.md` for the full matrix (5 cases × admin feature). HTML report: `e2e-report/index.html`.

If E2E tests ever hit production by mistake, sign in at `/admin` and click **Remove test junk**, or run `node scripts/prod-cleanup-via-api.mjs` after deploy.

## Environment variables

See [`.env.example`](.env.example).

## Stack

- Next.js 16, MDX (`next-mdx-remote` for CMS case studies)
- Postgres (`postgres` package)
- Optional Vercel Blob for media
