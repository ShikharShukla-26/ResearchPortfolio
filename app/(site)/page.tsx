import { BioSection } from '../components/bio-section';
import { HomeVisual } from '../components/home-visual';
import { getPortfolioData } from '@/lib/cms/get-data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { site, research, writing, elsewhere, logs } = await getPortfolioData();

  return (
    <div className="home-layout">
      <div className="home-copy">
        <h1 className="site-title">
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="site-title-link"
          >
            {site.name}
          </a>
        </h1>
        <p className="content-subtitle site-tagline">{site.tagline}</p>

        <BioSection
          defaultBioMd={site.bioDefaultMd}
          longBioMd={site.bioLongMd}
        />

        <div className="writing-index">
          <section aria-labelledby="research-heading">
            <h2 id="research-heading">Research</h2>
            <div className="blogs-list">
              {research.map((item) => (
                <a key={item.href} className="blog-row" href={item.href}>
                  <span>{item.title}</span>
                  <time dateTime={item.dateTime}>{item.date}</time>
                </a>
              ))}
            </div>
          </section>

          <section aria-labelledby="writing-heading">
            <h2 id="writing-heading">Writing</h2>
            <div className="blogs-list">
              {writing.map((item) => (
                <a
                  key={item.href}
                  className="blog-row"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{item.title}</span>
                  <time dateTime={item.dateTime}>{item.date}</time>
                </a>
              ))}
            </div>
          </section>

          {logs.length > 0 ? (
            <section aria-labelledby="logs-heading">
              <h2 id="logs-heading">Logs</h2>
              <div className="blogs-list">
                {logs.slice(0, 5).map((item) => (
                  <a key={item.href} className="blog-row" href={item.href}>
                    <span>{item.title}</span>
                    <time dateTime={item.dateTime}>{item.date}</time>
                  </a>
                ))}
              </div>
              {logs.length > 5 ? (
                <p className="content-paragraph">
                  <a href="/logs">View all logs</a>
                </p>
              ) : null}
            </section>
          ) : null}

          <section aria-labelledby="elsewhere-heading">
            <h2 id="elsewhere-heading">Elsewhere</h2>
            <ul className="notes-list">
              {elsewhere.map((link) => (
                <li key={link.href + link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('/') ? undefined : '_blank'}
                    rel={
                      link.href.startsWith('/')
                        ? undefined
                        : 'noopener noreferrer'
                    }
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <HomeVisual />
    </div>
  );
}
