import { BioSection } from '../components/bio-section';
import { HomeVisual } from '../components/home-visual';
import { NewTabAnchor } from '../components/new-tab-anchor';
import { ResearchList } from '../components/research-list';
import { getPortfolioData } from '@/lib/cms/get-data';
import { splitResearch, splitWriting } from '@/lib/home-sections';

export const dynamic = 'force-dynamic';

function WritingRows({
  items
}: {
  items: Array<{ href: string; title: string; date: string; dateTime: string }>;
}) {
  return (
    <div className="blogs-list">
      {items.map((item) => (
        <NewTabAnchor key={item.href} className="blog-row" href={item.href}>
          <span>{item.title}</span>
          <time dateTime={item.dateTime}>{item.date}</time>
        </NewTabAnchor>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const { site, research, writing, logs } = await getPortfolioData();
  const { featured: featuredResearch, other: otherStudies } =
    splitResearch(research);
  const { featured: featuredWriting, other: otherWriting } =
    splitWriting(writing);

  return (
    <div className="home-layout">
      <div className="home-copy">
        <h1 className="site-title">
          <NewTabAnchor href={site.linkedin} className="site-title-link">
            {site.name}
          </NewTabAnchor>
        </h1>
        <p className="content-subtitle site-tagline">{site.tagline}</p>

        <BioSection
          defaultBioMd={site.bioDefaultMd}
          longBioMd={site.bioLongMd}
        />

        <div className="writing-index">
          <section aria-labelledby="selected-work-heading">
            <h2 id="selected-work-heading">Selected Work</h2>
            <ResearchList items={featuredResearch} />
          </section>

          {otherStudies.length > 0 ? (
            <section aria-labelledby="other-studies-heading">
              <h2 id="other-studies-heading">Other Studies</h2>
              <ResearchList items={otherStudies} />
            </section>
          ) : null}

          <section aria-labelledby="writing-heading">
            <h2 id="writing-heading">Writing</h2>
            <WritingRows items={featuredWriting} />
          </section>

          {otherWriting.length > 0 ? (
            <section aria-labelledby="other-writing-heading">
              <h2 id="other-writing-heading">Other Writing</h2>
              <WritingRows items={otherWriting} />
            </section>
          ) : null}

          {logs.length > 0 ? (
            <section aria-labelledby="logs-heading">
              <h2 id="logs-heading">Logs</h2>
              <div className="blogs-list">
                {logs.slice(0, 5).map((item) => (
                  <NewTabAnchor
                    key={item.href}
                    className="blog-row"
                    href={item.href}
                  >
                    <span>{item.title}</span>
                    <time dateTime={item.dateTime}>{item.date}</time>
                  </NewTabAnchor>
                ))}
              </div>
              {logs.length > 5 ? (
                <p className="content-paragraph">
                  <NewTabAnchor href="/logs">View all logs</NewTabAnchor>
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
