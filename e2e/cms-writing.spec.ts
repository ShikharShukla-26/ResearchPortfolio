import { test, expect } from '@playwright/test';
import { loginAsAdmin, openTab, requireAdminPassword } from './helpers/admin';
import { adminField } from './helpers/fields';

test.describe('Writing', () => {
  test.describe.configure({ mode: 'serial' });

  const title = `E2E Writing ${Date.now()}`;
  const href = 'https://example.com/e2e-writing';

  test.beforeEach(async ({ page }) => {
    requireAdminPassword();
    page.on('dialog', (d) => d.accept());
    await loginAsAdmin(page);
    await openTab(page, 'Writing');
  });

  test('1 — writing tab shows Add writing link and reorder hint', async ({
    page
  }) => {
    await expect(
      page.getByRole('button', { name: 'Add writing link' })
    ).toBeVisible();
    await expect(page.getByText('Drag the handle to reorder')).toBeVisible();
  });

  test('2 — add writing link creates a new row', async ({ page }) => {
    await page.getByRole('button', { name: 'Add writing link' }).click();
    await expect(page.locator('.admin-status')).toContainText(/added/i, {
      timeout: 20_000
    });
    await expect(page.locator('.admin-sortable-row').last()).toBeVisible();
  });

  test('3 — edit title and URL then save persists', async ({ page }) => {
    await page.getByRole('button', { name: 'Add writing link' }).click();
    await expect(page.locator('.admin-status')).toContainText(/added/i);
    const row = page.locator('.admin-sortable-row').last();
    await adminField(row, 'Title').fill(title);
    await adminField(row, 'URL').fill(href);
    await row.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.admin-status')).toContainText(/saved/i);
    await page.reload();
    await openTab(page, 'Writing');
    const savedRow = page.locator('.admin-sortable-row').filter({
      has: page.locator(`input[value="${title}"]`)
    });
    await expect(savedRow).toBeVisible({ timeout: 15_000 });
    await expect(adminField(savedRow, 'URL')).toHaveValue(href);
  });

  test('4 — published writing link appears on homepage Writing section', async ({
    page
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Writing' })).toBeVisible();
    await expect(page.getByText(title)).toBeVisible({ timeout: 20_000 });
  });

  test('5 — delete removes writing row', async ({ page }) => {
    const row = page.locator('.admin-sortable-row').filter({
      has: page.locator(`input[value="${title}"]`)
    });
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.admin-status')).toContainText(/deleted/i);
    await expect(row).not.toBeVisible();
  });
});
