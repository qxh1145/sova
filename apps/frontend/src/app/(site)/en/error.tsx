'use client';

import { PageError } from '@/components/layout/PageError';
import { pageErrors } from '@/data/errors';

export default function EnError({ reset }: { reset: () => void }) {
  return <PageError copy={pageErrors.en} reset={reset} />;
}
