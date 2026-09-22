import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '@/mdx-components';

export async function MdxBody({ source }: { source: string }) {
  const components = useMDXComponents();
  return await MDXRemote({ source, components });
}
