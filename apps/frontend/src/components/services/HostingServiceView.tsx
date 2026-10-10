import type { Locale } from '@/types/content';
import type { ServiceAssets, ServicePage } from '@/lib/queries/services';
import { PageHero } from '@/components/hero/PageHero';
import {
  SERVICE_HERO_IDS_HOSTING_EN,
  SERVICE_HERO_IDS_HOSTING_VI,
} from './serviceHeroIds';
import {
  ServiceIconCards,
  SERVICE_ICON_CARDS_IDS_HOSTING_EN,
  SERVICE_ICON_CARDS_IDS_HOSTING_VI,
} from './ServiceIconCards';
import {
  PricingTable,
  PRICING_TABLE_IDS_HOSTING_EN,
  PRICING_TABLE_IDS_HOSTING_VI,
} from '@/components/pricing/PricingTable';
import {
  Testimonials,
  TESTIMONIALS_IDS_HOSTING_EN,
  TESTIMONIALS_IDS_HOSTING_VI,
  TESTIMONIALS_LABELS,
} from '@/components/testimonials/Testimonials';
import { ServiceFAQ } from './ServiceFAQ';

export interface HostingServiceViewProps {
  page: ServicePage;
  assets: ServiceAssets;
  locale: Locale;
}

const FAQ_IDS = {
  vi: {
    section: 'section_2047789767',
    gap: 'gap-399125839',
    headingRow: 'row-1496380064',
    headingCol: 'col-560811812',
    eyebrowText: 'text-87617278',
    titleText: 'text-3050024897',
    listRow: 'row-1103055292',
    listCol: 'col-542749163',
  },
  en: {
    section: 'section_748910381',
    gap: 'gap-396152361',
    headingRow: 'row-1154772209',
    headingCol: 'col-122080347',
    eyebrowText: 'text-1760912956',
    titleText: 'text-2022736985',
    listRow: 'row-741854558',
    listCol: 'col-1307255176',
  },
};

export function HostingServiceView({ page, assets, locale }: HostingServiceViewProps) {
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
        ids={isEn ? SERVICE_HERO_IDS_HOSTING_EN : SERVICE_HERO_IDS_HOSTING_VI}
      />

      {/* 2. Pricing table */}
      <PricingTable
        pricing={pricing}
        copy={copy.pricing}
        ids={isEn ? PRICING_TABLE_IDS_HOSTING_EN : PRICING_TABLE_IDS_HOSTING_VI}
      />

      {/* 3. Icon cards */}
      <ServiceIconCards
        copy={copy.benefits}
        benefits={service.benefits}
        icons={assets.benefitIcons}
        bgImage={assets.benefitsBgImage}
        ids={isEn ? SERVICE_ICON_CARDS_IDS_HOSTING_EN : SERVICE_ICON_CARDS_IDS_HOSTING_VI}
      />

      {/* 4. Testimonials */}
      {testimonials.length > 0 && copy.testimonials && (
        <Testimonials
          testimonials={testimonials}
          avatars={assets.testimonialAvatars}
          copy={copy.testimonials}
          art={assets.testimonialArt}
          ids={isEn ? TESTIMONIALS_IDS_HOSTING_EN : TESTIMONIALS_IDS_HOSTING_VI}
          labels={TESTIMONIALS_LABELS[locale]}
        />
      )}

      {/* 5. FAQ */}
      <ServiceFAQ faqs={faqs} copy={copy.faq} ids={faqIds} locale={locale} />
    </main>
  );
}
