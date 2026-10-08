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

/** Source: `featured_item/index.html` hero. */
export const PROJECT_HERO_IDS_FEATURED: ServiceHeroIds = {
  banner: 'banner-1513224978',
  textBox: 'text-box-933037456',
  textBoxY: 'y10',
  row: 'row-770104952',
  leftCol: 'col-1371196074',
  breadcrumbText: 'text-4132634771',
  headingText: 'text-1186201538',
  headingGap: 'gap-1700866820',
  gap1: 'gap-1510571818',
  descText: 'text-1287495552',
  gap2: 'gap-531889326',
  ctaText: 'text-942492924',
  rightCol: 'col-801607298',
  imageWrapper: 'image_1041525302',
};

/** Source: `featured_item_category/branding/index.html` hero. */
export const PROJECT_HERO_IDS_FEATURED_BRANDING: ServiceHeroIds = {
  banner: 'banner-1437243260',
  textBox: 'text-box-2054480237',
  textBoxY: 'y10',
  row: 'row-1965149933',
  leftCol: 'col-1858177944',
  breadcrumbText: 'text-1312901196',
  headingText: 'text-3643032278',
  headingGap: 'gap-163447323',
  gap1: 'gap-776102485',
  descText: 'text-3606226640',
  gap2: 'gap-379604357',
  ctaText: 'text-2918825896',
  rightCol: 'col-762608738',
  imageWrapper: 'image_537329827',
};

/** Source: `featured_item_category/mobile-app/index.html` hero. */
export const PROJECT_HERO_IDS_FEATURED_MOBILE_APP: ServiceHeroIds = {
  banner: 'banner-819223527',
  textBox: 'text-box-1797028337',
  textBoxY: 'y10',
  row: 'row-1716046406',
  leftCol: 'col-1040171774',
  breadcrumbText: 'text-802611617',
  headingText: 'text-4093867166',
  headingGap: 'gap-447887585',
  gap1: 'gap-147756381',
  descText: 'text-2172446531',
  gap2: 'gap-547783008',
  ctaText: 'text-4736212',
  rightCol: 'col-1536317594',
  imageWrapper: 'image_1564171001',
};

/** Source: `featured_item_category/website/index.html` hero. */
export const PROJECT_HERO_IDS_FEATURED_WEBSITE: ServiceHeroIds = {
  banner: 'banner-669224451',
  textBox: 'text-box-1637600246',
  textBoxY: 'y10',
  row: 'row-817686983',
  leftCol: 'col-1898983928',
  breadcrumbText: 'text-1129091476',
  headingText: 'text-1283775997',
  headingGap: 'gap-1582094197',
  gap1: 'gap-627171400',
  descText: 'text-3601946220',
  gap2: 'gap-1512249916',
  ctaText: 'text-3645802221',
  rightCol: 'col-1550218319',
  imageWrapper: 'image_1425400725',
};

export const SERVICE_HERO_IDS_EMAIL_VI: ServiceHeroIds = {
  banner: 'banner-880688064',
  textBox: 'text-box-597000131',
  textBoxY: 'y10',
  row: 'row-2053155899',
  leftCol: 'col-760506537',
  breadcrumbText: 'text-951094996',
  headingText: 'text-424266418',
  gap1: 'gap-2042908816',
  descText: 'text-498730765',
  gap2: 'gap-2007649633',
  gap2Class: 'gap-element clearfix show-for-small',
  gap2b: 'gap-335606629',
  ctaText: 'text-911677094',
  rightCol: 'col-180293630',
  imageWrapper: 'image_1552379478',
};

export const SERVICE_HERO_IDS_EMAIL_EN: ServiceHeroIds = {
  banner: 'banner-782456447',
  textBox: 'text-box-866894448',
  textBoxY: 'y10',
  row: 'row-568955501',
  leftCol: 'col-696292836',
  breadcrumbText: 'text-2322921990',
  headingText: 'text-3815375937',
  gap1: 'gap-1350754616',
  descText: 'text-2722962742',
  gap2: 'gap-1782042057',
  gap2Class: 'gap-element clearfix show-for-small',
  gap2b: 'gap-898855605',
  ctaText: 'text-2419020874',
  rightCol: 'col-1117205165',
  imageWrapper: 'image_1999389245',
};

export const SERVICE_HERO_IDS_STORAGE_VI: ServiceHeroIds = {
  banner: 'banner-1255492643',
  textBox: 'text-box-596276206',
  textBoxY: 'y10',
  row: 'row-371210678',
  leftCol: 'col-1574168941',
  topGap: 'gap-2067858221',
  breadcrumbText: 'text-445793396',
  headingText: 'text-4148275343',
  gap1: 'gap-987932550',
  gap1b: 'gap-1295344278',
  gap1bClass: 'gap-element clearfix show-for-small',
  descText: 'text-1453693104',
  gap2: 'gap-161076987',
  gap2Class: 'gap-element clearfix show-for-small',
  gap2b: 'gap-1107479796',
  ctaText: 'text-3990203095',
  rightCol: 'col-912227582',
  imageWrapper: 'image_1556659363',
};

export const SERVICE_HERO_IDS_STORAGE_EN: ServiceHeroIds = {
  banner: 'banner-964121618',
  textBox: 'text-box-193917254',
  textBoxY: 'y10',
  row: 'row-1304501646',
  leftCol: 'col-901932855',
  topGap: 'gap-1182039191',
  breadcrumbText: 'text-1244128777',
  headingText: 'text-700628076',
  gap1: 'gap-1604216309',
  gap1b: 'gap-474200673',
  gap1bClass: 'gap-element clearfix show-for-small',
  descText: 'text-1232967560',
  gap2: 'gap-2132235472',
  gap2Class: 'gap-element clearfix show-for-small',
  gap2b: 'gap-193824015',
  ctaText: 'text-315635000',
  rightCol: 'col-411984466',
  imageWrapper: 'image_1524550594',
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
