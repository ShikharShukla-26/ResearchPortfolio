import React, { ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';
import { highlight } from 'sugar-high';

type HeadingProps = ComponentPropsWithoutRef<'h1'>;
type ParagraphProps = ComponentPropsWithoutRef<'p'>;
type ListProps = ComponentPropsWithoutRef<'ul'>;
type ListItemProps = ComponentPropsWithoutRef<'li'>;
type AnchorProps = ComponentPropsWithoutRef<'a'>;
type BlockquoteProps = ComponentPropsWithoutRef<'blockquote'>;

const components = {
  h1: (props: HeadingProps) => <h1 className="content-title" {...props} />,
  h2: (props: HeadingProps) => <h2 className="content-heading" {...props} />,
  h3: (props: HeadingProps) => (
    <h3 className="content-subheading" {...props} />
  ),
  h4: (props: HeadingProps) => (
    <h4 className="content-small-heading" {...props} />
  ),
  p: (props: ParagraphProps) => <p className="content-paragraph" {...props} />,
  ol: (props: ListProps) => (
    <ol className="content-list content-ordered-list" {...props} />
  ),
  ul: (props: ListProps) => <ul className="content-list" {...props} />,
  li: (props: ListItemProps) => <li {...props} />,
  em: (props: ComponentPropsWithoutRef<'em'>) => (
    <em className="content-emphasis" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="content-strong" {...props} />
  ),
  a: ({ href, children, ...props }: AnchorProps) => {
    if (href?.startsWith('/') && !/\.(pdf|pptx|docx?|xlsx?)$/i.test(href)) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    if (href?.startsWith('#') || href?.startsWith('/')) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  code: ({ children, ...props }: ComponentPropsWithoutRef<'code'>) => {
    const codeHTML = highlight(children as string);
    return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
  },
  Table: ({ data }: { data: { headers: string[]; rows: string[][] } }) => (
    <table>
      {data.headers.some((header) => header.trim() !== '') ? (
        <thead>
          <tr>
            {data.headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
      ) : null}
      <tbody>
        {data.rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  Meta: ({ children }: { children: React.ReactNode }) => (
    <p className="article-meta">{children}</p>
  ),
  Callout: ({
    title,
    children
  }: {
    title?: string;
    children: React.ReactNode;
  }) => (
    <aside className="content-callout">
      {title ? <p className="content-callout-title">{title}</p> : null}
      {children}
    </aside>
  ),
  blockquote: (props: BlockquoteProps) => (
    <blockquote className="content-blockquote" {...props} />
  )
};

declare global {
  type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
  return components;
}
