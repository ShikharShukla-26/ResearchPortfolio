import { defaultSiteSettings } from './defaults';
import type { SiteSettings } from './types';

/** CMS JSON must not override defaults with empty contact strings. */
export function mergeSiteSettings(
  stored: Partial<SiteSettings> | undefined
): SiteSettings {
  const merged = { ...defaultSiteSettings, ...stored };
  for (const key of ['email', 'phone', 'address'] as const) {
    if (!merged[key]?.trim()) {
      merged[key] = defaultSiteSettings[key];
    }
  }
  return merged;
}
