import { test, expect } from '@playwright/test';
import { loginAsAdmin, openTab, requireAdminPassword } from './helpers/admin';
import { adminField, waitForSiteForm } from './helpers/fields';

test.describe('Site & bios', () => {
  test.beforeEach(async ({ page }) => {
    requireAdminPassword();
    await loginAsAdmin(page);
    await openTab(page, 'Site & bios');
    await waitForSiteForm(page);
  });

  test('1 — site tab shows core fields (name, email, bios)', async ({ page }) => {
    await expect(adminField(page, 'Name')).toBeVisible();
    await expect(adminField(page, 'Email')).toBeVisible();
    await expect(adminField(page, 'Default bio (Markdown)')).toBeVisible();
    await expect(adminField(page, 'Long bio (Markdown)')).toBeVisible();
  });

  test('2 — save site shows success status', async ({ page }) => {
    await page.getByRole('button', { name: 'Save site & bios' }).click();
    await expect(page.locator('.admin-status')).toContainText(/saved/i, {
      timeout: 20_000
    });
  });

  test('3 — tagline change persists after save and reload', async ({ page }) => {
    const tagline = adminField(page, 'Tagline / description');
    const original = await tagline.inputValue();
    const marker = `E2E tagline ${Date.now()}`;
    await tagline.fill(marker);
    await page.getByRole('button', { name: 'Save site & bios' }).click();
    await expect(page.locator('.admin-status')).toContainText(/saved/i);
    await page.reload();
    await openTab(page, 'Site & bios');
    await waitForSiteForm(page);
    await expect(tagline).toHaveValue(marker);
    await tagline.fill(original);
    await page.getByRole('button', { name: 'Save site & bios' }).click();
    await expect(page.locator('.admin-status')).toContainText(/saved/i);
  });

  test('4 — name field is editable', async ({ page }) => {
    const name = adminField(page, 'Name');
    await expect(name).toBeEditable();
    const value = await name.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('5 — saved tagline appears on public homepage', async ({ page }) => {
    const tagline = adminField(page, 'Tagline / description');
    const original = await tagline.inputValue();
    const marker = `E2E public tagline ${Date.now()}`;
    await tagline.fill(marker);
    await page.getByRole('button', { name: 'Save site & bios' }).click();
    await expect(page.locator('.admin-status')).toContainText(/saved/i);
    await page.goto('/');
    await expect(page.getByText(marker)).toBeVisible({ timeout: 20_000 });
    await page.goto('/admin');
    await openTab(page, 'Site & bios');
    await waitForSiteForm(page);
    await tagline.fill(original);
    await page.getByRole('button', { name: 'Save site & bios' }).click();
  });
});
