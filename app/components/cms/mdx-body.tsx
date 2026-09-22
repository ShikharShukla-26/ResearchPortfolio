import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '@/mdx-components';
import { prepareMdxForRender } from '@/lib/cms/prepare-mdx';

export async function MdxBody({ source }: { source: string }) {
  const components = useMDXComponents();
  const prepared = prepareMdxForRender(source);
  return await MDXRemote({ source: prepared, components });
}
