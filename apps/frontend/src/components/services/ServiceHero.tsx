import { Fragment } from 'react';
import Link from 'next/link';
import type { AssetRef, HeroContent } from '@/types/content';
import { RichText } from '@/components/ui/RichText';

export interface ServiceHeroIds {
  banner: string;
  textBox: string;
  row: string;
  leftCol: string;
  breadcrumbText?: string;
  headingText: string;
  gap1?: string;
  descText?: string;
  gap2?: string;
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

export interface ServiceHeroProps {
  hero: HeroContent;
  heroImage?: AssetRef | null;
  bgImage?: AssetRef | null;
  ids: ServiceHeroIds;
}

export function ServiceHero({
  hero,
  heroImage,
  bgImage,
  ids,
}: ServiceHeroProps) {
  const { breadcrumb } = hero;

  return (
    <>
      <div className="banner has-hover banner-service" id={ids.banner}>
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
              className="text-box banner-layer x50 md-x50 lg-x50 y15 md-y50 lg-y50 res-text"
            >
              <div className="text-box-content text dark">
                <div className="text-inner text-center">
                  <div className="row align-middle" id={ids.row}>
                    <div id={ids.leftCol} className="col medium-6 small-12 large-6">
                      <div className="col-inner">
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
                        <div id={ids.headingText} className="text kanit-font page_text_go">
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
