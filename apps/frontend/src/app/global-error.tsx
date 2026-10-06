'use client';

import '@/styles/globals.css';
import { usePathname } from 'next/navigation';
import { PageError } from '@/components/layout/PageError';
import { RootDocument } from '@/components/layout/RootDocument';
import { pageErrors } from '@/data/errors';

// Root layouts query the repository; their errors bypass the segment error.tsx and land here.
export default function GlobalError({ reset }: { reset: () => void }) {
  const locale = usePathname()?.startsWith('/en/') ? 'en' : 'vi';
  return (
    <RootDocument locale={locale}>
      <PageError copy={pageErrors[locale]} reset={reset} />
    </RootDocument>
  );
}
