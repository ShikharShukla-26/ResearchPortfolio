import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownBody({ source }: { source: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => <p className="content-paragraph" {...props} />,
        h2: (props) => <h2 className="content-heading" {...props} />,
        h3: (props) => <h3 className="content-subheading" {...props} />,
        ul: (props) => <ul className="content-list" {...props} />,
        ol: (props) => <ol className="content-list content-ordered-list" {...props} />,
        a: (props) => <a {...props} />,
        img: (props) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img {...props} alt={props.alt ?? ''} className="cms-log-image" />
        )
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
