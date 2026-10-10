import type { Locale } from '@/types/content';
import type { ServiceAssets, ServicePage } from '@/lib/queries/services';
import { PageHero } from '@/components/hero/PageHero';
import { SERVICE_HERO_IDS_SEO_EN, SERVICE_HERO_IDS_SEO_VI } from './serviceHeroIds';
import {
  ServiceAdvantages,
  SERVICE_ADVANTAGES_IDS_SEO_EN,
  SERVICE_ADVANTAGES_IDS_SEO_VI,
} from './ServiceAdvantages';
import {
  ServicePackageCards,
  SERVICE_PACKAGE_CARDS_IDS_SEO_EN,
  SERVICE_PACKAGE_CARDS_IDS_SEO_VI,
} from './ServicePackageCards';
import {
  Testimonials,
  TESTIMONIALS_IDS_SEO_EN,
  TESTIMONIALS_IDS_SEO_VI,
  TESTIMONIALS_LABELS,
} from '@/components/testimonials/Testimonials';
import { ServiceFAQ } from './ServiceFAQ';
import { FeaturedProjects, type FeaturedProjectsIds } from '@/components/projects/FeaturedProjects';
import { SERVICE_CAROUSEL_LABELS } from './ServiceDetailCards';

const FEATURED_PROJECTS_IDS_SEO: FeaturedProjectsIds = {
  row: 'row-328500521',
  col: 'col-1824878441',
  eyebrow: 'text-3301960015',
  title: 'text-1254685663',
};

export interface SeoServiceViewProps {
  page: ServicePage;
  assets: ServiceAssets;
  locale: Locale;
}

const FAQ_IDS = {
  vi: {
    section: 'section_1595200881',
    headingRow: 'row-1544408960',
    headingCol: 'col-894897024',
    eyebrowText: 'text-1069659283',
    titleText: 'text-1350901943',
    listRow: 'row-1270056501',
    listCol: 'col-161830420',
  },
  en: {
    section: 'section_1520280801',
    headingRow: 'row-1373522505',
    headingCol: 'col-277509516',
    eyebrowText: 'text-712709189',
    titleText: 'text-2580021667',
    listRow: 'row-38008225',
    listCol: 'col-1084451967',
  },
};

export function SeoServiceView({ page, assets, locale }: SeoServiceViewProps) {
  const isEn = locale === 'en';
  const { service, faqs, testimonials } = page;
  const copy = service.sectionCopy;
  const faqIds = FAQ_IDS[locale];

  return (
    <main id="main">
      {/* 1. PageHero */}
      <PageHero
        hero={service.hero}
        heroImage={assets.heroImage}
        bgImage={assets.heroBgImage}
        ids={isEn ? SERVICE_HERO_IDS_SEO_EN : SERVICE_HERO_IDS_SEO_VI}
        ctaIcon={assets.ctaIcon}
      />

      {/* 2. Advantages: heading row + deco + photo + 4 icon cards */}
      {copy.benefits && (
        <ServiceAdvantages
          copy={copy.benefits}
          benefits={service.benefits}
          photo={assets.advantagesPhoto}
          deco={assets.advantagesDeco}
          icons={assets.benefitIcons}
          ids={isEn ? SERVICE_ADVANTAGES_IDS_SEO_EN : SERVICE_ADVANTAGES_IDS_SEO_VI}
        />
      )}

      {/* 3. Offerings / Packages: desktop grid + mobile slide_seo Carousel */}
      {copy.offerings && (
        <ServicePackageCards
          copy={copy.offerings}
          offerings={service.offerings}
          bgImage={assets.offeringsBgImage}
          subtractIcon={assets.subtractIcon}
          ids={isEn ? SERVICE_PACKAGE_CARDS_IDS_SEO_EN : SERVICE_PACKAGE_CARDS_IDS_SEO_VI}
          labels={SERVICE_CAROUSEL_LABELS[locale]}
        />
      )}

      {/* 4. Story 9: Featured projects */}
      <section className="section ss-decor" id={isEn ? 'section_1303915883' : 'section_1443166173'}>
        <div className="section-bg fill" />
        <div className="section-content relative">
          {copy.projects && (
            <FeaturedProjects
              projects={page.projects}
              copy={copy.projects}
              assets={assets.projectAssets}
              categories={assets.projectCategories}
              ids={FEATURED_PROJECTS_IDS_SEO}
            />
          )}
        </div>
      </section>

      {/* 5. Testimonials */}
      {testimonials.length > 0 && copy.testimonials && (
        <Testimonials
          testimonials={testimonials}
          avatars={assets.testimonialAvatars}
          copy={copy.testimonials}
          art={assets.testimonialArt}
          ids={isEn ? TESTIMONIALS_IDS_SEO_EN : TESTIMONIALS_IDS_SEO_VI}
          labels={TESTIMONIALS_LABELS[locale]}
        />
      )}

      {/* 6. FAQ (8 items, first open, item 7 on VI has literal </p) */}
      <ServiceFAQ faqs={faqs} copy={copy.faq} ids={faqIds} locale={locale} />
    </main>
  );
}
