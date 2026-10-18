import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function DevFixtureUtilityErrorPage() {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  throw new Error('Simulated utility route failure for error boundary verification');
}
