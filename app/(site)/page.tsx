import { BioSection } from '../components/bio-section';
import { HomeVisual } from '../components/home-visual';
import { ResearchList } from '../components/research-list';
import { getPortfolioData } from '@/lib/cms/get-data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { site, research, writing, logs } = await getPortfolioData();

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
            <ResearchList items={research} />
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
        </div>
      </div>

      <HomeVisual />
    </div>
  );
}
