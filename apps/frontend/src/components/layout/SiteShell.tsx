import type { ReactNode } from 'react';
import type { AssetRef, Locale, Navigation, RouteEntry, ShellContent, SiteSettings } from '@/types/content';
import { Footer } from './Footer';
import { Header } from './Header';

export interface SiteShellProps {
  locale: Locale;
  settings: SiteSettings;
  navigation: Navigation;
  routes: RouteEntry[];
  shellContent: ShellContent;
  headerCtas: {
    vi: { label: string; href: string };
    en: { label: string; href: string };
  };
  counterparts: Record<string, string>;
  logoAsset?: AssetRef | null;
  children?: ReactNode;
}

export function SiteShell({
  locale,
  settings,
  navigation,
  routes,
  shellContent,
  headerCtas,
  counterparts,
  logoAsset,
  children,
}: SiteShellProps) {
  return (
    <div id="wrapper">
      <Header
        locale={locale}
        settings={settings}
        navigation={navigation}
        routes={routes}
        shellContent={shellContent}
        headerCtas={headerCtas}
        counterparts={counterparts}
        logoAsset={logoAsset}
      />
      {children}
      <Footer
        locale={locale}
        settings={settings}
        navigation={navigation}
        routes={routes}
        shellContent={shellContent}
        logoAsset={logoAsset}
      />
    </div>
  );
}
