import { test, expect } from '@playwright/test';
import { loginAsAdmin, openTab, requireAdminPassword } from './helpers/admin';
import { adminField } from './helpers/fields';

test.describe('Links & social', () => {
  test.describe.configure({ mode: 'serial' });

  const label = `E2E Link ${Date.now()}`;
  const href = 'https://example.com/e2e-link';

  test.beforeEach(async ({ page }) => {
    requireAdminPassword();
    page.on('dialog', (d) => d.accept());
    await loginAsAdmin(page);
    await openTab(page, 'Links & social');
  });

  function elsewhereSection(page: import('@playwright/test').Page) {
    return page.locator('.admin-card').filter({
      has: page.getByRole('heading', { name: 'Elsewhere list' })
    });
  }

  test('1 — shows Elsewhere and Footer sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Elsewhere list' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Footer links' })).toBeVisible();
  });

  test('2 — add link in Elsewhere creates editable row', async ({ page }) => {
    const section = elsewhereSection(page);
    await section.getByRole('button', { name: 'Add link' }).click();
    await expect(page.locator('.admin-status')).toContainText(/added/i);
    await expect(section.locator('input').first()).toBeVisible();
  });

  test('3 — edit label and URL then Save elsewhere persists', async ({ page }) => {
    const section = elsewhereSection(page);
    await section.getByRole('button', { name: 'Add link' }).click();
    await expect(page.locator('.admin-status')).toContainText(/added/i);
    const row = section.locator('.admin-sortable-row').last();
    await adminField(row, 'Label').fill(label);
    await adminField(row, 'URL').fill(href);
    await section.getByRole('button', { name: 'Save elsewhere' }).click();
    await expect(page.locator('.admin-status')).toContainText(/saved/i);
    await page.reload();
    await openTab(page, 'Links & social');
    await expect(
      elsewhereSection(page).locator('.admin-sortable-row').filter({
        has: page.locator(`input[value="${label}"]`)
      })
    ).toBeVisible({ timeout: 15_000 });
  });

  test('4 — elsewhere link visible on homepage Elsewhere section', async ({
    page
  }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: label })).toBeVisible({
      timeout: 20_000
    });
  });

  test('5 — delete removes link from Elsewhere', async ({ page }) => {
    const section = elsewhereSection(page);
    const row = section.locator('.admin-sortable-row').filter({
      has: page.locator(`input[value="${label}"]`)
    });
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.admin-status')).toContainText(/deleted/i);
    await expect(row).not.toBeVisible();
  });
});
