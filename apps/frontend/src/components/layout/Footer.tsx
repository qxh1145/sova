import Link from 'next/link';
import type {
  AssetRef,
  Locale,
  Navigation,
  RouteEntry,
  ShellContent,
  SiteSettings,
} from '@/types/content';
import { homeHref as homeHrefFor, pathForRouteId, resolveDestination } from '@/lib/routes';
import { FooterCTA } from './FooterCTA';
import { LogoLink } from './LogoLink';

export interface FooterProps {
  locale: Locale;
  settings: SiteSettings;
  navigation: Navigation;
  routes: RouteEntry[];
  shellContent: ShellContent;
  logoAsset?: AssetRef | null;
}

export function Footer({
  locale,
  settings,
  navigation,
  routes,
  shellContent,
  logoAsset,
}: FooterProps) {
  const homeHref = homeHrefFor(routes, locale);
  const targetHref =
    pathForRouteId(routes, shellContent.footerCta.targetRouteId) ??
    (locale === 'en' ? '/en/contact-us/' : '/lien-he/');

  const companyAt = settings.companyName
    ? shellContent.copyright.indexOf(settings.companyName)
    : -1;
  const hasCompanyInCopyright = companyAt >= 0;
  const copyrightBefore = shellContent.copyright.slice(0, Math.max(companyAt, 0));
  const copyrightAfter = shellContent.copyright.slice(companyAt + settings.companyName.length);

  return (
    <footer id="footer" className="footer-wrapper">
      <FooterCTA headingLines={shellContent.footerCta.headingLines} targetHref={targetHref} />

      <section className="section ss-footer" id="section_3912539">
        <div className="section-bg fill">
          <div className="section-bg-overlay absolute fill" />
        </div>

        <div className="section-content relative">
          <div
            id="gap-1662174138"
            className="gap-element clearfix"
            style={{ display: 'block', height: 'auto', paddingTop: 50 }}
          />

          <div className="row align-center" id="row-1158304944">
            {/* Column 1: Company Info */}
            <div id="col-846792399" className="col col_left_center medium-4 small-12 large-4">
              <div className="col-inner text-left">
                <LogoLink
                  logoAsset={logoAsset}
                  wordmark={settings.wordmark}
                  homeHref={homeHref}
                  companyName={settings.companyName}
                  isFooter
                />

                <div
                  id="gap-401654536"
                  className="gap-element clearfix"
                  style={{ display: 'block', height: 'auto', paddingTop: 15 }}
                />

                <div id="text-2143498589" className="text">
                  <h3>{settings.companyName}</h3>
                </div>

                <div
                  id="gap-926295735"
                  className="gap-element clearfix show-for-small"
                  style={{ display: 'block', height: 'auto', paddingTop: 15 }}
                />

                {/* Address */}
                {settings.address && (
                  <div className="icon-box featured-box icon-center icon-box-left text-left">
                    <div className="icon-box-img" style={{ width: 25 }}>
                      <div className="icon">
                        <div className="icon-inner">
                          <i className="icon-map-pin-fill" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                    <div className="icon-box-text last-reset">
                      <div id="text-3629506328" className="text">
                        <p>{settings.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  id="gap-985536192"
                  className="gap-element clearfix"
                  style={{ display: 'block', height: 'auto', paddingTop: 10 }}
                />

                {/* Phone */}
                {settings.phones[0] && (
                  <a className="plain" href={settings.phones[0].href}>
                    <div className="icon-box featured-box icon-box-left text-left">
                      <div className="icon-box-img" style={{ width: 25 }}>
                        <div className="icon">
                          <div className="icon-inner">
                            <i className="icon-phone" aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                      <div className="icon-box-text last-reset">
                        <div className="text">
                          <p>{settings.phones[0].label}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                )}

                <div
                  className="gap-element clearfix"
                  style={{ display: 'block', height: 'auto', paddingTop: 10 }}
                />

                {/* Email */}
                {settings.email && (
                  <a className="plain" href={`mailto:${settings.email}`}>
                    <div className="icon-box featured-box icon-center icon-box-left text-left">
                      <div className="icon-box-img" style={{ width: 25 }}>
                        <div className="icon">
                          <div className="icon-inner">
                            <i className="icon-envelop" aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                      <div className="icon-box-text last-reset">
                        <div id="text-500523698" className="text">
                          <p style={{ marginTop: 3 }}>{settings.email}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Columns 2-4: Navigation Groups */}
            {navigation.footerGroups.map((group, groupIndex) => {
              const colClass =
                groupIndex === 2 ? 'col medium-2 small-12 large-2' : 'col medium-3 small-6 large-3';
              return (
                <div key={group.id} className={colClass}>
                  <div className="col-inner">
                    <div className="text">
                      <h4 style={{ marginBottom: 0 }}>{group.label}</h4>
                    </div>
                    <div
                      className="is-divider divider clearfix"
                      style={{
                        maxWidth: 133,
                        height: 2,
                        backgroundColor: 'rgb(0, 101, 223)',
                      }}
                    />
                    <div className="ux-menu stack stack-col justify-start">
                      {group.items.map((item) => {
                        const href = resolveDestination(item.destination, routes) ?? '#';

                        return (
                          <div key={item.id} className="ux-menu-link flex menu-item">
                            <Link className="ux-menu-link__link flex" href={href}>
                              <i
                                className="ux-menu-link__icon text-center icon-angle-right"
                                aria-hidden="true"
                              />
                              <span className="ux-menu-link__text">{item.label}</span>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="is-divider divider clearfix"
            style={{
              maxWidth: '100%',
              height: 1,
              backgroundColor: 'rgb(255, 255, 255)',
            }}
          />

          {/* Bottom Row: Copyright & Social Links */}
          <div className="row align-middle row_foot" id="row-1837441481">
            <div id="col-79686154" className="col medium-6 small-12 large-6">
              <div className="col-inner">
                <div id="text-1252042670" className="text">
                  {hasCompanyInCopyright ? (
                    <p>
                      {copyrightBefore}
                      <Link href={homeHref}>{settings.companyName}</Link>
                      {copyrightAfter}
                    </p>
                  ) : (
                    <p>{shellContent.copyright}</p>
                  )}
                </div>
              </div>
            </div>

            <div
              id="col-1807555465"
              className="col col_social medium-6 small-12 large-6 small-col-first"
            >
              <div className="col-inner text-right">
                {settings.socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    className="button white is-link lowercase"
                    rel="noopener"
                    style={{ padding: '0px 30px 0px 0px' }}
                  >
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Absolute Footer */}
      <div className="absolute-footer dark medium-text-center small-text-center">
        <div className="container clearfix">
          <div className="footer-primary pull-left">
            <div className="copyright-footer">{shellContent.themeCredit}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
