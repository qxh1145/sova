import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/layout/SiteShell';
import { fixtures, missingMediaFixtures, variantBFixtures } from '@/dev/fixtures';
import { getShellProps } from '@/lib/queries/site';
import { createMockRepository } from '@/lib/repositories/mock';
import type { ContentData } from '@/lib/repositories/contracts';

export const dynamic = 'force-dynamic';

const VARIANTS: Record<string, ContentData> = {
  default: fixtures,
  a: fixtures,
  'variant-a': fixtures,
  b: variantBFixtures,
  'variant-b': variantBFixtures,
  'missing-logo': missingMediaFixtures,
  'no-counterpart': fixtures,
};

export default async function FixtureShellPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;
  const data = Object.hasOwn(VARIANTS, variant) ? VARIANTS[variant] : undefined;
  if (!data) notFound();

  // Same composition path as the locale layouts, fed from the variant's data.
  const shell = await getShellProps('vi', createMockRepository(data));
  if (variant === 'no-counterpart') shell.counterparts = {};

  return (
    <SiteShell {...shell}>
      <main id="main" />
    </SiteShell>
  );
}
