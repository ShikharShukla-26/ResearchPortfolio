import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  pageExtensions: ['mdx', 'ts', 'tsx'],
  // DB-backed redirects are optional; loading postgres from next.config breaks
  // Vercel builds when POSTGRES_URL is set (compiled config path resolution).
  async redirects() {
    return [];
  },
  experimental: {
    mdxRs: { mdxType: 'gfm' }
  }
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
