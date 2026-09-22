import { test, expect } from '@playwright/test';
import { adminPassword, loginAsAdmin, logoutAdmin, requireAdminPassword } from './helpers/admin';

test.describe('Admin auth', () => {
  test('1 — login page loads with password field and sign-in button', async ({
    page
  }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: 'Portfolio admin' })).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('2 — wrong password shows an error and stays on login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('#password').fill('definitely-wrong-password-e2e');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('.admin-error')).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('3 — valid password opens admin dashboard', async ({ page }) => {
    requireAdminPassword();
    await loginAsAdmin(page);
    await expect(page.getByRole('tab', { name: 'Site & bios' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Research' })).toBeVisible();
  });

  test('4 — sign out returns to login and blocks dashboard', async ({ page }) => {
    requireAdminPassword();
    await loginAsAdmin(page);
    await logoutAdmin(page);
    await page.goto('/admin');
    await page.waitForURL(/\/admin\/login/, { timeout: 15_000 });
  });

  test('5 — session API reports database and admin env when configured', async ({
    request
  }) => {
    const res = await request.get('/api/admin/session');
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as {
      hasDatabase?: boolean;
      hasAdmin?: boolean;
      ready?: boolean;
    };
    expect(data.hasDatabase).toBe(true);
    expect(data.hasAdmin).toBe(true);
    expect(data.ready).toBe(true);
  });
});
