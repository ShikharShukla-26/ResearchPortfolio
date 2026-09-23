import { NewTabAnchor } from '@/app/components/new-tab-anchor';

export default function WorkLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="work-nav" aria-label="Back to home">
        <NewTabAnchor href="/" className="text-nav work-back">
          &larr; Shikhar Shukla
        </NewTabAnchor>
      </nav>
      {children}
    </>
  );
}
