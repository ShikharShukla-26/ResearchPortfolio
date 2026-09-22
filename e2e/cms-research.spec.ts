import { test, expect } from '@playwright/test';
import {
  loginAsAdmin,
  openTab,
  requireAdminPassword,
  uniqueSlug
} from './helpers/admin';
import { adminField } from './helpers/fields';

test.describe('Research', () => {
  test.describe.configure({ mode: 'serial' });

  const slug = uniqueSlug('e2e-research');
  const title = `E2E Research ${slug}`;

  test.beforeEach(async ({ page }) => {
    requireAdminPassword();
    page.on('dialog', (d) => d.accept());
    await loginAsAdmin(page);
    await openTab(page, 'Research');
  });

  test('1 — research list shows reorder hint and New case study', async ({
    page
  }) => {
    await expect(page.getByText('Drag the handle to reorder')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'New case study' })
    ).toBeVisible();
  });

  test('2 — create published case study appears in admin list', async ({
    page
  }) => {
    await page.getByRole('button', { name: 'New case study' }).click();
    const editor = page.locator('.admin-card').filter({
      has: page.getByRole('button', { name: 'Save research' })
    });
    await expect(editor).toBeVisible();
    await adminField(editor, 'Slug (URL segment)').fill(slug);
    await adminField(editor, 'Title').fill(title);
    await adminField(editor, 'SEO description').fill('E2E description');
    await adminField(editor, 'Date (display)').fill('E2E 2026');
    await page.getByRole('checkbox', { name: 'Published' }).check();
    await page.getByRole('button', { name: 'Save research' }).click();
    await expect(page.locator('.admin-status')).toContainText(/saved/i, {
      timeout: 25_000
    });
    await expect(
      page.locator('.admin-sortable-row', { hasText: `/work/${slug}` })
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.locator('.admin-sortable-row strong', { hasText: title })
    ).toBeVisible();
  });

  test('3 — published case study appears on homepage Research section', async ({
    page
  }) => {
    await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Research' })).toBeVisible();
    await expect(page.getByText(title)).toBeVisible({ timeout: 20_000 });
  });

  test('4 — draft case study is hidden from homepage', async ({ page }) => {
    const draftSlug = uniqueSlug('e2e-draft');
    const draftTitle = `E2E Draft ${draftSlug}`;
    await page.getByRole('button', { name: 'New case study' }).click();
    const editor = page.locator('.admin-card').filter({
      has: page.getByRole('button', { name: 'Save research' })
    });
    await adminField(editor, 'Slug (URL segment)').fill(draftSlug);
    await adminField(editor, 'Title').fill(draftTitle);
    await page.getByRole('checkbox', { name: 'Published' }).uncheck();
    await expect(page.locator('.admin-draft-banner')).toBeVisible();
    await page.getByRole('button', { name: 'Save research' }).click();
    await expect(page.locator('.admin-status')).toContainText(/draft/i);
    await page.goto('/');
    await expect(page.getByText(draftTitle)).not.toBeVisible();
    await page.goto('/admin');
    await openTab(page, 'Research');
    const row = page.locator('.admin-sortable-row', { hasText: draftTitle });
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.admin-status')).toContainText(/deleted/i);
  });

  test('5 — reorder via API then delete published case study', async ({ page }) => {
    await expect(
      page.locator('.admin-sortable-row', { hasText: `/work/${slug}` })
    ).toBeVisible({ timeout: 15_000 });
    const researchRes = await page.request.get('/api/admin/research');
    expect(researchRes.ok()).toBeTruthy();
    const items = (await researchRes.json()) as Array<{ id: number }>;
    const orderedIds = items.map((item) => item.id);
    if (orderedIds.length >= 2) {
      const rotated = [...orderedIds.slice(1), orderedIds[0]];
      const reorderRes = await page.request.put('/api/admin/reorder', {
        data: { kind: 'research', ids: rotated }
      });
      expect(reorderRes.ok()).toBeTruthy();
      await page.reload();
      await openTab(page, 'Research');
    }
    const row = page.locator('.admin-sortable-row', { hasText: `/work/${slug}` });
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.admin-status')).toContainText(/deleted/i, {
      timeout: 20_000
    });
    await expect(page.getByText(title)).not.toBeVisible();
  });
});
