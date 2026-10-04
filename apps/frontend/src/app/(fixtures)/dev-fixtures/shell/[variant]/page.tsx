import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/layout/SiteShell';
import { fixtures, missingMediaFixtures, noPhonesFixtures, variantBFixtures } from '@/dev/fixtures';
import { getShellProps } from '@/lib/queries/site';
import { createMockRepository } from '@/lib/repositories/mock';
import type { ContentData } from '@/lib/repositories/contracts';
import type { Locale } from '@/types/content';
import { ConsultScenario } from './ConsultScenario';

export const dynamic = 'force-dynamic';

const VARIANTS: Record<string, ContentData> = {
  default: fixtures,
  a: fixtures,
  'variant-a': fixtures,
  b: variantBFixtures,
  'variant-b': variantBFixtures,
  'missing-logo': missingMediaFixtures,
  'no-counterpart': fixtures,
  'no-phones': noPhonesFixtures,
  'consult-success': fixtures,
  'consult-error': fixtures,
};

export default async function FixtureShellPage({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams?: Promise<{ locale?: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;
  const { locale: rawLocale } = (await searchParams) ?? {};
  const locale: Locale = rawLocale === 'en' ? 'en' : 'vi';

  const data = Object.hasOwn(VARIANTS, variant) ? VARIANTS[variant] : undefined;
  if (!data) notFound();

  // Same composition path as the locale layouts, fed from the variant's data.
  const shell = await getShellProps(locale, createMockRepository(data));
  if (variant === 'no-counterpart') shell.counterparts = {};

  const shellElement = (
    <SiteShell {...shell}>
      <main id="main" style={{ paddingTop: 120 }}>
        <Link href="/dev-fixtures/overlay/single" data-testid="fixture-client-nav">Nav {/* business-text-ok: fixture nav */}</Link>
        <div style={{ height: 2500 }} />
      </main>
    </SiteShell>
  );

  if (variant === 'consult-success' || variant === 'consult-error') {
    return (
      <ConsultScenario scenario={variant === 'consult-success' ? 'success' : 'error'}>
        {shellElement}
      </ConsultScenario>
    );
  }

  return shellElement;
}
