import { projectListingCopy } from '@/data/listings';
import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import type {
  AssetRef,
  EntityId,
  ListingSettings,
  Locale,
  PageResult,
  Project,
  ProjectCategory,
} from '@/types/content';

export function getProject(slug: string): Promise<Project | null> {
  return getRepository().getProject(slug);
}

export function listProjects(input: {
  category?: string;
  page: number;
  pageSize: number;
}): Promise<PageResult<Project>> {
  return getRepository().listProjects(input);
}

export function getProjectCategories(
  repository: ContentRepository = getRepository(),
): Promise<ProjectCategory[]> {
  return repository.getProjectCategories();
}

export function getRelatedProjects(
  id: string,
  repository: ContentRepository = getRepository(),
): Promise<Project[]> {
  return repository.getRelatedProjects(id);
}

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
export async function getProjectListingPage(
  locale: Locale,
  repository: ContentRepository = getRepository(),
  {
    routeId = locale === 'en' ? 'route-en--our-project' : 'route-du-an',
    category,
  }: { routeId?: EntityId; category?: string } = {},
): Promise<ProjectListingPageData> {
  const [allProjectsResult, allCategories, settings] = await Promise.all([
    repository.listProjects({ page: 1, pageSize: Number.MAX_SAFE_INTEGER }),
    repository.getProjectCategories(),
    repository.getListingSettings(routeId),
  ]);

  // Filter projects by locale
  const localeProjects = allProjectsResult.items.filter((p) => p.locale === locale);

  // Derive counts for categories from locale projects
  const categories = allCategories.map((cat) => ({
    ...cat,
    count: localeProjects.filter((p) => p.categoryIds.includes(cat.id)).length,
  }));

  const categoryId = category && allCategories.find((c) => c.slug === category)?.id;
  const projects = category
    ? localeProjects.filter((p) => categoryId && p.categoryIds.includes(categoryId))
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
