import Link from 'next/link';
import { getPortfolioData } from '@/lib/cms/get-data';

export const dynamic = 'force-dynamic';

export default async function LogsIndexPage() {
  const data = await getPortfolioData();

  return (
    <>
      <nav className="work-nav" aria-label="Back to home">
        <Link href="/" className="text-nav work-back">
          &larr; Shikhar Shukla
        </Link>
      </nav>
      <h1 className="content-title">Logs</h1>
      <p className="content-paragraph">
        Field notes, process updates and work-in-progress reflections.
      </p>
      {data.logs.length === 0 ? (
        <p className="content-paragraph text-nav">No logs published yet.</p>
      ) : (
        <div className="blogs-list">
          {data.logs.map((log) => (
            <a key={log.href} className="blog-row" href={log.href}>
              <span>{log.title}</span>
              <time dateTime={log.dateTime}>{log.date}</time>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
