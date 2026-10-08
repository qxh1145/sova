import { Fragment } from 'react';
import Link from 'next/link';
import type { AssetRef, HeroContent } from '@/types/content';
import { RichText } from '@/components/ui/RichText';

export interface ServiceHeroIds {
  banner: string;
  textBox: string;
  /** Source text-box vertical position class at small widths; defaults to `y15`. */
  textBoxY?: string;
  row: string;
  leftCol: string;
  /** Gap before the breadcrumb (hosting). */
  topGap?: string;
  breadcrumbText?: string;
  /** `show-for-small` gap after the breadcrumb (VPS). */
  breadcrumbGap?: string;
  headingText: string;
  /** Heading wrapper classes; defaults to `text kanit-font page_text_go`. */
  headingClass?: string;
  gap1?: string;
  /** Second gap before the description (hosting). */
  gap1b?: string;
  descText?: string;
  gap2?: string;
  /** Second, `hide-for-small` gap before the CTA (hosting). */
  gap2b?: string;
  ctaText?: string;
  rightCol: string;
  imageWrapper: string;
  bottomGap?: string;
}

export const SERVICE_HERO_IDS_VI: ServiceHeroIds = {
  banner: 'banner-2067401347',
  textBox: 'text-box-1159832857',
  row: 'row-2031123420',
  leftCol: 'col-998490655',
  breadcrumbText: 'text-2027656733',
  headingText: 'text-1661975188',
  gap1: 'gap-1200155385',
  descText: 'text-2163208076',
  gap2: 'gap-642716842',
  ctaText: 'text-4179494573',
  rightCol: 'col-416542397',
  imageWrapper: 'image_984856161',
  bottomGap: 'gap-81419604',
};

export const SERVICE_HERO_IDS_EN: ServiceHeroIds = {
  banner: 'banner-476138808',
  textBox: 'text-box-219311901',
  row: 'row-230224213',
  leftCol: 'col-1260572007',
  breadcrumbText: 'text-1919501786',
  headingText: 'text-2553710355',
  gap1: 'gap-89401140',
  descText: 'text-2854962635',
  gap2: 'gap-1872842968',
  ctaText: 'text-2020970346',
  rightCol: 'col-657387381',
  imageWrapper: 'image_1568157091',
  bottomGap: 'gap-9335673',
};

export const SERVICE_HERO_IDS_HOSTING_VI: ServiceHeroIds = {
  banner: 'banner-998365047',
  textBox: 'text-box-406908183',
  textBoxY: 'y10',
  row: 'row-1141455233',
  leftCol: 'col-463553845',
  topGap: 'gap-115948399',
  breadcrumbText: 'text-2390842923',
  headingText: 'text-2679780824',
  gap1: 'gap-681504858',
  gap1b: 'gap-1592390700',
  descText: 'text-3385713525',
  gap2: 'gap-1203244851',
  gap2b: 'gap-651893395',
  ctaText: 'text-1535369985',
  rightCol: 'col-754232659',
  imageWrapper: 'image_825881471',
};

export const SERVICE_HERO_IDS_HOSTING_EN: ServiceHeroIds = {
  banner: 'banner-1497056567',
  textBox: 'text-box-121337497',
  textBoxY: 'y10',
  row: 'row-2100302859',
  leftCol: 'col-1032559139',
  topGap: 'gap-309151223',
  breadcrumbText: 'text-681251930',
  headingText: 'text-3165932974',
  gap1: 'gap-1279046662',
  gap1b: 'gap-996184528',
  descText: 'text-2306278201',
  gap2: 'gap-769956417',
  gap2b: 'gap-632061963',
  ctaText: 'text-2891119369',
  rightCol: 'col-554313480',
  imageWrapper: 'image_2033633435',
};

export const SERVICE_HERO_IDS_VPS_VI: ServiceHeroIds = {
  banner: 'banner-52976556',
  textBox: 'text-box-764297208',
  textBoxY: 'y10',
  row: 'row-92964933',
  leftCol: 'col-165991089',
  breadcrumbText: 'text-2194654704',
  breadcrumbGap: 'gap-1018876921',
  headingText: 'text-2250113707',
  headingClass: 'text kanit-font',
  gap1: 'gap-1825330902',
  descText: 'text-1964276835',
  gap2: 'gap-690956082',
  ctaText: 'text-1502442125',
  rightCol: 'col-1587479514',
  imageWrapper: 'image_544125054',
};

export const SERVICE_HERO_IDS_VPS_EN: ServiceHeroIds = {
  banner: 'banner-1956119831',
  textBox: 'text-box-1474432662',
  textBoxY: 'y10',
  row: 'row-203167289',
  leftCol: 'col-1386384679',
  breadcrumbText: 'text-1352218798',
  breadcrumbGap: 'gap-449049920',
  headingText: 'text-2003649022',
  headingClass: 'text kanit-font',
  gap1: 'gap-808773722',
  descText: 'text-3915632723',
  gap2: 'gap-763879778',
  ctaText: 'text-311032295',
  rightCol: 'col-2119694734',
  imageWrapper: 'image_1196805514',
};

export const PROJECT_HERO_IDS_VI: ServiceHeroIds = {
  banner: 'banner-2058171634',
  textBox: 'text-box-680836231',
  textBoxY: 'y10',
  row: 'row-393023394',
  leftCol: 'col-617069775',
  breadcrumbText: 'text-1849014574',
  headingText: 'text-754739457',
  gap1: 'gap-324345678',
  descText: 'text-4091887209',
  gap2: 'gap-1035621482',
  ctaText: 'text-4066416834',
  rightCol: 'col-1446619441',
  imageWrapper: 'image_2097301710',
};

export const PROJECT_HERO_IDS_EN: ServiceHeroIds = {
  banner: 'banner-2108105581',
  textBox: 'text-box-1406319782',
  textBoxY: 'y10',
  row: 'row-559783735',
  leftCol: 'col-1494034684',
  breadcrumbText: 'text-4030475959',
  headingText: 'text-1484206156',
  gap1: 'gap-672131643',
  descText: 'text-1289522904',
  gap2: 'gap-1610078730',
  ctaText: 'text-1022183224',
  rightCol: 'col-1322618720',
  imageWrapper: 'image_1934375415',
};

export interface ServiceHeroProps {
  hero: HeroContent;
  heroImage?: AssetRef | null;
  bgImage?: AssetRef | null;
  ids: ServiceHeroIds;
  bannerClass?: string;
}

export function ServiceHero({
  hero,
  heroImage,
  bgImage,
  ids,
  bannerClass = 'banner-service',
}: ServiceHeroProps) {
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
              className={`text-box banner-layer x50 md-x50 lg-x50 ${ids.textBoxY ?? 'y15'} md-y50 lg-y50 res-text`}
            >
              <div className="text-box-content text dark">
                <div className="text-inner text-center">
                  <div className="row align-middle" id={ids.row}>
                    <div id={ids.leftCol} className="col medium-6 small-12 large-6">
                      <div className="col-inner">
                        {ids.topGap && (
                          <div
                            id={ids.topGap}
                            className="gap-element clearfix"
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
                              {breadcrumb.length > 0 && ` ${breadcrumb[breadcrumb.length - 1].label}`}
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
                            className="gap-element clearfix"
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
                            className="gap-element clearfix"
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
          className="gap-element clearfix"
          style={{ display: 'block', height: 'auto' }}
        />
      )}
    </>
  );
}
