import type { ReactNode } from 'react';
import '@/styles/globals.css';
import { RootDocument } from '@/components/layout/RootDocument';
import { SiteShell } from '@/components/layout/SiteShell';
import { getAssets } from '@/lib/queries/assets';
import {
  getCounterpartMap,
  getNavigation,
  getShellContent,
  getSiteSettings,
  listRoutes,
} from '@/lib/queries/site';
import { pathForRouteId } from '@/lib/routes';

export default async function ViRootLayout({ children }: { children: ReactNode }) {
  const locale = 'vi';
  const [settings, navigation, routes, shellContent, enShell, counterparts] =
    await Promise.all([
      getSiteSettings(locale),
      getNavigation(locale),
      listRoutes(),
      getShellContent(locale),
      getShellContent('en'),
      getCounterpartMap(locale),
    ]);
  const viShell = shellContent;

  const logoAssets = await getAssets(settings.logoIds);
  const logoAsset = logoAssets[0] ?? null;

  const headerCtas = {
    vi: {
      label: viShell.headerCta.label,
      href: pathForRouteId(routes, viShell.headerCta.routeId) ?? '/lien-he/',
    },
    en: {
      label: enShell.headerCta.label,
      href: pathForRouteId(routes, enShell.headerCta.routeId) ?? '/en/contact-us/',
    },
  };

  return (
    <RootDocument locale={locale}>
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
        {children}
      </SiteShell>
    </RootDocument>
  );
}
