# Automatic sync of both Vercel URLs (Option B)

GitHub Actions [`.github/workflows/sync-vercel-aliases.yml`](../.github/workflows/sync-vercel-aliases.yml) runs when **Vercel reports a successful production deploy** (and on push to `main` / manual run) so **both** hostnames stay on the same production deployment:

- `shikhar-research.vercel.app`
- `next-mdx-blog-xi.vercel.app`

## One-time setup (about 2 minutes)

### 1. Create a Vercel token

1. Open [vercel.com/account/tokens](https://vercel.com/account/tokens) (log in as the team member who owns **shikhar-research**).
2. **Create Token** → name it `GitHub Actions sync` → scope **Full Account** (or at least access to the team project).
3. Copy the token (shown once).

If token creation is blocked, ask the **Vercel team owner** to create the token or grant you token permissions.

### 2. Add the token to GitHub

1. Open [github.com/ShikharShukla-26/ResearchPortfolio/settings/secrets/actions](https://github.com/ShikharShukla-26/ResearchPortfolio/settings/secrets/actions).
2. **New repository secret**
3. Name: **`VERCEL_TOKEN`**
4. Value: paste the Vercel token → **Add secret**

### 3. Confirm

1. Push any commit to `main`, or run **Actions → Sync Vercel production aliases → Run workflow**.
2. The job should finish green in about 1–3 minutes (it waits for Vercel’s production build, then updates aliases).

## Local alternative (same script)

```bash
vercel login
export VERCEL_TOKEN=...   # optional if already logged in
npm run deploy:sync-aliases
```

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Workflow fails immediately “VERCEL_TOKEN is not set” | Complete step 2 above |
| Workflow times out | Check Vercel deploy for `main` succeeded |
| One URL still stale | Re-run the workflow manually from the Actions tab |
