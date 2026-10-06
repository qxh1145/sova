import type { Locale } from '@/types/content';
import { homeErrors } from '@/data/errors';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export interface HomeErrorProps {
  locale?: Locale;
  reset?: () => void;
}

export function HomeError({ locale = 'vi', reset }: HomeErrorProps) {
  const errorCopy = homeErrors[locale] ?? homeErrors.vi;

  return (
    <main id="main" className="home-error-main">
      <Container className="text-center" style={{ padding: '80px 20px' }}>
        <h2>{errorCopy.title}</h2>
        <p>{errorCopy.description}</p>
        {reset && (
          <Button variant="primary" onClick={reset}>
            {errorCopy.retry}
          </Button>
        )}
      </Container>
    </main>
  );
}
