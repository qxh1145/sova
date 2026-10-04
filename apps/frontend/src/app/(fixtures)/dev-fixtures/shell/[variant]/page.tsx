import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/layout/SiteShell';
import { fixtures, missingMediaFixtures, variantBFixtures } from '@/dev/fixtures';
import { buildCounterpartMap } from '@/lib/queries/site';
import { resolveDeep } from '@/lib/queries/tokens';
import { pathForRouteId } from '@/lib/routes';
import type { ContentData } from '@/lib/repositories/contracts';

export const dynamic = 'force-dynamic';

export default async function FixtureShellPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;

  let data: ContentData;
  let emptyCounterparts = false;

  switch (variant) {
    case 'default':
    case 'a':
    case 'variant-a':
      data = fixtures;
      break;
    case 'b':
    case 'variant-b':
      data = variantBFixtures;
      break;
    case 'missing-logo':
      data = missingMediaFixtures;
      break;
    case 'no-counterpart':
      data = fixtures;
      emptyCounterparts = true;
      break;
    default:
      notFound();
  }

  const locale = 'vi';
  const rawSettings = data.siteSettings.find((s) => s.locale === locale)!;
  const settings = JSON.stringify(rawSettings).includes('{{site.')
    ? resolveDeep(rawSettings, rawSettings)
    : rawSettings;

  const rawShell = data.shellContent.find((s) => s.locale === locale)!;
  const shellContent = resolveDeep(rawShell, settings);

  const viRawShell = data.shellContent.find((s) => s.locale === 'vi')!;
  const enRawShell = data.shellContent.find((s) => s.locale === 'en')!;
  const viShell = resolveDeep(viRawShell, settings);
  const enShell = resolveDeep(enRawShell, settings);

  const navigation = data.navigation.find((n) => n.locale === locale)!;
  const routes = data.routes;
  const logoAsset = data.assets.find((a) => a.id === settings.logoIds[0]) ?? null;

  const counterparts = emptyCounterparts
    ? {}
    : buildCounterpartMap(routes, locale);

  const headerCtas = {
    vi: {
      label: viShell.headerCta.label,
      href: pathForRouteId(routes, viShell.headerCta.routeId) ?? '/',
    },
    en: {
      label: enShell.headerCta.label,
      href: pathForRouteId(routes, enShell.headerCta.routeId) ?? '/en/home/',
    },
  };

  return (
    <SiteShell
      locale={locale}
      settings={settings}
      navigation={navigation}
      routes={routes}
      shellContent={shellContent}
      headerCtas={headerCtas}
      counterparts={counterparts}
      logoAsset={logoAsset}
    >
      <main id="main" />
    </SiteShell>
  );
}
