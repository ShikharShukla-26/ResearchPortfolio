import { execFileSync, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const TEAM_ID =
  process.env.VERCEL_ORG_ID ?? 'team_folaDmDuVQIuuekP8hHelcw2';
const PROJECT_ID =
  process.env.VERCEL_PROJECT_ID ?? 'prj_44BNm66qJ0MBJWQsBZYo6jeltlDz';
const PROJECT = process.env.VERCEL_PROJECT ?? 'shikhar-research';
const ALIASES = (
  process.env.VERCEL_PRODUCTION_ALIASES ??
  'shikhar-research.vercel.app,next-mdx-blog-xi.vercel.app'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const EXPECTED_SHA = (
  process.env.GITHUB_SHA ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  ''
).trim();
const POLL_MS = 15_000;
const MAX_POLLS = 48;

type DeploymentRow = {
  state?: string;
  target?: string;
  url?: string;
  meta?: { githubCommitSha?: string };
};

function vercelCommand() {
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA ?? '';
    const cmd = path.join(appData, 'npm', 'vercel.cmd');
    if (existsSync(cmd)) return cmd;
  }
  return 'vercel';
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function apiToken() {
  return process.env.VERCEL_TOKEN?.trim() ?? '';
}

function teamQuery(apiPath: string) {
  if (!TEAM_ID) return '';
  const sep = apiPath.includes('?') ? '&' : '?';
  return `${sep}teamId=${encodeURIComponent(TEAM_ID)}`;
}

async function apiRequest(method: string, apiPath: string, body?: unknown) {
  const token = apiToken();
  if (!token) {
    throw new Error(
      'VERCEL_TOKEN is not set (Vercel project env or local login).'
    );
  }
  const url = `https://api.vercel.com${apiPath}${teamQuery(apiPath)}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data: Record<string, unknown>;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(
      `Vercel API ${method} ${apiPath}: ${res.status} ${JSON.stringify(data)}`
    );
  }
  return data;
}

async function listProductionDeploymentsApi() {
  const data = await apiRequest(
    'GET',
    `/v6/deployments?projectId=${encodeURIComponent(PROJECT_ID)}&target=production&limit=30`
  );
  return (data.deployments as DeploymentRow[] | undefined) ?? [];
}

async function assignAliasApi(deploymentHostOrId: string, alias: string) {
  const id = encodeURIComponent(deploymentHostOrId);
  await apiRequest('POST', `/v2/deployments/${id}/aliases`, { alias });
}

async function assignAliasApiWhenReady(
  deploymentHostOrId: string,
  alias: string
) {
  const maxAttempts = 12;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await assignAliasApi(deploymentHostOrId, alias);
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const notReady =
        msg.includes('deployment_not_ready') || msg.includes('not `READY`');
      if (notReady && attempt < maxAttempts - 1) {
        console.log(
          `Deployment not ready for alias ${alias}; retry ${attempt + 1}/${maxAttempts}…`
        );
        await sleep(5000);
        continue;
      }
      throw err;
    }
  }
}

function pickDeployment(deployments: DeploymentRow[]) {
  const production = deployments.filter(
    (d) => d.state === 'READY' && d.target === 'production'
  );
  if (!EXPECTED_SHA) {
    return production[0];
  }
  const forSha = production.find(
    (d) => d.meta?.githubCommitSha === EXPECTED_SHA
  );
  return forSha ?? production[0];
}

async function resolveDeploymentHostApi() {
  for (let attempt = 0; attempt <= MAX_POLLS; attempt++) {
    const deployments = await listProductionDeploymentsApi();
    const chosen = pickDeployment(deployments);
    if (chosen?.url) {
      if (
        EXPECTED_SHA &&
        chosen.meta?.githubCommitSha === EXPECTED_SHA
      ) {
        console.log(`Matched deploy for commit ${EXPECTED_SHA.slice(0, 7)}`);
      } else if (EXPECTED_SHA && attempt === MAX_POLLS) {
        console.warn(
          `Timed out waiting for commit ${EXPECTED_SHA.slice(0, 7)}; using latest production.`
        );
      }
      return chosen.url.replace(/^https?:\/\//, '');
    }
    if (!EXPECTED_SHA || attempt === MAX_POLLS) {
      break;
    }
    console.log(`Waiting for production deploy (${attempt + 1}/${MAX_POLLS})…`);
    await sleep(POLL_MS);
  }
  throw new Error(`No Ready production deployment for project "${PROJECT}".`);
}

function runVercel(args: string[]) {
  const bin = vercelCommand();
  const env = { ...process.env };
  try {
    return execFileSync(bin, [...args, '--non-interactive'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      env
    });
  } catch {
    return execSync(`npx vercel ${args.join(' ')} --non-interactive`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env
    });
  }
}

function listProductionDeploymentsCli() {
  const raw = runVercel(['ls', PROJECT, '--json']);
  const data = JSON.parse(raw) as { deployments?: DeploymentRow[] };
  return data.deployments ?? [];
}

async function resolveDeploymentHostCli() {
  for (let attempt = 0; attempt <= MAX_POLLS; attempt++) {
    const deployments = listProductionDeploymentsCli();
    const chosen = pickDeployment(deployments);
    if (chosen?.url) {
      return chosen.url.replace(/^https?:\/\//, '');
    }
    if (!EXPECTED_SHA || attempt === MAX_POLLS) {
      break;
    }
    await sleep(POLL_MS);
  }
  throw new Error(`No Ready production deployment for project "${PROJECT}".`);
}

async function syncAliasesToHost(deploymentHost: string) {
  console.log(`Production deployment: ${deploymentHost}`);
  for (const alias of ALIASES) {
    console.log(`→ ${alias}`);
    if (apiToken()) {
      const onVercelProd =
        process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'production';
      if (onVercelProd) {
        await assignAliasApiWhenReady(deploymentHost, alias);
      } else {
        await assignAliasApi(deploymentHost, alias);
      }
    } else {
      runVercel(['alias', 'set', deploymentHost, alias]);
    }
  }
}

/** Point both production vanity URLs at the correct deployment. */
export async function syncProductionAliases() {
  if (
    process.env.VERCEL === '1' &&
    process.env.VERCEL_ENV !== 'production'
  ) {
    console.log('Skipping alias sync (not a production deployment).');
    return;
  }

  if (
    process.env.VERCEL === '1' &&
    process.env.VERCEL_ENV === 'production' &&
    process.env.VERCEL_URL
  ) {
    const host = process.env.VERCEL_URL.replace(/^https?:\/\//, '');
    await syncAliasesToHost(host);
    console.log('Done. Both URLs point at this production build.');
    return;
  }

  const deploymentHost = apiToken()
    ? await resolveDeploymentHostApi()
    : await resolveDeploymentHostCli();

  await syncAliasesToHost(deploymentHost);
  console.log('Done. Both URLs should match the latest production build.');
}
