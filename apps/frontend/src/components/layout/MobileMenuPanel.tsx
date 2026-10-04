import Link from 'next/link';
import type {
  AssetRef,
  Locale,
  Navigation,
  NavigationItem,
  RouteEntry,
  ShellContent,
  SiteSettings,
} from '@/types/content';
import { pathForRouteId } from '@/lib/routes';
import { resolveDestination } from './Header';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoLink } from './LogoLink';
import { MobileMenuItem } from './MobileMenuItem';

export interface MobileMenuPanelProps {
  locale: Locale;
  settings: SiteSettings;
  navigation: Navigation;
  routes: RouteEntry[];
  shellContent: ShellContent;
  counterparts: Record<string, string>;
  logoAsset?: AssetRef | null;
}

function renderMobileNavItems(
  items: NavigationItem[],
  routes: RouteEntry[],
  toggleLabel: string,
) {
  return items.map((item) => {
    const href = resolveDestination(item.destination, routes);
    if (item.children && item.children.length > 0) {
      return (
        <MobileMenuItem
          key={item.id}
          id={item.id}
          href={href}
          label={item.label}
          toggleLabel={toggleLabel}
        >
          {renderMobileNavItems(item.children, routes, toggleLabel)}
        </MobileMenuItem>
      );
    }
    return (
      <li key={item.id} className="">
        <Link href={href ?? '#'}>{item.label}</Link>
      </li>
    );
  });
}

export function MobileMenuPanel({
  locale,
  settings,
  navigation,
  routes,
  shellContent,
  counterparts,
  logoAsset,
}: MobileMenuPanelProps) {
  const homeRouteId = locale === 'en' ? 'route-en--home' : 'route-root';
  const homeHref = pathForRouteId(routes, homeRouteId) ?? (locale === 'en' ? '/en/home/' : '/');

  return (
    <div className="row row-collapse row_menu" id="row-1555793899">
      <div id="col-1917650192" className="col small-12 large-12">
        <div className="col-inner">
          {/* 1. Logo or wordmark */}
          <div className="img has-hover x md-x lg-x y md-y lg-y" id="image_379385419">
            <LogoLink
              logoAsset={logoAsset}
              wordmark={settings.wordmark}
              homeHref={homeHref}
              companyName={settings.companyName}
            />
          </div>

          {/* 2. Tagline */}
          <h3>{shellContent.mobileMenu.tagline}</h3>

          {/* 3. Menu heading & 4. Accordion menu */}
          <div id="text-1183739128" className="text show-for-small">
            <h4>{shellContent.mobileMenu.menuHeading}</h4>
            <div className="accordion-mobile-menu">
              <ul id="menu-main-menu-1" className="accordion-menu">
                {renderMobileNavItems(
                  navigation.mobile,
                  routes,
                  shellContent.mobileMenu.toggleSubmenu,
                )}
              </ul>
            </div>
          </div>

          {/* 5. LanguageSwitcher */}
          <div id="text-1638237188" className="text show-for-small">
            <LanguageSwitcher
              locale={locale}
              labels={shellContent.languageLabels}
              counterparts={counterparts}
            />
          </div>

          <div
            id="gap-685768081"
            className="gap-element clearfix show-for-small"
            style={{ display: 'block', height: 'auto', paddingTop: 30 }}
          />

          {/* 6. Contact heading */}
          <div id="text-101127661" className="text tt_lhmenu">
            <h4>{shellContent.mobileMenu.contactHeading}</h4>
          </div>

          {/* 7. Address, phones and email from SiteSettings */}
          {settings.address && (
            <a
              className="plain"
              href={settings.mapEmbedUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="icon-box featured-box icon-box-left text-left">
                <div className="icon-box-img" style={{ width: 25 }}>
                  <div className="icon">
                    <div className="icon-inner" style={{ color: '#0065df' }}>
                      <i className="icon-map-pin-fill" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="icon-box-text last-reset">
                  <p>{settings.address}</p>
                </div>
              </div>
            </a>
          )}

          {settings.phones.map((phone) => (
            <a key={phone.href} className="plain" href={phone.href}>
              <div className="icon-box featured-box icon-box-left text-left">
                <div className="icon-box-img" style={{ width: 25 }}>
                  <div className="icon">
                    <div className="icon-inner">
                      <i className="icon-phone" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="icon-box-text last-reset">
                  <p>{phone.label}</p>
                </div>
              </div>
            </a>
          ))}

          {settings.email && (
            <a className="plain" href={`mailto:${settings.email}`}>
              <div className="icon-box featured-box icon-box-left text-left">
                <div className="icon-box-img" style={{ width: 25 }}>
                  <div className="icon">
                    <div className="icon-inner">
                      <i className="icon-envelop" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="icon-box-text last-reset">
                  <p>{settings.email}</p>
                </div>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
