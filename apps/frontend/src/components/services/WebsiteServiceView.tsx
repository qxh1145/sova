import type { Locale } from '@/types/content';
import type { ServiceAssets, ServicePage } from '@/lib/queries/services';
import { PageHero } from '@/components/hero/PageHero';
import {
  SERVICE_HERO_IDS_WEBSITE_EN,
  SERVICE_HERO_IDS_WEBSITE_VI,
} from './serviceHeroIds';
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
import { FAQList } from '@/components/faq/FAQList';

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
          isEn={isEn}
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

      {/* 4. Story 8: Form placeholder */}

      {/* 5. Gap + Marquee */}
      <div
        id={isEn ? 'gap-319322898' : 'gap-1739551526'}
        className="gap-element clearfix"
        style={{ display: 'block', height: 'auto' }}
      />
      <Marquee items={MARQUEE_ITEMS} separator={assets.marqueeSeparator ?? undefined} />

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

      {/* 7. Story 9: FeaturedProjects empty placeholder */}
      <section
        className="section ss-decor"
        id={isEn ? 'section_1784272447' : 'section_1384595751'}
      >
        <div className="section-bg fill" />
        <div className="section-content relative">
          {/* Story 9: FeaturedProjects will be placed here */}
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
      {faqs.length > 0 && copy.faq && (
        <section className="section" id={faqIds.section}>
          <div className="section-bg fill" />
          <div className="section-content relative">
            <div className="row" id={faqIds.headingRow}>
              <div id={faqIds.headingCol} className="col small-12 large-12">
                <div className="col-inner">
                  {copy.faq.eyebrow && (
                    <div id={faqIds.eyebrowText} className="text">
                      <p>
                        <strong>
                          <span style={{ color: '#0065df' }}>{copy.faq.eyebrow}</span>
                        </strong>
                        <br />
                      </p>
                    </div>
                  )}
                  <div id={faqIds.titleText} className="text">
                    <h2>{copy.faq.title}</h2>
                  </div>
                  <div className="text-center">
                    <div
                      className="is-divider divider clearfix"
                      style={{ maxWidth: 133, height: 2, backgroundColor: 'rgb(0, 101, 223)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="row" id={faqIds.listRow}>
              <div id={faqIds.listCol} className="col small-12 large-12">
                <div className="col-inner">
                  <FAQList
                    faqs={faqs}
                    type="single"
                    defaultOpen="first"
                    className="ac-luutru"
                    labels={{ toggle: isEn ? 'Toggle answer' : 'Mở rộng câu trả lời' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
