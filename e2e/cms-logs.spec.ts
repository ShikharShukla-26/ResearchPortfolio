import { test, expect } from '@playwright/test';
import {
  loginAsAdmin,
  openTab,
  requireAdminPassword,
  uniqueSlug
} from './helpers/admin';
import { adminField } from './helpers/fields';

test.describe('Logs', () => {
  test.describe.configure({ mode: 'serial' });

  const slug = uniqueSlug('e2e-log');
  const title = `E2E Log ${slug}`;

  test.beforeEach(async ({ page }) => {
    requireAdminPassword();
    page.on('dialog', (d) => d.accept());
    await loginAsAdmin(page);
    await openTab(page, 'Logs');
  });

  test('1 — logs tab shows New log and reorder hint', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'New log' })).toBeVisible();
    await expect(page.getByText('Drag the handle to reorder')).toBeVisible();
  });

  test('2 — create published log appears in list', async ({ page }) => {
    await page.getByRole('button', { name: 'New log' }).click();
    await expect(page.getByRole('button', { name: 'Save log' })).toBeVisible();
    await adminField(page, 'Slug').fill(slug);
    await adminField(page, 'Title').fill(title);
    await adminField(page, 'Excerpt').fill('E2E excerpt');
    await adminField(page, 'Body (Markdown)').fill('# E2E log body');
    await page.getByRole('checkbox', { name: 'Published' }).check();
    await page.getByRole('button', { name: 'Save log' }).click();
    await expect(page.locator('.admin-status')).toContainText(/saved/i, {
      timeout: 25_000
    });
    await expect(page.getByText(title)).toBeVisible();
  });

  test('3 — log page loads at /logs/[slug]', async ({ page }) => {
    await page.goto(`/logs/${slug}`);
    await expect(page.getByText('E2E log body')).toBeVisible({ timeout: 20_000 });
  });

  test('4 — logs index lists new log', async ({ page }) => {
    await page.goto('/logs');
    await expect(page.getByText(title)).toBeVisible({ timeout: 20_000 });
  });

  test('5 — delete removes log from admin', async ({ page }) => {
    const row = page.locator('.admin-sortable-row', { hasText: title });
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.admin-status')).toContainText(/deleted/i);
    await expect(page.getByText(title)).not.toBeVisible();
  });
});
