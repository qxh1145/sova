import Link from 'next/link';
import type { AssetRef, Locale, Navigation, NavigationItem, RouteEntry, ShellContent, SiteSettings } from '@/types/content';
import { pathForRouteId } from '@/lib/routes';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoLink } from './LogoLink';

export interface HeaderProps {
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
}

function resolveDestination(
  destination: NavigationItem['destination'],
  routes: RouteEntry[],
): string | undefined {
  if (!destination) return undefined;
  if (destination.kind === 'internal') {
    return pathForRouteId(routes, destination.routeId) ?? '#';
  }
  if (destination.kind === 'external') {
    return destination.href;
  }
  return destination.hash;
}

function renderSubItem(child: NavigationItem, routes: RouteEntry[]) {
  const childHref = resolveDestination(child.destination, routes);

  if (child.children && child.children.length > 0) {
    return (
      <li
        key={child.id}
        className="menu-item menu-item-has-children nav-dropdown-col"
      >
        {childHref ? (
          <Link href={childHref}>{child.label}</Link>
        ) : (
          <span>{child.label}</span>
        )}
        <ul className="sub-menu nav-column nav-dropdown-simple dark">
          {child.children.map((grandchild) => {
            const grandHref = resolveDestination(grandchild.destination, routes) ?? '#';
            return (
              <li key={grandchild.id} className="menu-item">
                <Link href={grandHref}>{grandchild.label}</Link>
              </li>
            );
          })}
        </ul>
      </li>
    );
  }

  return (
    <li key={child.id} className="menu-item">
      <Link href={childHref ?? '#'}>{child.label}</Link>
    </li>
  );
}

function DesktopNavItem({ item, routes }: { item: NavigationItem; routes: RouteEntry[] }) {
  const href = resolveDestination(item.destination, routes);

  if (item.children && item.children.length > 0) {
    return (
      <li className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-design-default has-dropdown">
        {href ? (
          <Link href={href} className="nav-top-link" aria-expanded="false" aria-haspopup="menu">
            <span>{item.label}</span>
            <i className="icon-angle-down" aria-hidden="true" />
          </Link>
        ) : (
          <a className="nav-top-link" aria-expanded="false" aria-haspopup="menu">
            <span>{item.label}</span>
            <i className="icon-angle-down" aria-hidden="true" />
          </a>
        )}
        <ul className="sub-menu nav-dropdown nav-dropdown-simple dark">
          {item.children.map((child) => renderSubItem(child, routes))}
        </ul>
      </li>
    );
  }

  return (
    <li className="menu-item menu-item-design-default">
      <Link href={href ?? '#'} className="nav-top-link">
        {item.label}
      </Link>
    </li>
  );
}

export function Header({
  locale,
  settings,
  navigation,
  routes,
  shellContent,
  headerCtas,
  counterparts,
  logoAsset,
}: HeaderProps) {
  const homeRouteId = locale === 'en' ? 'route-en--home' : 'route-root';
  const homeHref = pathForRouteId(routes, homeRouteId) ?? (locale === 'en' ? '/en/home/' : '/');

  return (
    <header id="header" className="header transparent has-transparent has-sticky sticky-jump">
      <div className="header-wrapper">
        <div id="masthead" className="header-main nav-dark">
          <div className="header-inner flex-row container logo-left medium-logo-left" role="navigation">
            {/* Logo */}
            <div id="logo" className="flex-col logo">
              <LogoLink
                logoAsset={logoAsset}
                wordmark={settings.wordmark}
                homeHref={homeHref}
                companyName={settings.companyName}
              />
            </div>

            {/* Mobile Left Elements */}
            <div className="flex-col show-for-medium flex-left">
              <ul className="mobile-nav nav nav-left" />
            </div>

            {/* Left Elements (Desktop Navigation) */}
            <div className="flex-col hide-for-medium flex-left flex-grow">
              <ul className="header-nav header-nav-main nav nav-left nav-size-large nav-spacing-xlarge">
                {navigation.header.map((item) => (
                  <DesktopNavItem key={item.id} item={item} routes={routes} />
                ))}
              </ul>
            </div>

            {/* Right Elements */}
            <div className="flex-col hide-for-medium flex-right">
              <ul className="header-nav header-nav-main nav nav-right nav-size-large nav-spacing-xlarge">
                <li className="html custom html_topbar_right">
                  <LanguageSwitcher
                    locale={locale}
                    labels={shellContent.languageLabels}
                    counterparts={counterparts}
                  />
                </li>
                <li className="html header-button-1">
                  <div className="header-button">
                    <Link
                      href={headerCtas.vi.href}
                      className="button primary"
                      style={{ borderRadius: 9 }}
                    >
                      <span>{headerCtas.vi.label}</span>
                    </Link>
                  </div>
                </li>
                <li className="html header-button-2">
                  <div className="header-button">
                    <Link
                      href={headerCtas.en.href}
                      className="button primary"
                      style={{ borderRadius: 9 }}
                    >
                      <span>{headerCtas.en.label}</span>
                    </Link>
                  </div>
                </li>
              </ul>
            </div>

            {/* Mobile Right Elements */}
            <div className="flex-col show-for-medium flex-right">
              <ul className="mobile-nav nav nav-right">
                <li className="html header-button-1">
                  <div className="header-button">
                    <Link
                      href={headerCtas.vi.href}
                      className="button primary"
                      style={{ borderRadius: 9 }}
                    >
                      <span>{headerCtas.vi.label}</span>
                    </Link>
                  </div>
                </li>
                <li className="html header-button-2">
                  <div className="header-button">
                    <Link
                      href={headerCtas.en.href}
                      className="button primary"
                      style={{ borderRadius: 9 }}
                    >
                      <span>{headerCtas.en.label}</span>
                    </Link>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="container">
            <div className="top-divider full-width" />
          </div>
        </div>

        <div className="header-bg-container fill">
          <div className="header-bg-image fill" />
          <div className="header-bg-color fill" />
        </div>
      </div>
    </header>
  );
}
