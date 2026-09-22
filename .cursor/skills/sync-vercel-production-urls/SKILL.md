---
name: sync-vercel-production-urls
description: >-
  After deploying the shikhar-research portfolio to Vercel, sync production
  aliases so shikhar-research.vercel.app and next-mdx-blog-xi.vercel.app both
  serve the latest build. Use after git push to main, when production looks
  stale on one URL, or when the user mentions Vercel alias or URL not updating.
---

# Sync Vercel production URLs

## Problem

This project uses **two** public `*.vercel.app` hostnames:

- `https://shikhar-research.vercel.app` (primary)
- `https://next-mdx-blog-xi.vercel.app` (legacy)

Git pushes create a new production deployment, but **only one alias may move automatically**. The other can stay pinned to an old deployment (stale Contact modal, address, etc.).

## Required workflow after every deploy

From repo root `next-mdx-blog/`:

```bash
git push origin main
npm run deploy:sync-aliases
```

Or run the script alone if deploy already finished:

```bash
npm run deploy:sync-aliases
```

Requires Vercel CLI logged in (`vercel login`) or `VERCEL_TOKEN` in the environment.

## What the script does

[`scripts/sync-vercel-production-aliases.mjs`](../../scripts/sync-vercel-production-aliases.mjs):

1. Lists deployments JSON for project `shikhar-research`
2. Picks the newest **Ready** **production** deployment
3. Runs `vercel alias set <deployment> <hostname>` for each hostname in `VERCEL_PRODUCTION_ALIASES`

## Verify

Compare both URLs in incognito (footer **Contact** / latest copy should match):

- https://shikhar-research.vercel.app/
- https://next-mdx-blog-xi.vercel.app/

## If CMS content is still old on both URLs

Database content is separate from aliases. Log in once at `/admin/login` (runs migrations) or edit **Site & bios → Address** in admin.

## Optional CI

Add `VERCEL_TOKEN` to GitHub repo secrets and run `npm run deploy:sync-aliases` in a workflow after push to `main` if the user wants this fully automatic without local CLI.
