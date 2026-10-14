import { projectListingCopy } from '@/data/listings';
import { featuredItemOrder } from '@/data/projects';
import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import { categoryIdBySlug } from '@/lib/routes';
import type {
  AssetRef,
  CarouselLabels,
  EntityId,
  ListingSettings,
  Locale,
  Project,
  ProjectCategory,
  UtilityContent,
} from '@/types/content';

export interface ProjectListingPageData {
  projects: Project[];
  categories: (ProjectCategory & { count: number })[];
  thumbnailAssets: AssetRef[];
  heroImage: AssetRef | null;
  bgImage: AssetRef | null;
  settings: ListingSettings | null;
  copy: (typeof projectListingCopy)['vi' | 'en'];
  locale: Locale;
}

/**
 * Listing page data for `/du-an/`, `/en/our-project/` (default routeId by locale) or a featured
 * archive route. `category` (a category slug) keeps only that category's projects; category counts
 * always cover every locale project.
 */
/** Project category slugs, for category-archive static params. */
export async function listProjectCategorySlugs(
  repository: ContentRepository = getRepository(),
): Promise<string[]> {
  return (await repository.getProjectCategories()).map((c) => c.slug);
}

export async function getProjectListingPage(
  locale: Locale,
  repository: ContentRepository = getRepository(),
  {
    routeId = locale === 'en' ? 'route-en--our-project' : 'route-du-an',
    category,
  }: { routeId?: EntityId; category?: string } = {},
): Promise<ProjectListingPageData | null> {
  const routes = await repository.listRoutes();
  const targetRoute = routes.find((r) => r.id === routeId);
  if (!targetRoute || targetRoute.kind !== 'project-list' || targetRoute.locale !== locale) {
    return null;
  }

  const [allProjectsResult, allCategories, settings] = await Promise.all([
    repository.listProjects({ page: 1, pageSize: Number.MAX_SAFE_INTEGER }),
    repository.getProjectCategories(),
    repository.getListingSettings(routeId),
  ]);

  const categoryId = category ? categoryIdBySlug(allCategories, category) : undefined;
  if (category && !categoryId) {
    return null;
  }

  // Filter projects by locale
  const localeProjects = allProjectsResult.items.filter((p) => p.locale === locale);

  // Derive counts for categories from locale projects
  const categories = allCategories.map((cat) => ({
    ...cat,
    count: localeProjects.filter((p) => p.categoryIds.includes(cat.id)).length,
  }));

  const isFeaturedItem =
    routeId === 'route-featured_item' || targetRoute.path === '/featured_item/';
  const featuredOrderMap = new Map(featuredItemOrder.map((id, idx) => [id, idx]));

  const projects = category
    ? localeProjects.filter((p) => categoryId && p.categoryIds.includes(categoryId))
    : isFeaturedItem
      ? [...localeProjects].sort(
          (a, b) => (featuredOrderMap.get(a.id) ?? 999) - (featuredOrderMap.get(b.id) ?? 999),
        )
      : localeProjects;

  // Fetch thumbnail assets
  const thumbnailIds = projects.map((p) => p.thumbnailId).filter((id): id is string => Boolean(id));

  // Collect hero images
  const heroImageId = settings?.hero?.imageId;
  const bgImageId = settings?.hero?.bgImageId;
  const neededAssetIds = [
    ...new Set([...thumbnailIds, heroImageId, bgImageId].filter(Boolean) as string[]),
  ];

  const assets = neededAssetIds.length ? await repository.getAssets(neededAssetIds) : [];
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const heroImage = heroImageId ? (assetMap.get(heroImageId) ?? null) : null;
  const bgImage = bgImageId ? (assetMap.get(bgImageId) ?? null) : null;

  return {
    projects,
    categories,
    thumbnailAssets: thumbnailIds.map((id) => assetMap.get(id)).filter(Boolean) as AssetRef[],
    heroImage,
    bgImage,
    settings,
    copy: projectListingCopy[locale],
    locale,
  };
}

export interface RelatedProjectCard {
  project: Project;
  thumbnailAsset: AssetRef | null;
  category: ProjectCategory | null;
}

export interface ProjectDetailData {
  project: Project;
  heroAsset: AssetRef | null;
  galleryAssets: AssetRef[];
  terms: UtilityContent | null;
  related: RelatedProjectCard[];
  carouselLabels: CarouselLabels;
}

export async function getProjectDetail(
  slug: string,
  repository: ContentRepository = getRepository(),
): Promise<ProjectDetailData | null> {
  const project = await repository.getProject(slug);
  if (!project) return null;

  const [allCategories, relatedProjects, terms, shell] = await Promise.all([
    repository.getProjectCategories(),
    repository.getRelatedProjects(project.id),
    project.deliveryTermsId ? repository.getUtilityContent(project.deliveryTermsId) : null,
    repository.getShellContent(project.locale),
  ]);

  const relatedCards = relatedProjects.slice(0, 4);

  const neededAssetIds = [
    project.heroImageId,
    ...project.galleryIds,
    ...relatedCards.map((p) => p.thumbnailId),
  ].filter((id): id is string => Boolean(id));

  const assets = neededAssetIds.length ? await repository.getAssets(neededAssetIds) : [];
  const assetMap = new Map(assets.map((a) => [a.id, a]));
  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

  const heroAsset = project.heroImageId ? (assetMap.get(project.heroImageId) ?? null) : null;
  const galleryAssets = project.galleryIds
    .map((id) => assetMap.get(id))
    .filter((a): a is AssetRef => Boolean(a));

  const related: RelatedProjectCard[] = relatedCards.map((relProject) => {
    const thumb = relProject.thumbnailId ? (assetMap.get(relProject.thumbnailId) ?? null) : null;
    const catId = relProject.categoryIds[0];
    const cat = catId ? (categoryMap.get(catId) ?? null) : null;
    return {
      project: relProject,
      thumbnailAsset: thumb,
      category: cat,
    };
  });

  return {
    project,
    heroAsset,
    galleryAssets,
    terms,
    related,
    carouselLabels: { ...shell.carouselLabels, region: shell.projectGalleryLabel },
  };
}
