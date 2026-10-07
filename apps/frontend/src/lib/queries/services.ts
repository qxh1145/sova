import { getRepository } from '@/lib/repositories';
import type {
  AssetRef,
  EntityId,
  FAQ,
  Locale,
  Pricing,
  Project,
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
  benefitsBgImage?: AssetRef | null;
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
}

export const TESTIMONIAL_ART_IDS = {
  photoId: 'asset-941f38ec1d',
  quoteIconId: 'asset-1d227d7c9b',
  lineId: 'asset-5763f42849',
};

export const SUBTRACT_ICON_ID = 'asset-d68ffd5723';

/**
 * Resolves all assets required for a service page in parallel (hero, benefits, offerings, testimonials).
 */
export async function getServiceAssets(
  page: ServicePage,
  repository = getRepository(),
): Promise<ServiceAssets> {
  const { service, testimonials } = page;
  const heroImageId = service.hero.imageId;
  const heroBgImageId = service.hero.bgImageId;
  const benefitsBgImageId = service.benefitsBgImageId;
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

  const [
    heroImages,
    heroBgImages,
    benefitsBgImages,
    videoAssets,
    benefitIcons,
    offeringMedia,
    subtractAssets,
    testimonialAvatars,
    artAssets,
  ] = await Promise.all([
    heroImageId ? repository.getAssets([heroImageId]) : Promise.resolve([]),
    heroBgImageId ? repository.getAssets([heroBgImageId]) : Promise.resolve([]),
    benefitsBgImageId ? repository.getAssets([benefitsBgImageId]) : Promise.resolve([]),
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
  ]);

  const photo = artAssets.find((a) => a.id === TESTIMONIAL_ART_IDS.photoId);
  const quoteIcon = artAssets.find((a) => a.id === TESTIMONIAL_ART_IDS.quoteIconId);
  const line = artAssets.find((a) => a.id === TESTIMONIAL_ART_IDS.lineId);
  if (!photo || !quoteIcon || !line) {
    throw new Error('Testimonial art assets missing from repository');
  }

  return {
    heroImage: heroImages[0] ?? null,
    heroBgImage: heroBgImages[0] ?? null,
    benefitsBgImage: benefitsBgImages[0] ?? null,
    benefitsVideo: videoAssets[0] ?? null,
    benefitIcons,
    offeringMedia,
    subtractIcon: subtractAssets[0] ?? null,
    testimonialAvatars,
    testimonialArt: { photo, quoteIcon, line },
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
