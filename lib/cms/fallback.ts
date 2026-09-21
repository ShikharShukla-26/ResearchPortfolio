import { promises as fs } from 'fs';
import path from 'path';

export async function readResearchFallback(slug: string) {
  const filePath = path.join(process.cwd(), 'content', 'seed', `${slug}.mdx`);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const bodyMdx = raw.replace(/export const metadata = \{[\s\S]*?\};\n\n?/, '');
    return { bodyMdx };
  } catch {
    return null;
  }
}
