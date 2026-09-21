import { revalidatePath } from 'next/cache';

export function revalidatePublicContent() {
  revalidatePath('/', 'layout');
  revalidatePath('/logs');
  revalidatePath('/work', 'layout');
  revalidatePath('/sitemap.xml');
}
