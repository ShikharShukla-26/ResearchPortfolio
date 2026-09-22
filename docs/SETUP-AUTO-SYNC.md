# Automatic sync of both Vercel URLs

**Primary (no GitHub secret):** on each **production** deploy, Next.js [`instrumentation.ts`](../instrumentation.ts) runs `lib/vercel/sync-production-aliases.ts` on the first Node cold start (deployment is **Ready** by then). The Vercel project must have **`VERCEL_TOKEN`** in **Production** environment variables (used only to assign aliases).

**Optional backup:** GitHub Actions [`.github/workflows/sync-vercel-aliases.yml`](../.github/workflows/sync-vercel-aliases.yml) runs on push to `main` / manual run if **`VERCEL_TOKEN`** is set as a repo secret:


- `shikhar-research.vercel.app`
- `next-mdx-blog-xi.vercel.app`

## One-time setup (about 2 minutes)

### 1. Create a Vercel token

1. Open [vercel.com/account/tokens](https://vercel.com/account/tokens) (log in as the team member who owns **shikhar-research**).
2. **Create Token** → name it `GitHub Actions sync` → scope **Full Account** (or at least access to the team project).
3. Copy the token (shown once).

If token creation is blocked, ask the **Vercel team owner** to create the token or grant you token permissions.

### 2. Add the token to GitHub

**Easy (Vercel CLI already logged in on this PC):**

```bash
gh auth login -h github.com -p https -w
npm run deploy:install-github-secret
```

**Manual:** [New repository secret](https://github.com/ShikharShukla-26/ResearchPortfolio/settings/secrets/actions/new) → name **`VERCEL_TOKEN`** → paste the Vercel token.

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
