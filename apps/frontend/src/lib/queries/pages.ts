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
  Locale,
  PaymentGuideContent,
  ServiceKey,
} from '@/types/content';
import { withSiteTokens } from './site';

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
 * The home page with its shared stats filled and tokens resolved; null when missing. Throws naming
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
  return withSiteTokens({ ...page, stats }, locale);
}

/** The about page with its shared stats filled and tokens resolved; throws on dangling ids. */
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
  return withSiteTokens({ ...page, stats }, locale);
}

export async function getContactPage(locale: Locale): Promise<ContactPageContent | null> {
  return withSiteTokens(await getRepository().getContactPage(locale), locale);
}

export async function getProfile(locale: Locale): Promise<CompanyProfileContent | null> {
  return withSiteTokens(await getRepository().getProfile(locale), locale);
}

export async function getLegalPage(path: string, locale: Locale): Promise<LegalPage | null> {
  return withSiteTokens(await getRepository().getLegalPage(path, locale), locale);
}

export async function getPaymentGuide(locale: Locale): Promise<PaymentGuideContent | null> {
  return withSiteTokens(await getRepository().getPaymentGuide(locale), locale);
}

/** Tokens resolve with the settings of the route's locale (VI when the route is unknown). */
export async function getListingSettings(routeId: EntityId): Promise<ListingSettings | null> {
  const repository = getRepository();
  const settings = await repository.getListingSettings(routeId);
  if (!JSON.stringify(settings).includes('{{site.')) return settings;
  const route = (await repository.listRoutes()).find((r) => r.id === routeId);
  return withSiteTokens(settings, route?.locale ?? 'vi');
}
