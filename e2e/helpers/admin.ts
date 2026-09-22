import { expect, type Page } from '@playwright/test';

/** Prefer E2E_ADMIN_PASSWORD when production password differs from .env.vercel.pull */
export const adminPassword =
  process.env.E2E_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? '';

export function requireAdminPassword() {
  if (!adminPassword) {
    throw new Error(
      'Set ADMIN_PASSWORD in .env.local or .env.vercel.pull before running e2e tests.'
    );
  }
}

export async function loginAsAdmin(page: Page) {
  requireAdminPassword();
  await page.goto('/admin/login');
  await page.locator('#password').fill(adminPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  const dashboardTab = page.getByRole('tab', { name: 'Site & bios' });
  const loginError = page.locator('.admin-error');
  await Promise.race([
    dashboardTab.waitFor({ state: 'visible', timeout: 45_000 }),
    loginError
      .waitFor({ state: 'visible', timeout: 45_000 })
      .then(async () => {
        const msg = (await loginError.textContent())?.trim() ?? 'Login failed';
        throw new Error(msg);
      })
  ]);
}

export async function logoutAdmin(page: Page) {
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL(/\/admin\/login/);
}

export async function openTab(page: Page, label: string) {
  await page.getByRole('tab', { name: label }).click();
  await expect(page.getByRole('tab', { name: label })).toHaveAttribute(
    'aria-selected',
    'true'
  );
}

export function uniqueSlug(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}
