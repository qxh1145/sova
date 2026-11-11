import '@/styles/globals.css';
import Link from 'next/link';
import { PageNotFound } from '@/components/layout/PageNotFound';
import { RootDocument } from '@/components/layout/RootDocument';
import { notFoundCopy } from '@/data/errors';

// Unmatched URLs skip every layout, and this file receives no path, so it offers both locales.
export default function GlobalNotFound() {
  return (
    <RootDocument locale="vi">
      <PageNotFound copy={notFoundCopy.vi} homeHref="/" fullPage>
        <p style={{ marginTop: 16 }}>
          <Link href="/en/home/" lang="en" style={{ color: '#fff', textDecoration: 'underline' }}>
            {notFoundCopy.en.title}. {notFoundCopy.en.home}
          </Link>
        </p>
      </PageNotFound>
    </RootDocument>
  );
}
