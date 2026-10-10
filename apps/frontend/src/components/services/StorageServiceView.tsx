import type { Locale, RouteEntry } from '@/types/content';
import type { ServiceAssets, ServicePage } from '@/lib/queries/services';
import { pathForRouteId } from '@/lib/routes';
import { PageHero } from '@/components/hero/PageHero';
import { SERVICE_HERO_IDS_STORAGE_EN, SERVICE_HERO_IDS_STORAGE_VI } from './serviceHeroIds';
import {
  StorageOfferings,
  STORAGE_OFFERINGS_IDS_EN,
  STORAGE_OFFERINGS_IDS_VI,
} from './StorageOfferings';
import {
  Testimonials,
  TESTIMONIALS_IDS_STORAGE_EN,
  TESTIMONIALS_IDS_STORAGE_VI,
  TESTIMONIALS_LABELS,
} from '@/components/testimonials/Testimonials';
import { ServiceFAQ } from './ServiceFAQ';
import { FeaturedProjects, type FeaturedProjectsIds } from '@/components/projects/FeaturedProjects';
import { SERVICE_CAROUSEL_LABELS } from './ServiceDetailCards';

const FEATURED_PROJECTS_IDS_STORAGE: FeaturedProjectsIds = {
  row: 'row-1255166091',
  col: 'col-802613459',
  eyebrow: 'text-1101289681',
  title: 'text-899631907',
};

export interface StorageServiceViewProps {
  page: ServicePage;
  assets: ServiceAssets;
  routes: RouteEntry[];
  locale: Locale;
}

const FAQ_IDS = {
  vi: {
    section: 'section_1489580969',
    headingRow: 'row-531581530',
    headingCol: 'col-775087341',
    eyebrowText: 'text-1409335333',
    titleText: 'text-1566883104',
    listRow: 'row-1664930865',
    listCol: 'col-909666048',
  },
  en: {
    section: 'section_1266521913',
    headingRow: 'row-1468263089',
    headingCol: 'col-1323386629',
    eyebrowText: 'text-4251296495',
    titleText: 'text-2244951475',
    listRow: 'row-1601635511',
    listCol: 'col-902951913',
  },
};

export function StorageServiceView({
  page,
  assets,
  routes,
  locale,
}: StorageServiceViewProps) {
  const isEn = locale === 'en';
  const { service, faqs, testimonials } = page;
  const copy = service.sectionCopy;
  const faqIds = FAQ_IDS[locale];

  // Resolve cta.routeId with pathForRouteId; throw on unknown id
  const resolvedHrefs: Record<string, string> = {};
  for (const offering of service.offerings) {
    if (offering.cta) {
      const resolved = pathForRouteId(routes, offering.cta.routeId);
      if (!resolved) {
        throw new Error(
          `StorageServiceView: unknown routeId '${offering.cta.routeId}' on offering '${offering.id}'`,
        );
      }
      resolvedHrefs[offering.cta.routeId] = resolved;
    }
  }

  const mediaMap = Object.fromEntries(assets.offeringMedia.map((m) => [m.id, m]));

  return (
    <main id="main">
      {/* 1. Service Hero */}
      <PageHero
        hero={service.hero}
        heroImage={assets.heroImage}
        bgImage={assets.heroBgImage}
        ids={isEn ? SERVICE_HERO_IDS_STORAGE_EN : SERVICE_HERO_IDS_STORAGE_VI}
      />

      {/* 2. Storage Offerings (Hub: desktop grid + mobile carousel) */}
      <StorageOfferings
        copy={copy.offerings}
        offerings={service.offerings}
        mediaMap={mediaMap}
        subtractIcon={assets.subtractIcon}
        decoIcon={assets.advantagesDeco}
        resolvedHrefs={resolvedHrefs}
        ids={isEn ? STORAGE_OFFERINGS_IDS_EN : STORAGE_OFFERINGS_IDS_VI}
        labels={SERVICE_CAROUSEL_LABELS[locale]}
      />

      {/* 3. Story 9: Featured projects */}
      <section className="section ss-decor" id={isEn ? 'section_674888486' : 'section_1086282974'}>
        <div className="section-bg fill" />
        <div className="section-content relative">
          {copy.projects && (
            <FeaturedProjects
              projects={page.projects}
              copy={copy.projects}
              assets={assets.projectAssets}
              categories={assets.projectCategories}
              ids={FEATURED_PROJECTS_IDS_STORAGE}
            />
          )}
        </div>
      </section>

      {/* 4. Testimonials */}
      {testimonials.length > 0 && copy.testimonials && (
        <Testimonials
          testimonials={testimonials}
          avatars={assets.testimonialAvatars}
          copy={copy.testimonials}
          art={assets.testimonialArt}
          ids={isEn ? TESTIMONIALS_IDS_STORAGE_EN : TESTIMONIALS_IDS_STORAGE_VI}
          labels={TESTIMONIALS_LABELS[locale]}
        />
      )}

      {/* 5. FAQ */}
      <ServiceFAQ faqs={faqs} copy={copy.faq} ids={faqIds} locale={locale} />
    </main>
  );
}
