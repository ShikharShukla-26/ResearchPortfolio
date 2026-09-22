import './globals.css';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { getSiteSettingsSafe } from '@/lib/cms/get-data';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettingsSafe();
  return {
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical: '/'
    },
    title: {
      default: site.name,
      template: `%s | ${site.name}`
    },
    description: site.tagline
  };
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className="antialiased">{children}<Analytics /></body>
    </html>
  );
}
