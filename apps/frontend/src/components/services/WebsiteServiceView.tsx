import type { Locale } from '@/types/content';
import type { ServiceAssets, ServicePage } from '@/lib/queries/services';
import { PageHero } from '@/components/hero/PageHero';
import { SERVICE_HERO_IDS_WEBSITE_EN, SERVICE_HERO_IDS_WEBSITE_VI } from './serviceHeroIds';
import {
  ServiceAdvantages,
  SERVICE_ADVANTAGES_IDS_WEBSITE_EN,
  SERVICE_ADVANTAGES_IDS_WEBSITE_VI,
} from './ServiceAdvantages';
import {
  PricingCards,
  PRICING_CARDS_IDS_EN,
  PRICING_CARDS_IDS_VI,
} from '@/components/pricing/PricingCards';
import { Marquee } from '@/components/motion/Marquee';
import {
  ServiceDetailCards,
  SERVICE_DETAIL_CARDS_IDS_WEBSITE_EN,
  SERVICE_DETAIL_CARDS_IDS_WEBSITE_VI,
  SERVICE_CAROUSEL_LABELS,
} from './ServiceDetailCards';
import {
  Testimonials,
  TESTIMONIALS_IDS_WEBSITE_EN,
  TESTIMONIALS_IDS_WEBSITE_VI,
  TESTIMONIALS_LABELS,
} from '@/components/testimonials/Testimonials';
import { ServiceFAQ } from './ServiceFAQ';
import { WebsiteContactForm } from '@/components/forms/WebsiteContactForm';
import { FeaturedProjects, type FeaturedProjectsIds } from '@/components/projects/FeaturedProjects';
import { PromoVoucherSvg } from './PromoVoucherSvg';

const FEATURED_PROJECTS_IDS_WEBSITE: FeaturedProjectsIds = {
  row: 'row-134970593',
  col: 'col-1655533775',
  eyebrow: 'text-2072217073',
  title: 'text-166351269',
};

export interface WebsiteServiceViewProps {
  page: ServicePage;
  assets: ServiceAssets;
  locale: Locale;
}

const FAQ_IDS = {
  vi: {
    section: 'section_852011045',
    headingRow: 'row-1231413496',
    headingCol: 'col-318070344',
    eyebrowText: 'text-3805434072',
    titleText: 'text-3542666168',
    listRow: 'row-1349731106',
    listCol: 'col-1827141012',
  },
  en: {
    section: 'section_581402483',
    headingRow: 'row-1065835700',
    headingCol: 'col-448047236',
    eyebrowText: 'text-4278243320',
    titleText: 'text-390827659',
    listRow: 'row-1250870871',
    listCol: 'col-1070447204',
  },
};

const MARQUEE_ITEMS = ['Development', 'UI/UX', 'Sova', 'Branding', 'Writer', 'Mobile'];

export function WebsiteServiceView({ page, assets, locale }: WebsiteServiceViewProps) {
  const isEn = locale === 'en';
  const { service, faqs, testimonials, pricing } = page;
  const copy = service.sectionCopy;
  const faqIds = FAQ_IDS[locale];

  if (!pricing || pricing.kind !== 'cards') {
    throw new Error(`${service.id} requires cards pricing`);
  }

  return (
    <main id="main">
      {/* 1. PageHero */}
      <PageHero
        hero={service.hero}
        heroImage={assets.heroImage}
        bgImage={assets.heroBgImage}
        bannerClass="banner_tke banner-service"
        ids={isEn ? SERVICE_HERO_IDS_WEBSITE_EN : SERVICE_HERO_IDS_WEBSITE_VI}
      />

      {/* 2. Advantages / Benefits: video + 4 cards */}
      {copy.benefits && (
        <ServiceAdvantages
          copy={copy.benefits}
          benefits={service.benefits}
          video={assets.benefitsVideo}
          deco={assets.advantagesDeco}
          icons={assets.benefitIcons}
          ids={isEn ? SERVICE_ADVANTAGES_IDS_WEBSITE_EN : SERVICE_ADVANTAGES_IDS_WEBSITE_VI}
        />
      )}

      {/* Closing gap after advantages */}
      <div
        id={isEn ? 'gap-480676504' : 'gap-1036610523'}
        className="gap-element clearfix hide-for-small"
        style={{ display: 'block', height: 'auto' }}
      />

      {/* 3. PricingCards: desktop grid + mobile slider */}
      <PricingCards
        copy={copy.pricing}
        plans={pricing.plans}
        features={pricing.features}
        planIcons={assets.planIcons}
        subtractIcon={assets.subtractIcon}
        ids={isEn ? PRICING_CARDS_IDS_EN : PRICING_CARDS_IDS_VI}
        labels={SERVICE_CAROUSEL_LABELS[locale]}
      />

      {/* 4. Story 8: Form banner */}
      <div
        id={isEn ? 'gap-182187035' : 'gap-433110396'}
        className="gap-element clearfix"
        style={{ display: 'block', height: 'auto' }}
      />
      <div className="row align-center" id={isEn ? 'row-1228554800' : 'row-1168101482'}>
        <div id={isEn ? 'col-365058390' : 'col-627496437'} className="col small-12 large-12">
          <div className="col-inner">
            <div
              className="banner has-hover form-lienhe"
              id={isEn ? 'banner-1313966365' : 'banner-1813159824'}
            >
              <div className="banner-inner fill">
                <div className="banner-bg fill">
                  <picture>
                    <source
                      media="(max-width: 549px)"
                      srcSet={
                        isEn
                          ? '/wp-content/uploads/2025/04/anh-nen-doc-111-450x800.webp'
                          : '/wp-content/uploads/2025/04/anh-nen-doc-111.webp'
                      }
                    />
                    <img
                      decoding="async"
                      width={1920}
                      height={1080}
                      src="/wp-content/uploads/2025/04/anh-nen-new-111.webp"
                      className="bg attachment-original size-original"
                      alt=""
                      loading="lazy"
                    />
                  </picture>
                  <div
                    className="is-border"
                    style={{
                      borderColor: 'rgb(36, 34, 62)',
                      borderRadius: 35,
                      borderWidth: '1px 1px 1px 1px',
                    }}
                  />
                </div>

                <div className="banner-layers container">
                  <div className="fill banner-link" />
                  <div
                    id={isEn ? 'text-box-2108502950' : 'text-box-461418576'}
                    className="text-box banner-layer x0 md-x0 lg-x0 y50 md-y50 lg-y50 res-text"
                  >
                    <div className="text-box-content text">
                      <div className="text-inner text-center">
                        <div id={isEn ? 'text-2024580667' : 'text-3680779718'} className="text">
                          <h2 style={{ marginBottom: 30, fontSize: 43, lineHeight: '55px' }}>
                            {copy.contact?.titleLines
                              ? copy.contact.titleLines.map((line, idx) => (
                                  <span key={idx}>
                                    {line}
                                    {idx < (copy.contact?.titleLines?.length ?? 0) - 1 && <br />}
                                  </span>
                                ))
                              : copy.contact?.title}
                          </h2>
                          <h2 style={{ fontSize: 43, lineHeight: '55px' }}>
                            {copy.contact?.descriptionLines
                              ? copy.contact.descriptionLines.map((line, idx) => (
                                  <span key={idx}>
                                    {line}
                                    {idx < (copy.contact?.descriptionLines?.length ?? 0) - 1 && (
                                      <br />
                                    )}
                                  </span>
                                ))
                              : copy.contact?.description}
                          </h2>
                        </div>
                        {service.contactForm?.hotlineHref && (
                          <a
                            href={service.contactForm.hotlineHref}
                            className="button white is-shade"
                            style={{ borderRadius: 8 }}
                          >
                            <i className="icon-phone" aria-hidden="true" />{' '}
                            <span>{service.contactForm.hotlineLabel}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isEn && (
                    <div
                      id="text-box-324172340"
                      className="text-box banner-layer x95 md-x95 lg-x95 y5 md-y5 lg-y5 res-text"
                    >
                      <div className="text-box-content text">
                        <div className="text-inner text-left">
                          <div className="row row_gg" id="row-251327634">
                            <div id="col-490235233" className="col small-12 large-12">
                              <div className="col-inner">
                                <div className="icon-box featured-box icon-box-left text-left">
                                  <div className="icon-box-img" style={{ width: 41 }}>
                                    <div className="icon">
                                      <div className="icon-inner">
                                        <PromoVoucherSvg />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="icon-box-text last-reset">
                                    <div id="text-188971599" className="text">
                                      <h3>{copy.contact?.eyebrow}</h3>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    id={isEn ? 'text-box-1136070934' : 'text-box-1917404396'}
                    className={`text-box banner-layer ${isEn ? 'form_tke' : 'form_tke form_bage'} x95 md-x95 lg-x95 ${isEn ? 'y50 md-y50 lg-y50' : 'y95 md-y95 lg-y95'} res-text`}
                  >
                    <div className="text-box-content text box-shadow-3">
                      <div className="text-inner text-left">
                        {service.contactForm && (
                          <WebsiteContactForm labels={service.contactForm} locale={locale} />
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

      {/* 5. Gap + Marquee */}
      <div
        id={isEn ? 'gap-319322898' : 'gap-1739551526'}
        className="gap-element clearfix"
        style={{ display: 'block', height: 'auto' }}
      />
      <Marquee items={MARQUEE_ITEMS} separator={assets.marqueeSeparator} />

      {/* 6. Why choose us: 3 columns desktop + mobile slide_tsao slider */}
      {copy.offerings && (
        <ServiceDetailCards
          copy={copy.offerings}
          offerings={service.offerings}
          subtractIcon={assets.subtractIcon}
          ids={isEn ? SERVICE_DETAIL_CARDS_IDS_WEBSITE_EN : SERVICE_DETAIL_CARDS_IDS_WEBSITE_VI}
          labels={SERVICE_CAROUSEL_LABELS[locale]}
          sliderClass="slide_tsao"
          dots
        />
      )}

      {/* 7. Story 9: Featured projects */}
      <section className="section ss-decor" id={isEn ? 'section_1784272447' : 'section_1384595751'}>
        <div className="section-bg fill" />
        <div className="section-content relative">
          {copy.projects && (
            <FeaturedProjects
              projects={page.projects}
              copy={copy.projects}
              assets={assets.projectAssets}
              categories={assets.projectCategories}
              ids={FEATURED_PROJECTS_IDS_WEBSITE}
            />
          )}
        </div>
      </section>

      {/* 8. Testimonials */}
      {testimonials.length > 0 && copy.testimonials && (
        <Testimonials
          testimonials={testimonials}
          avatars={assets.testimonialAvatars}
          copy={copy.testimonials}
          art={assets.testimonialArt}
          ids={isEn ? TESTIMONIALS_IDS_WEBSITE_EN : TESTIMONIALS_IDS_WEBSITE_VI}
          labels={TESTIMONIALS_LABELS[locale]}
        />
      )}

      {/* 9. FAQ (8 items, first open) */}
      <ServiceFAQ faqs={faqs} copy={copy.faq} ids={faqIds} locale={locale} />
    </main>
  );
}
