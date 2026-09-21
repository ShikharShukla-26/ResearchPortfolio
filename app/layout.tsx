import './globals.css';
import './site.css';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { site } from './site-data';

export const metadata: Metadata = {
  metadataBase: new URL('https://shikharshukla.dev'),
  alternates: {
    canonical: '/'
  },
  title: {
    default: 'Shikhar Shukla',
    template: '%s | Shikhar Shukla'
  },
  description:
    'Behavioral & UX researcher — workplace ethnography, heuristic evaluation and writing on how digital products shape attention.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className="antialiased">
        <main className="site-shell">
          <article className="content-frame">{children}</article>
          <Footer />
        </main>
        <Analytics />
      </body>
    </html>
  );
}

function Footer() {
  const links = [
    { name: 'LinkedIn', url: site.linkedin },
    { name: 'Substack', url: site.substack },
    { name: 'Email', url: `mailto:${site.email}` },
    { name: 'Resume', url: site.resume }
  ];

  return (
    <footer className="site-footer">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          className="text-nav"
          target={link.url.startsWith('/') ? undefined : '_blank'}
          rel={link.url.startsWith('/') ? undefined : 'noopener noreferrer'}
        >
          {link.name}
        </a>
      ))}
    </footer>
  );
}
