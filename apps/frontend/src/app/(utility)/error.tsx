'use client';

import { PageError } from '@/components/layout/PageError';
import { pageErrors } from '@/data/errors';

export default function UtilityError({ reset }: { reset: () => void }) {
  return <PageError copy={pageErrors.vi} reset={reset} />;
}
