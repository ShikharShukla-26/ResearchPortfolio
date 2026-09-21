import Link from 'next/link';

export default function WorkLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="work-nav" aria-label="Back to home">
        <Link href="/" className="text-nav work-back">
          &larr; Shikhar Shukla
        </Link>
      </nav>
      {children}
    </>
  );
}
