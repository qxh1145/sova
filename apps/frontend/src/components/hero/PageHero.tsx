import { Fragment } from 'react';
import Link from 'next/link';
import type { AssetRef, HeroContent } from '@/types/content';
import { RichText } from '@/components/ui/RichText';

export interface PageHeroIds {
  banner: string;
  textBox: string;
  /** Source text-box vertical position class at small widths; defaults to `y15`. */
  textBoxY?: string;
  /** Source text-box vertical position class at medium/large widths; defaults to `md-y50 lg-y50`. */
  textBoxMdLgY?: string;
  row: string;
  leftCol: string;
  /** Gap before the breadcrumb (hosting). */
  topGap?: string;
  /** Classes on topGap element; defaults to `gap-element clearfix`. */
  topGapClass?: string;
  breadcrumbText?: string;
  /** `show-for-small` gap after the breadcrumb (VPS). */
  breadcrumbGap?: string;
  headingText: string;
  /** Heading wrapper classes; defaults to `text kanit-font page_text_go`. */
  headingClass?: string;
  /** `show-for-small` gap after the heading text (featured archives). */
  headingGap?: string;
  gap1?: string;
  /** Second gap before the description (hosting). */
  gap1b?: string;
  /** Classes on gap1b element; defaults to `gap-element clearfix`. */
  gap1bClass?: string;
  descText?: string;
  gap2?: string;
  /** Classes on gap2 element; defaults to `gap-element clearfix`. */
  gap2Class?: string;
  /** Second, `hide-for-small` gap before the CTA (hosting). */
  gap2b?: string;
  ctaText?: string;
  rightCol: string;
  imageWrapper: string;
  bottomGap?: string;
  /** Classes on bottomGap element; defaults to `gap-element clearfix`. */
  bottomGapClass?: string;
}


export interface PageHeroProps {
  hero: HeroContent;
  heroImage?: AssetRef | null;
  bgImage?: AssetRef | null;
  ids: PageHeroIds;
  bannerClass?: string;
  /** Optional icon to render inside the CTA button (e.g. Vector-Stroke arrow). */
  ctaIcon?: AssetRef | null;
}

export function PageHero({
  hero,
  heroImage,
  bgImage,
  ids,
  bannerClass = 'banner-service',
  ctaIcon,
}: PageHeroProps) {
  const { breadcrumb } = hero;

  return (
    <>
      <div className={`banner has-hover ${bannerClass}`} id={ids.banner}>
        <div className="banner-inner fill">
          <div className="banner-bg fill">
            {bgImage && (
              <img
                decoding="async"
                width={bgImage.width ?? 2560}
                height={bgImage.height ?? 1394}
                src={bgImage.src}
                className="bg attachment-original size-original"
                alt={bgImage.alt ?? ''}
                loading="lazy"
              />
            )}
          </div>

          <div className="banner-layers container">
            <div className="fill banner-link" />
            <div
              id={ids.textBox}
              className={`text-box banner-layer x50 md-x50 lg-x50 ${ids.textBoxY ?? 'y15'} ${ids.textBoxMdLgY ?? 'md-y50 lg-y50'} res-text`}
            >
              <div className="text-box-content text dark">
                <div className="text-inner text-center">
                  <div className="row align-middle" id={ids.row}>
                    <div id={ids.leftCol} className="col medium-6 small-12 large-6">
                      <div className="col-inner">
                        {ids.topGap && (
                          <div
                            id={ids.topGap}
                            className={ids.topGapClass ?? 'gap-element clearfix'}
                            style={{ display: 'block', height: 'auto' }}
                          />
                        )}
                        {breadcrumb && ids.breadcrumbText && (
                          <div id={ids.breadcrumbText} className="text">
                            <p>
                              <span style={{ color: '#808080' }}>
                                {breadcrumb.slice(0, -1).map((crumb, idx) => (
                                  <Fragment key={idx}>
                                    {crumb.href ? (
                                      <Link href={crumb.href}>{crumb.label}</Link>
                                    ) : (
                                      crumb.label
                                    )}
                                    {' / '}
                                  </Fragment>
                                ))}
                              </span>
                              {breadcrumb.length > 0 &&
                                ` ${breadcrumb[breadcrumb.length - 1].label}`}
                              <br />
                            </p>
                          </div>
                        )}
                        {ids.breadcrumbGap && (
                          <div
                            id={ids.breadcrumbGap}
                            className="gap-element clearfix show-for-small"
                            style={{ display: 'block', height: 'auto' }}
                          />
                        )}
                        <div
                          id={ids.headingText}
                          className={ids.headingClass ?? 'text kanit-font page_text_go'}
                        >
                          <h1 className="service-hero-heading">
                            {hero.headingLines.map((line, idx) => (
                              <span key={idx} className="typewriter">
                                {line}
                              </span>
                            ))}
                          </h1>
                        </div>
                        {ids.headingGap && (
                          <div
                            id={ids.headingGap}
                            className="gap-element clearfix show-for-small"
                            style={{ display: 'block', height: 'auto' }}
                          />
                        )}
                        {ids.gap1 && (
                          <div
                            id={ids.gap1}
                            className="gap-element clearfix"
                            style={{ display: 'block', height: 'auto' }}
                          />
                        )}
                        {ids.gap1b && (
                          <div
                            id={ids.gap1b}
                            className={ids.gap1bClass ?? 'gap-element clearfix'}
                            style={{ display: 'block', height: 'auto' }}
                          />
                        )}
                        {hero.description && ids.descText && (
                          <div id={ids.descText} className="text">
                            <RichText content={hero.description} />
                          </div>
                        )}
                        {ids.gap2 && (
                          <div
                            id={ids.gap2}
                            className={ids.gap2Class ?? 'gap-element clearfix'}
                            style={{ display: 'block', height: 'auto' }}
                          />
                        )}
                        {ids.gap2b && (
                          <div
                            id={ids.gap2b}
                            className="gap-element clearfix hide-for-small"
                            style={{ display: 'block', height: 'auto' }}
                          />
                        )}
                        {hero.cta && ids.ctaText && (
                          <div id={ids.ctaText} className="text">
                            <p>
                              <Link className="but-lh" href={hero.cta.href}>
                                {hero.cta.label}
                                {ctaIcon && (
                                  <>
                                    {'\u00a0\u00a0'}
                                    <img
                                      decoding="async"
                                      className="alignnone wp-image-29 size-thumbnail"
                                      role="img"
                                      src={ctaIcon.src}
                                      alt={ctaIcon.alt ?? ''}
                                      width={ctaIcon.width ?? 15}
                                      height={ctaIcon.height ?? 15}
                                    />
                                  </>
                                )}
                              </Link>
                              <br />
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div id={ids.rightCol} className="col medium-6 small-12 large-6">
                      <div className="col-inner text-center">
                        {heroImage && (
                          <div
                            className="img has-hover x md-x lg-x y md-y lg-y"
                            id={ids.imageWrapper}
                          >
                            <div className="img-inner dark">
                              <img
                                decoding="async"
                                width={heroImage.width ?? 1482}
                                height={heroImage.height ?? 1233}
                                src={heroImage.src}
                                className="attachment-original size-original"
                                alt={heroImage.alt ?? ''}
                                loading="lazy"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {ids.bottomGap && (
        <div
          id={ids.bottomGap}
          className={ids.bottomGapClass ?? 'gap-element clearfix'}
          style={{ display: 'block', height: 'auto' }}
        />
      )}
    </>
  );
}
