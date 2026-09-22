/**
 * Set NEXT_PUBLIC_SITE_URL on Vercel after you connect a custom domain
 * (recommended: https://research.shikharshukla.dev).
 */
export const RECOMMENDED_CUSTOM_DOMAIN = 'https://research.shikharshukla.dev';

/** Public site URL for metadata, sitemap, and docs. */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
  }
  return 'http://localhost:3000';
}
