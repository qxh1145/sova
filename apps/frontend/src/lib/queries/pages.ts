import { getRepository } from '@/lib/repositories';
import type {
  AboutPageContent,
  CollectionPlacement,
  CompanyProfileContent,
  ContactPageContent,
  EntityId,
  HomePageContent,
  LegalPage,
  ListingSettings,
  ListingSnapshot,
  Locale,
  PaymentGuideContent,
  ServiceKey,
  UtilityContent,
} from '@/types/content';

const SERVICE_KEYS: ServiceKey[] = [
  'website',
  'mobile',
  'seo',
  'branding',
  'storage',
  'email',
  'hosting',
  'vps',
];
const ALL = { page: 1, pageSize: Number.MAX_SAFE_INTEGER };
const idsOf = (placements: CollectionPlacement[]) => placements.map((p) => p.entityId);
const missingIds = (wanted: EntityId[], found: { id: EntityId }[] = []) =>
  wanted.filter((id) => !found.some((f) => f.id === id));

function assertResolved(pageId: EntityId, missing: EntityId[]) {
  if (missing.length) throw new Error(`${pageId} references missing ids: ${missing.join(', ')}`);
}

/**
 * The home page with its shared stats filled; null when missing. Throws naming
 * the page and ids when a stat, service or placement does not resolve.
 */
export async function getHomePage(locale: Locale): Promise<HomePageContent | null> {
  const repository = getRepository();
  const record = await repository.getHomePage(locale);
  if (!record) return null;
  const { statIds, ...page } = record;
  // ponytail: no get-by-ids for projects/posts in the repository; one full page is fine for mock data.
  const [stats, testimonials, partners, projects, posts, services] = await Promise.all([
    repository.getStats(statIds),
    repository.getTestimonials(idsOf(record.testimonialPlacements), locale),
    repository.getPartners(idsOf(record.partnerPlacements)),
    record.projectPlacements.length ? repository.listProjects(ALL) : null,
    record.postPlacements.length ? repository.listPosts({ locale, ...ALL }) : null,
    // Matched by id over every key, so the check does not depend on the id format.
    Promise.all(SERVICE_KEYS.map((key) => repository.getService(key, locale))),
  ]);
  assertResolved(record.id, [
    ...missingIds(statIds, stats),
    ...missingIds(idsOf(record.projectPlacements), projects?.items),
    ...missingIds(idsOf(record.partnerPlacements), partners),
    ...missingIds(idsOf(record.testimonialPlacements), testimonials),
    ...missingIds(idsOf(record.postPlacements), posts?.items),
    ...missingIds(
      record.serviceIds,
      services.flatMap((service) => service ?? []),
    ),
  ]);
  return { ...page, stats };
}

/** The about page with its shared stats filled; throws on dangling ids. */
export async function getAboutPage(locale: Locale): Promise<AboutPageContent | null> {
  const repository = getRepository();
  const record = await repository.getAboutPage(locale);
  if (!record) return null;
  const { statIds, ...page } = record;
  const [stats, testimonials, partners] = await Promise.all([
    repository.getStats(statIds),
    repository.getTestimonials(record.testimonialIds, locale),
    repository.getPartners(record.partnerIds),
  ]);
  assertResolved(record.id, [
    ...missingIds(statIds, stats),
    ...missingIds(record.testimonialIds, testimonials),
    ...missingIds(record.partnerIds, partners),
  ]);
  return { ...page, stats };
}

export function getContactPage(locale: Locale): Promise<ContactPageContent | null> {
  return getRepository().getContactPage(locale);
}

export function getProfile(locale: Locale): Promise<CompanyProfileContent | null> {
  return getRepository().getProfile(locale);
}

export function getLegalPage(path: string, locale: Locale): Promise<LegalPage | null> {
  return getRepository().getLegalPage(path, locale);
}

export function getPaymentGuide(locale: Locale): Promise<PaymentGuideContent | null> {
  return getRepository().getPaymentGuide(locale);
}

export function getListingSettings(routeId: EntityId): Promise<ListingSettings | null> {
  return getRepository().getListingSettings(routeId);
}

/** One captured listing page (card order and pagination links); null when not captured. */
export function getListingSnapshot(
  routeId: EntityId,
  page: number,
): Promise<ListingSnapshot | null> {
  return getRepository().getListingSnapshot(routeId, page);
}

/** Utility copy or project delivery terms (Project.deliveryTermsId); null when missing. */
export function getUtilityContent(id: EntityId): Promise<UtilityContent | null> {
  return getRepository().getUtilityContent(id);
}
