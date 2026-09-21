import { revalidatePath } from 'next/cache';

export function revalidatePublicContent(options?: {
  workSlug?: string;
  logSlug?: string;
}) {
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/logs', 'layout');
  revalidatePath('/logs');
  revalidatePath('/work', 'layout');
  revalidatePath('/sitemap.xml');
  if (options?.workSlug) {
    revalidatePath(`/work/${options.workSlug}`);
  }
  if (options?.logSlug) {
    revalidatePath(`/logs/${options.logSlug}`);
  }
}
