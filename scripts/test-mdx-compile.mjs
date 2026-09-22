import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileMDX } from 'next-mdx-remote/rsc';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const raw = readFileSync(
  resolve(root, 'content/seed/six-week-silence.mdx'),
  'utf8'
);
const source = raw.replace(/export const metadata = \{[\s\S]*?\};\n\n?/, '');

try {
  const { content } = await compileMDX({ source, components: {} });
  console.log('Compile OK', Boolean(content));
} catch (err) {
  console.error('Compile failed', err);
  process.exit(1);
}
