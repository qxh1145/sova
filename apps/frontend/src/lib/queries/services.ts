import { getRepository } from '@/lib/repositories';
import type {
  AssetRef,
  EntityId,
  FAQ,
  Locale,
  Pricing,
  Project,
  ProjectCategory,
  Service,
  ServiceKey,
  Testimonial,
} from '@/types/content';
import { applyFAQPlacements, getFAQs } from './faq';

export function getService(key: ServiceKey, locale: Locale): Promise<Service | null> {
  return getRepository().getService(key, locale);
}

export function getPricing(id: EntityId, locale: Locale): Promise<Pricing | null> {
  return getRepository().getPricing(id, locale);
}

export interface ServicePage {
  service: Service;
  /** In placement order; a placement's source revision replaces the canonical answer. */
  faqs: FAQ[];
  testimonials: Testimonial[];
  projects: Project[];
  pricing: Pricing | null;
}

export interface ServiceAssets {
  heroImage: AssetRef | null;
  heroBgImage: AssetRef | null;
  /** Hosting/VPS icon-card section background (`service.benefitsBgImageId`). */
  benefitsBgImage: AssetRef | null;
  /** SEO advantages photo (`service.advantagesPhotoId`). */
  advantagesPhoto: AssetRef | null;
  /** SEO advantages decorative graphic (`service.advantagesDecoId`). */
  advantagesDeco: AssetRef | null;
  /** SEO offerings section background (`service.offeringsBgImageId`). */
  offeringsBgImage: AssetRef | null;
  /** CTA icon (e.g. Vector-Stroke arrow). */
  ctaIcon: AssetRef | null;
  benefitsVideo: AssetRef | null;
  benefitIcons: AssetRef[];
  offeringMedia: AssetRef[];
  subtractIcon: AssetRef | null;
  testimonialAvatars: AssetRef[];
  testimonialArt: {
    photo: AssetRef;
    quoteIcon: AssetRef;
    line: AssetRef;
  };
  planIcons: AssetRef[];
  marqueeSeparator: AssetRef | null;
  projectAssets: AssetRef[];
  projectCategories: ProjectCategory[];
}

export const SUBTRACT_ICON_ID = 'asset-d68ffd5723';

const TESTIMONIAL_ART_IDS = {
  photoId: 'asset-941f38ec1d',
  quoteIconId: 'asset-1d227d7c9b',
  lineId: 'asset-5763f42849',
};

export function resolveTestimonialArt(
  assets: AssetRef[],
  ids: { photoId: EntityId; quoteIconId: EntityId; lineId: EntityId } = TESTIMONIAL_ART_IDS,
) {
  const photo = assets.find((a) => a.id === ids.photoId);
  const quoteIcon = assets.find((a) => a.id === ids.quoteIconId);
  const line = assets.find((a) => a.id === ids.lineId);
  if (!photo || !quoteIcon || !line) {
    throw new Error('Testimonial art assets missing from repository');
  }
  return { photo, quoteIcon, line };
}

/**
 * Resolves all assets required for a service page in parallel (hero, benefits, offerings, testimonials, featured projects).
 */
export async function getServiceAssets(
  page: ServicePage,
  repository = getRepository(),
): Promise<ServiceAssets> {
  const { service, testimonials, projects } = page;
  const heroImageId = service.hero.imageId;
  const heroBgImageId = service.hero.bgImageId;
  const heroCtaIconId = service.hero.ctaIconId;
  const benefitsBgImageId = service.benefitsBgImageId;
  const advantagesPhotoId = service.advantagesPhotoId;
  const advantagesDecoId = service.advantagesDecoId;
  const offeringsBgImageId = service.offeringsBgImageId;
  const videoId = service.hero.videoId;
  const benefitIconIds = service.benefits
    .map((b) => b.iconId)
    .filter((id): id is string => Boolean(id));
  const offeringMediaIds = service.offerings
    .map((o) => o.mediaId)
    .filter((id): id is string => Boolean(id));
  const avatarIds = testimonials
    .map((t) => t.avatarId)
    .filter((id): id is string => Boolean(id));

  const projectAssetIds = projects
    .map((p) => p.galleryIds[0])
    .filter((id): id is string => Boolean(id));

  const [
    heroImages,
    heroBgImages,
    benefitsBgImages,
    advantagesPhotos,
    advantagesDecos,
    offeringsBgImages,
    ctaIcons,
    videoAssets,
    benefitIcons,
    offeringMedia,
    subtractAssets,
    testimonialAvatars,
    artAssets,
    extraAssets,
    projectAssets,
    projectCategories,
  ] = await Promise.all([
    heroImageId ? repository.getAssets([heroImageId]) : Promise.resolve([]),
    heroBgImageId ? repository.getAssets([heroBgImageId]) : Promise.resolve([]),
    benefitsBgImageId ? repository.getAssets([benefitsBgImageId]) : Promise.resolve([]),
    advantagesPhotoId ? repository.getAssets([advantagesPhotoId]) : Promise.resolve([]),
    advantagesDecoId ? repository.getAssets([advantagesDecoId]) : Promise.resolve([]),
    offeringsBgImageId ? repository.getAssets([offeringsBgImageId]) : Promise.resolve([]),
    heroCtaIconId ? repository.getAssets([heroCtaIconId]) : Promise.resolve([]),
    videoId ? repository.getAssets([videoId]) : Promise.resolve([]),
    benefitIconIds.length ? repository.getAssets(benefitIconIds) : Promise.resolve([]),
    offeringMediaIds.length ? repository.getAssets(offeringMediaIds) : Promise.resolve([]),
    repository.getAssets([SUBTRACT_ICON_ID]),
    avatarIds.length ? repository.getAssets(avatarIds) : Promise.resolve([]),
    repository.getAssets([
      TESTIMONIAL_ART_IDS.photoId,
      TESTIMONIAL_ART_IDS.quoteIconId,
      TESTIMONIAL_ART_IDS.lineId,
    ]),
    service.key === 'website'
      ? repository.getAssets([
          'asset-017f167e30',
          'asset-0284853c00',
          'asset-4314679580',
          'asset-400b882328',
        ])
      : Promise.resolve([]),
    projectAssetIds.length ? repository.getAssets(projectAssetIds) : Promise.resolve([]),
    projects.length ? repository.getProjectCategories() : Promise.resolve([]),
  ]);

  const testimonialArt = resolveTestimonialArt(artAssets);

  const websiteAssets = service.key === 'website' ? extraAssets : [];
  const planIcons = websiteAssets.filter((a) => a.id !== 'asset-400b882328');
  const marqueeSeparator = websiteAssets.find((a) => a.id === 'asset-400b882328') ?? null;

  return {
    heroImage: heroImages[0] ?? null,
    heroBgImage: heroBgImages[0] ?? null,
    benefitsBgImage: benefitsBgImages[0] ?? null,
    advantagesPhoto: advantagesPhotos[0] ?? null,
    advantagesDeco: advantagesDecos[0] ?? null,
    offeringsBgImage: offeringsBgImages[0] ?? null,
    ctaIcon: ctaIcons[0] ?? null,
    benefitsVideo: videoAssets[0] ?? null,
    benefitIcons,
    offeringMedia,
    subtractIcon: subtractAssets[0] ?? null,
    testimonialAvatars,
    testimonialArt,
    planIcons,
    marqueeSeparator,
    projectAssets,
    projectCategories,
  };
}

/**
 * A service joined to its FAQs, testimonials, featured projects and pricing; null when the service is
 * missing. Throws naming the service and ids when a referenced record does not resolve.
 */
export async function getServicePage(key: ServiceKey, locale: Locale): Promise<ServicePage | null> {
  const repository = getRepository();
  const service = await repository.getService(key, locale);
  if (!service) return null;
  const placements = [...service.faqs].sort((a, b) => a.order - b.order);
  const [faqs, testimonials, allProjects, pricing] = await Promise.all([
    getFAQs(
      placements.map((p) => p.faqId),
      locale,
    ),
    repository.getTestimonials(service.testimonialIds, locale),
    // ponytail: no getProjects(ids) in the repository yet; one full page is fine for 62 mock projects.
    service.featuredProjectIds.length
      ? repository.listProjects({ page: 1, pageSize: Number.MAX_SAFE_INTEGER })
      : null,
    service.pricingId ? repository.getPricing(service.pricingId, locale) : null,
  ]);
  const projects = service.featuredProjectIds.flatMap(
    (id) => allProjects?.items.find((p) => p.id === id) ?? [],
  );
  const missing = [
    ...placements.map((p) => p.faqId).filter((id) => !faqs.some((f) => f.id === id)),
    ...service.testimonialIds.filter((id) => !testimonials.some((t) => t.id === id)),
    ...service.featuredProjectIds.filter((id) => !projects.some((p) => p.id === id)),
    ...(service.pricingId && !pricing ? [service.pricingId] : []),
  ];
  if (missing.length)
    throw new Error(`${service.id} references missing ids: ${missing.join(', ')}`);
  return {
    service,
    faqs: applyFAQPlacements(faqs, placements),
    testimonials,
    projects,
    pricing,
  };
}
