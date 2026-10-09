import type { Locale } from '@/types/content';
import type { ServiceAssets, ServicePage } from '@/lib/queries/services';
import { PageHero } from '@/components/hero/PageHero';
import { SERVICE_HERO_IDS_EMAIL_EN, SERVICE_HERO_IDS_EMAIL_VI } from './serviceHeroIds';
import {
  ServiceIconCards,
  SERVICE_ICON_CARDS_IDS_EMAIL_EN,
  SERVICE_ICON_CARDS_IDS_EMAIL_VI,
} from './ServiceIconCards';
import {
  PricingTable,
  PRICING_TABLE_IDS_EMAIL_EN,
  PRICING_TABLE_IDS_EMAIL_VI,
} from '@/components/pricing/PricingTable';
import {
  Testimonials,
  TESTIMONIALS_IDS_EMAIL_EN,
  TESTIMONIALS_IDS_EMAIL_VI,
  TESTIMONIALS_LABELS,
} from '@/components/testimonials/Testimonials';
import { FAQList } from '@/components/faq/FAQList';

export interface EmailServiceViewProps {
  page: ServicePage;
  assets: ServiceAssets;
  locale: Locale;
}

const FAQ_IDS = {
  vi: {
    section: 'section_630184286',
    headingRow: 'row-662070522',
    headingCol: 'col-413626550',
    eyebrowText: 'text-3244751615',
    titleText: 'text-1595383971',
    listRow: 'row-1612220485',
    listCol: 'col-784443415',
  },
  en: {
    section: 'section_1417737979',
    headingRow: 'row-1660725797',
    headingCol: 'col-300903957',
    eyebrowText: 'text-502437735',
    titleText: 'text-2556838180',
    listRow: 'row-531019514',
    listCol: 'col-2083749905',
  },
};

export function EmailServiceView({ page, assets, locale }: EmailServiceViewProps) {
  const isEn = locale === 'en';
  const { service, faqs, testimonials, pricing } = page;
  const copy = service.sectionCopy;
  if (pricing?.kind !== 'table') throw new Error(`${service.id} needs table pricing`);
  const faqIds = FAQ_IDS[locale];

  return (
    <main id="main">
      {/* 1. Service Hero */}
      <PageHero
        hero={service.hero}
        heroImage={assets.heroImage}
        bgImage={assets.heroBgImage}
        ids={isEn ? SERVICE_HERO_IDS_EMAIL_EN : SERVICE_HERO_IDS_EMAIL_VI}
      />

      {/* 2. Pricing table */}
      <PricingTable
        pricing={pricing}
        copy={copy.pricing}
        ids={isEn ? PRICING_TABLE_IDS_EMAIL_EN : PRICING_TABLE_IDS_EMAIL_VI}
      />

      {/* 3. Icon cards */}
      <ServiceIconCards
        copy={copy.benefits}
        benefits={service.benefits}
        icons={assets.benefitIcons}
        bgImage={assets.benefitsBgImage}
        ids={isEn ? SERVICE_ICON_CARDS_IDS_EMAIL_EN : SERVICE_ICON_CARDS_IDS_EMAIL_VI}
      />

      {/* 4. Testimonials */}
      {testimonials.length > 0 && copy.testimonials && (
        <Testimonials
          testimonials={testimonials}
          avatars={assets.testimonialAvatars}
          copy={copy.testimonials}
          art={assets.testimonialArt}
          ids={isEn ? TESTIMONIALS_IDS_EMAIL_EN : TESTIMONIALS_IDS_EMAIL_VI}
          labels={TESTIMONIALS_LABELS[locale]}
        />
      )}

      {/* 5. FAQ */}
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
                    labels={{ toggle: isEn ? 'Toggle answer' : 'Mở rộng câu trả lời' }} // business-text-ok: accordion toggle label
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
