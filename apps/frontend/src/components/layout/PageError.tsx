'use client';

import { startTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ErrorCopy } from '@/types/content';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export interface PageErrorProps {
  copy: ErrorCopy;
  reset?: () => void;
}

/** Localized route error state; never shows the error itself. */
export function PageError({ copy, reset }: PageErrorProps) {
  const router = useRouter();

  // reset() alone re-renders the client tree; refresh re-fetches the failed server component.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset?.();
    });

  return (
    <main id="main" className="page-error-main">
      <Container className="text-center" style={{ padding: '80px 20px' }}>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
        {reset && (
          <Button variant="primary" onClick={retry}>
            {copy.retry}
          </Button>
        )}
      </Container>
    </main>
  );
}
