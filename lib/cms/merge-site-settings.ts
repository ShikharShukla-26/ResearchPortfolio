import { defaultSiteSettings } from './defaults';
import type { SiteSettings } from './types';

export function mergeSiteSettings(
  stored: Partial<SiteSettings> | null | undefined
): SiteSettings {
  const merged = { ...defaultSiteSettings, ...stored };
  if (!merged.phone?.trim()) merged.phone = defaultSiteSettings.phone;
  if (!merged.address?.trim()) merged.address = defaultSiteSettings.address;
  if (!merged.email?.trim()) merged.email = defaultSiteSettings.email;
  return merged;
}
