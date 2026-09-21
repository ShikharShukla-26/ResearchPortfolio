import { BioSection } from './components/bio-section';
import { HomeVisual } from './components/home-visual';
import { elsewhere, research, site, writing } from './site-data';

export default function HomePage() {
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

        <BioSection />

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

          <section aria-labelledby="elsewhere-heading">
            <h2 id="elsewhere-heading">Elsewhere</h2>
            <ul className="notes-list">
              {elsewhere.map((link) => (
                <li key={link.href}>
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
