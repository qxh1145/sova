import type { Locale } from '@/types/content';
import type { ServiceAssets, ServicePage } from '@/lib/queries/services';
import { PageHero } from '@/components/hero/PageHero';
import {
  SERVICE_HERO_IDS_MOBILE_EN,
  SERVICE_HERO_IDS_MOBILE_VI,
} from './serviceHeroIds';
import {
  ServiceBenefits,
  SERVICE_BENEFITS_IDS_MOBILE_EN,
  SERVICE_BENEFITS_IDS_MOBILE_VI,
} from './ServiceBenefits';
import {
  ServiceDetailCards,
  SERVICE_DETAIL_CARDS_IDS_MOBILE_EN,
  SERVICE_DETAIL_CARDS_IDS_MOBILE_VI,
  SERVICE_CAROUSEL_LABELS,
} from './ServiceDetailCards';
import {
  Testimonials,
  TESTIMONIALS_IDS_MOBILE_EN,
  TESTIMONIALS_IDS_MOBILE_VI,
  TESTIMONIALS_LABELS,
} from '@/components/testimonials/Testimonials';
import { FAQList } from '@/components/faq/FAQList';
import { FeaturedProjects, type FeaturedProjectsIds } from '@/components/projects/FeaturedProjects';

const FEATURED_PROJECTS_IDS_MOBILE: FeaturedProjectsIds = {
  row: 'row-26389138',
  col: 'col-1861618344',
  eyebrow: 'text-1571546421',
  title: 'text-84787226',
};

export interface MobileServiceViewProps {
  page: ServicePage;
  assets: ServiceAssets;
  locale: Locale;
}

export function MobileServiceView({ page, assets, locale }: MobileServiceViewProps) {
  const isEn = locale === 'en';
  const { service, faqs, testimonials } = page;
  const copy = service.sectionCopy;

  return (
    <main id="main">
      {/* 1. Service Hero */}
      <PageHero
        hero={service.hero}
        heroImage={assets.heroImage}
        bgImage={assets.heroBgImage}
        ids={isEn ? SERVICE_HERO_IDS_MOBILE_EN : SERVICE_HERO_IDS_MOBILE_VI}
      />

      {/* 2. Benefits */}
      <ServiceBenefits
        copy={copy.benefits}
        benefits={service.benefits}
        video={assets.benefitsVideo}
        icons={assets.benefitIcons}
        ids={isEn ? SERVICE_BENEFITS_IDS_MOBILE_EN : SERVICE_BENEFITS_IDS_MOBILE_VI}
      />

      {/* 3. Why Choose Us / ServiceDetailCards */}
      <ServiceDetailCards
        copy={copy.offerings}
        offerings={service.offerings}
        subtractIcon={assets.subtractIcon}
        ids={isEn ? SERVICE_DETAIL_CARDS_IDS_MOBILE_EN : SERVICE_DETAIL_CARDS_IDS_MOBILE_VI}
        labels={SERVICE_CAROUSEL_LABELS[locale]}
      />

      {/* 4. Story 9: Featured projects */}
      <section className="section ss-decor" id={isEn ? 'section_2081583834' : 'section_667104485'}>
        <div className="section-bg fill" />
        <div className="section-content relative">
          {copy.projects && (
            <FeaturedProjects
              projects={page.projects}
              copy={copy.projects}
              assets={assets.projectAssets}
              categories={assets.projectCategories}
              ids={FEATURED_PROJECTS_IDS_MOBILE}
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
          ids={isEn ? TESTIMONIALS_IDS_MOBILE_EN : TESTIMONIALS_IDS_MOBILE_VI}
          labels={TESTIMONIALS_LABELS[locale]}
        />
      )}

      {/* 6. FAQ */}
      {faqs.length > 0 && copy.faq && (
        <section className="section" id={isEn ? 'section_703582263' : 'section_2067065940'}>
          <div className="section-bg fill" />
          <div className="section-content relative">
            <div className="row" id={isEn ? 'row-1992151414' : 'row-674151979'}>
              <div
                id={isEn ? 'col-1713723863' : 'col-1325504169'}
                className="col small-12 large-12"
              >
                <div className="col-inner">
                  {copy.faq.eyebrow && (
                    <div id={isEn ? 'text-2121488980' : 'text-2374356157'} className="text">
                      <p>
                        <strong>
                          <span style={{ color: '#0065df' }}>{copy.faq.eyebrow}</span>
                        </strong>
                      </p>
                    </div>
                  )}
                  <div id={isEn ? 'text-4015396145' : 'text-1185368481'} className="text">
                    <h2>{copy.faq.title}</h2>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="row row-collapse align-middle"
              id={isEn ? 'row-706714345' : 'row-1772652157'}
            >
              <div
                id={isEn ? 'col-1281441634' : 'col-1339185125'}
                className="col medium-12 small-12 large-12"
              >
                <div className="col-inner">
                  {!isEn && (
                    <div
                      id="gap-1601755106"
                      className="gap-element clearfix"
                      style={{ display: 'block', height: 'auto' }}
                    />
                  )}
                  <FAQList
                    faqs={faqs}
                    type="single"
                    defaultOpen="first"
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
