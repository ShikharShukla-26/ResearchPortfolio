import '../site.css';
import { getPortfolioData } from '@/lib/cms/get-data';

export default async function SiteLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const { footer } = await getPortfolioData();

  return (
    <main className="site-shell">
      <article className="content-frame">{children}</article>
      <footer className="site-footer">
        {footer.map((link) => (
          <a
            key={link.label + link.href}
            href={link.href}
            className="text-nav"
            target={link.href.startsWith('/') ? undefined : '_blank'}
            rel={link.href.startsWith('/') ? undefined : 'noopener noreferrer'}
          >
            {link.label}
          </a>
        ))}
      </footer>
    </main>
  );
}
