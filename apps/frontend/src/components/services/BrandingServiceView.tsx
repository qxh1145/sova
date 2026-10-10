import type { Locale } from '@/types/content';
import type { ServiceAssets, ServicePage } from '@/lib/queries/services';
import { PageHero } from '@/components/hero/PageHero';
import { SERVICE_HERO_IDS_BRANDING_EN, SERVICE_HERO_IDS_BRANDING_VI } from './serviceHeroIds';
import {
  ServiceAdvantages,
  SERVICE_ADVANTAGES_IDS_BRANDING_EN,
  SERVICE_ADVANTAGES_IDS_BRANDING_VI,
} from './ServiceAdvantages';
import {
  ServicePackageCards,
  SERVICE_PACKAGE_CARDS_IDS_BRANDING_EN,
  SERVICE_PACKAGE_CARDS_IDS_BRANDING_VI,
} from './ServicePackageCards';
import {
  Testimonials,
  TESTIMONIALS_IDS_BRANDING_EN,
  TESTIMONIALS_IDS_BRANDING_VI,
  TESTIMONIALS_LABELS,
} from '@/components/testimonials/Testimonials';
import { FAQList } from '@/components/faq/FAQList';
import { FeaturedProjects, type FeaturedProjectsIds } from '@/components/projects/FeaturedProjects';
import { SERVICE_CAROUSEL_LABELS } from './ServiceDetailCards';

export const FEATURED_PROJECTS_IDS_BRANDING_VI: FeaturedProjectsIds = {
  row: 'row-262932845',
  col: 'col-1523603196',
  eyebrow: 'text-1453977587',
  title: 'text-642705441',
};

export interface BrandingServiceViewProps {
  page: ServicePage;
  assets: ServiceAssets;
  locale: Locale;
}

const FAQ_IDS = {
  vi: {
    section: 'section_1909361623',
    headingRow: 'row-1768858090',
    headingCol: 'col-1538629144',
    eyebrowText: 'text-1109536633',
    titleText: 'text-3194378697',
    listRow: 'row-1797926951',
    listCol: 'col-1056462528',
  },
  en: {
    section: 'section_1106628234',
    headingRow: 'row-785299828',
    headingCol: 'col-1439878035',
    eyebrowText: 'text-3191336055',
    titleText: 'text-2255308031',
    listRow: 'row-2146759835',
    listCol: 'col-869887159',
  },
};

export function BrandingServiceView({ page, assets, locale }: BrandingServiceViewProps) {
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
        ids={isEn ? SERVICE_HERO_IDS_BRANDING_EN : SERVICE_HERO_IDS_BRANDING_VI}
      />

      {/* 2. Advantages / Benefits: heading + subtitle + deco + video banner + 4 icon cards */}
      {copy.benefits && (
        <ServiceAdvantages
          copy={copy.benefits}
          benefits={service.benefits}
          video={assets.benefitsVideo}
          deco={assets.advantagesDeco}
          icons={assets.benefitIcons}
          ids={isEn ? SERVICE_ADVANTAGES_IDS_BRANDING_EN : SERVICE_ADVANTAGES_IDS_BRANDING_VI}
          isEn={isEn}
        />
      )}

      {/* 3. Offerings / Packages: 4 package cards desktop grid + mobile slide_ui Carousel */}
      {copy.offerings && (
        <ServicePackageCards
          copy={copy.offerings}
          offerings={service.offerings}
          bgImage={assets.offeringsBgImage}
          subtractIcon={assets.subtractIcon}
          ids={isEn ? SERVICE_PACKAGE_CARDS_IDS_BRANDING_EN : SERVICE_PACKAGE_CARDS_IDS_BRANDING_VI}
          labels={SERVICE_CAROUSEL_LABELS[locale]}
          sliderClass="slide_ui"
        />
      )}

      {/* 4. Story 9: Featured projects */}
      <section className="section ss-decor" id={isEn ? 'section_1698149091' : 'section_2117777695'}>
        <div className="section-bg fill" />
        <div className="section-content relative">
          {copy.projects && (
            <FeaturedProjects
              projects={page.projects}
              copy={copy.projects}
              assets={assets.projectAssets}
              categories={assets.projectCategories}
              ids={FEATURED_PROJECTS_IDS_BRANDING_VI}
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
          ids={isEn ? TESTIMONIALS_IDS_BRANDING_EN : TESTIMONIALS_IDS_BRANDING_VI}
          labels={TESTIMONIALS_LABELS[locale]}
        />
      )}

      {/* 6. FAQ (10 items, first open) */}
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
