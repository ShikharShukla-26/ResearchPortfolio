# E2E test matrix (5 cases × feature)

Run: `npm run test:e2e`

Set **`E2E_ADMIN_PASSWORD`** in `.env.e2e` (copy from `.env.e2e.example`) to match your live Vercel `ADMIN_PASSWORD`. The value in `.env.vercel.pull` is often outdated after a password rotation.

| Feature | Cases (see `e2e/cms-*.spec.ts`) |
|---------|----------------------------------|
| **Admin auth** | Login UI; wrong password; valid login; sign out; session API ready |
| **Site & bios** | Fields visible; save success; tagline persist; name editable; tagline on homepage |
| **Research** | Reorder UI; create published; homepage list; draft hidden; drag reorder + delete |
| **Writing** | UI; add row; save persist; homepage; delete |
| **Links & social** | Sections; add link; save elsewhere; homepage; delete |
| **Logs** | UI; create; detail page; index; delete |

Default target: **`http://127.0.0.1:3000`** (run `npm run dev` first).

Do **not** run against production unless intentional:  
`PLAYWRIGHT_BASE_URL=https://next-mdx-blog-xi.vercel.app ALLOW_PROD_E2E=1 npm run test:e2e`

After accidental prod runs: `npm run cms:cleanup-test-data` or admin → **Remove test junk**.

## Last run (production)

**30 / 30 passed** (~2.4 min, Chromium).

| Feature | Cases |
|---------|-------|
| Admin auth | 5/5 |
| Site & bios | 5/5 |
| Research | 5/5 (reorder exercised via `/api/admin/reorder`) |
| Writing | 5/5 |
| Links & social | 5/5 |
| Logs | 5/5 |
