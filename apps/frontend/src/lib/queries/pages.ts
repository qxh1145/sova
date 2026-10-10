import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import type {
  AboutPageContent,
  AssetRef,
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
  ProjectCategory,
  Service,
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
 * The home page with its shared stats and entities resolved; null when missing. Throws
 * naming the page and ids when a stat, service or placement does not resolve.
 */
export async function getHomePage(
  locale: Locale,
  repository: ContentRepository = getRepository(),
): Promise<HomePageContent | null> {
  const record = await repository.getHomePage(locale);
  if (!record) return null;
  const {
    statIds,
    serviceIds,
    marqueeSeparatorId,
    testimonialArtIds,
    projectPlacements,
    partnerPlacements,
    testimonialPlacements,
    postPlacements,
    ...page
  } = record;
  // ponytail: no get-by-ids for projects/posts in the repository; one full page is fine for mock data.
  const [stats, testimonials, partners, projects, posts, services, artAssets] = await Promise.all([
    repository.getStats(statIds),
    repository.getTestimonials(idsOf(testimonialPlacements), locale),
    repository.getPartners(idsOf(partnerPlacements)),
    projectPlacements.length ? repository.listProjects(ALL) : null,
    postPlacements.length ? repository.listPosts({ locale, ...ALL }) : null,
    // Matched by id over every key, so the check does not depend on the id format.
    Promise.all(SERVICE_KEYS.map((key) => repository.getService(key, locale))),
    repository.getAssets([
      marqueeSeparatorId,
      testimonialArtIds.photoId,
      testimonialArtIds.quoteIconId,
      testimonialArtIds.lineId,
    ]),
  ]);
  const servicesList = services.filter((s): s is Service => s !== null);
  assertResolved(record.id, [
    ...missingIds(statIds, stats),
    ...missingIds(idsOf(projectPlacements), projects?.items),
    ...missingIds(idsOf(partnerPlacements), partners),
    ...missingIds(idsOf(testimonialPlacements), testimonials),
    ...missingIds(idsOf(postPlacements), posts?.items),
    ...missingIds(serviceIds, servicesList),
    ...missingIds(
      [
        marqueeSeparatorId,
        testimonialArtIds.photoId,
        testimonialArtIds.quoteIconId,
        testimonialArtIds.lineId,
      ],
      artAssets,
    ),
  ]);

  const projectItems = projects?.items ?? [];
  const postItems = posts?.items ?? [];
  const marqueeSeparator = artAssets.find((a) => a.id === marqueeSeparatorId);
  const photo = artAssets.find((a) => a.id === testimonialArtIds.photoId);
  const quoteIcon = artAssets.find((a) => a.id === testimonialArtIds.quoteIconId);
  const line = artAssets.find((a) => a.id === testimonialArtIds.lineId);

  return {
    ...page,
    stats: statIds.map((id) => stats.find((s) => s.id === id)!),
    services: serviceIds.map((id) => servicesList.find((s) => s.id === id)!),
    projects: idsOf(projectPlacements).map((id) => projectItems.find((p) => p.id === id)!),
    partners: idsOf(partnerPlacements).map((id) => partners.find((p) => p.id === id)!),
    testimonials: idsOf(testimonialPlacements).map((id) => testimonials.find((t) => t.id === id)!),
    posts: idsOf(postPlacements).map((id) => postItems.find((p) => p.id === id)!),
    marqueeSeparator: marqueeSeparator!,
    testimonialArt: {
      photo: photo!,
      quoteIcon: quoteIcon!,
      line: line!,
    },
  };
}

export interface HomeAssets {
  videoAsset: AssetRef | null;
  projectAssets: AssetRef[];
  projectCategories: ProjectCategory[];
  partnerAssets: AssetRef[];
  testimonialAssets: AssetRef[];
  postAssets: AssetRef[];
}

/**
 * Resolves all assets and categories required for the Home view in parallel.
 */
export async function getHomeAssets(
  content: HomePageContent | null,
  repository: ContentRepository = getRepository(),
): Promise<HomeAssets> {
  if (!content) {
    return {
      videoAsset: null,
      projectAssets: [],
      projectCategories: [],
      partnerAssets: [],
      testimonialAssets: [],
      postAssets: [],
    };
  }

  const galleryAssetIds = (content.projects ?? [])
    .map((p) => p.galleryIds[0])
    .filter((id): id is string => Boolean(id));
  const partnerLogoIds = (content.partners ?? []).map((p) => p.logoId);
  const testimonialAvatarIds = (content.testimonials ?? [])
    .map((t) => t.avatarId)
    .filter((id): id is string => Boolean(id));
  const postThumbnailIds = (content.posts ?? [])
    .map((p) => p.thumbnailId)
    .filter((id): id is string => Boolean(id));

  const [videoAssets, projectAssets, categories, partnerAssets, testimonialAssets, postAssets] =
    await Promise.all([
      content.hero.videoId ? repository.getAssets([content.hero.videoId]) : Promise.resolve([]),
      galleryAssetIds.length ? repository.getAssets(galleryAssetIds) : Promise.resolve([]),
      repository.getProjectCategories(),
      partnerLogoIds.length ? repository.getAssets(partnerLogoIds) : Promise.resolve([]),
      testimonialAvatarIds.length
        ? repository.getAssets(testimonialAvatarIds)
        : Promise.resolve([]),
      postThumbnailIds.length ? repository.getAssets(postThumbnailIds) : Promise.resolve([]),
    ]);

  return {
    videoAsset: videoAssets[0] ?? null,
    projectAssets,
    projectCategories: categories,
    partnerAssets,
    testimonialAssets,
    postAssets,
  };
}

/** The about page with its shared stats and entities resolved; throws on dangling ids. */
export async function getAboutPage(
  locale: Locale,
  repository: ContentRepository = getRepository(),
): Promise<AboutPageContent | null> {
  const record = await repository.getAboutPage(locale);
  if (!record) return null;
  const {
    statIds,
    marqueeSeparatorId,
    testimonialArtIds,
    purposeImageId,
    timelineDotId,
    ...page
  } = record;
  const [stats, testimonials, partners, assets] = await Promise.all([
    repository.getStats(statIds),
    repository.getTestimonials(record.testimonialIds, locale),
    repository.getPartners(record.partnerIds),
    repository.getAssets([
      marqueeSeparatorId,
      testimonialArtIds.photoId,
      testimonialArtIds.quoteIconId,
      testimonialArtIds.lineId,
      purposeImageId,
      timelineDotId,
    ]),
  ]);
  const marqueeSeparator = assets.find((a) => a.id === marqueeSeparatorId) ?? null;
  const photo = assets.find((a) => a.id === testimonialArtIds.photoId) ?? null;
  const quoteIcon = assets.find((a) => a.id === testimonialArtIds.quoteIconId) ?? null;
  const line = assets.find((a) => a.id === testimonialArtIds.lineId) ?? null;
  const purposeImage = assets.find((a) => a.id === purposeImageId) ?? null;
  const timelineDot = assets.find((a) => a.id === timelineDotId) ?? null;

  assertResolved(record.id, [
    ...missingIds(statIds, stats),
    ...missingIds(record.testimonialIds, testimonials),
    ...missingIds(record.partnerIds, partners),
    ...missingIds(
      [
        marqueeSeparatorId,
        testimonialArtIds.photoId,
        testimonialArtIds.quoteIconId,
        testimonialArtIds.lineId,
        purposeImageId,
        timelineDotId,
      ],
      assets,
    ),
  ]);
  return {
    ...page,
    stats,
    testimonials,
    marqueeSeparator: marqueeSeparator!,
    testimonialArt: {
      photo: photo!,
      quoteIcon: quoteIcon!,
      line: line!,
    },
    purposeImage: purposeImage!,
    timelineDot: timelineDot!,
  };
}

export interface AboutAssets {
  heroBgImage: AssetRef | null;
  subtractIcon: AssetRef | null;
  goalIcons: (AssetRef | null)[];
}

const SUBTRACT_ICON_ID = 'asset-d68ffd5723';

export async function getAboutAssets(
  page: AboutPageContent,
  repository: ContentRepository = getRepository(),
): Promise<AboutAssets> {
  const goalIconIds = page.goals.map((g) => g.iconId).filter((id): id is string => Boolean(id));
  const assetIdsToFetch = [
    ...(page.hero.imageId ? [page.hero.imageId] : []),
    SUBTRACT_ICON_ID,
    ...goalIconIds,
  ];
  const assets = await repository.getAssets(assetIdsToFetch);
  const heroBgImage = page.hero.imageId
    ? assets.find((a) => a.id === page.hero.imageId) ?? null
    : null;
  const subtractIcon = assets.find((a) => a.id === SUBTRACT_ICON_ID) ?? null;
  const goalIcons = page.goals.map(
    (g) => (g.iconId ? assets.find((a) => a.id === g.iconId) ?? null : null),
  );
  return {
    heroBgImage,
    subtractIcon,
    goalIcons,
  };
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
