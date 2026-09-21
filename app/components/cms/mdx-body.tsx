import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '@/mdx-components';

export function MdxBody({ source }: { source: string }) {
  const components = useMDXComponents();
  return <MDXRemote source={source} components={components} />;
}
