import '../site.css';
import { ContactFooter } from '../components/contact-footer';
import { NewTabAnchor } from '../components/new-tab-anchor';
import { getPortfolioData } from '@/lib/cms/get-data';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const { site, footer } = await getPortfolioData();

  return (
    <main className="site-shell">
      <article className="content-frame">{children}</article>
      <footer className="site-footer">
        {footer.map((link) => (
          <NewTabAnchor
            key={link.label + link.href}
            href={link.href}
            className="text-nav"
          >
            {link.label}
          </NewTabAnchor>
        ))}
        <ContactFooter site={site} />
      </footer>
    </main>
  );
}
