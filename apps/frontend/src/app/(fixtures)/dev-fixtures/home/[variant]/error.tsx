'use client';

import { useSearchParams } from 'next/navigation';
import { PageError } from '@/components/layout/PageError';
import { pageErrors } from '@/data/errors';

export default function DevFixtureHomeError({ reset }: { reset: () => void }) {
  const locale = useSearchParams().get('locale') === 'en' ? 'en' : 'vi';
  return <PageError copy={pageErrors[locale]} reset={reset} />;
}
