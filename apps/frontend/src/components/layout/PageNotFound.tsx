import type { ReactNode } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';

export interface PageNotFoundProps {
  copy: { title: string; description: string; home: string };
  homeHref: string;
  /** Without the site shell the section has to fill the viewport itself. */
  fullPage?: boolean;
  children?: ReactNode;
}

export function PageNotFound({ copy, homeHref, fullPage, children }: PageNotFoundProps) {
  return (
    <main
      id="main"
      className="page-error-main"
      style={fullPage ? { minHeight: '100vh' } : undefined}
    >
      {/* A React title: the metadata export is dropped when the client hydrates a not-found page. */}
      <title>{`${copy.title} | Sova`}</title>
      <Container className="text-center" style={{ padding: '160px 20px 80px' }}>
        <h1>404</h1>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
        <Link href={homeHref} className="button primary">
          <span>{copy.home}</span>
        </Link>
        {children}
      </Container>
    </main>
  );
}
