import type { ReactNode } from 'react';
import type { AssetRef, Locale, Navigation, RouteEntry, ShellContent, SiteSettings } from '@/types/content';
import { Footer } from './Footer';
import { Header, type HeaderProps } from './Header';
import { ShellOverlayProvider } from './ShellOverlayProvider';
import { MobileMenuDrawer } from './MobileMenu';
import { MobileMenuPanel } from './MobileMenuPanel';
import { MobileContactBar } from './MobileContactBar';
import { FloatingContactActions } from './FloatingContactActions';
import { CustomCursor } from './CustomCursor';

export interface SiteShellProps {
  locale: Locale;
  settings: SiteSettings;
  navigation: Navigation;
  routes: RouteEntry[];
  shellContent: ShellContent;
  headerCtas: HeaderProps['headerCtas'];
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
  const contactHref = headerCtas[locale].href;

  return (
    <ShellOverlayProvider>
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
      <MobileMenuDrawer labels={shellContent.mobileMenu}>
        <MobileMenuPanel
          locale={locale}
          settings={settings}
          navigation={navigation}
          routes={routes}
          shellContent={shellContent}
          counterparts={counterparts}
          logoAsset={logoAsset}
        />
      </MobileMenuDrawer>
      <MobileContactBar
        labels={shellContent.contactBar}
        settings={settings}
        contactHref={contactHref}
      />
      <FloatingContactActions
        labels={shellContent.floatingContacts}
        settings={settings}
      />
      <CustomCursor />
    </ShellOverlayProvider>
  );
}
