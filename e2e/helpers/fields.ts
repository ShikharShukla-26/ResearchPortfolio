import type { Locator, Page } from '@playwright/test';

/** Admin inputs use bare <label> text without htmlFor — match label inside each .admin-field. */
export function adminField(scope: Page | Locator, label: string): Locator {
  const safe = label.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return scope
    .locator(`.admin-field:has(> label:text-is("${safe}"))`)
    .locator('input, textarea')
    .first();
}

export async function waitForSiteForm(page: Page) {
  await adminField(page, 'Name').waitFor({ state: 'visible', timeout: 45_000 });
}
