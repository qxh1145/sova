import { blogDetailCopy, blogListingCopy } from '@/data/listings';
import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import type {
  AssetRef,
  EntityId,
  ListingSettings,
  Locale,
  PageResult,
  Post,
  PostCategory,
} from '@/types/content';

export function getPost(
  slug: string,
  repository: ContentRepository = getRepository(),
): Promise<Post | null> {
  return repository.getPost(slug);
}

export function listPosts(
  input: {
    locale: Locale;
    category?: string;
    page: number;
    pageSize: number;
  },
  repository: ContentRepository = getRepository(),
): Promise<PageResult<Post>> {
  return repository.listPosts(input);
}

export function getPostCategories(
  locale: Locale,
  repository: ContentRepository = getRepository(),
): Promise<(PostCategory & { count: number })[]> {
  return repository.getPostCategories(locale);
}

export function getRelatedPosts(
  id: EntityId,
  repository: ContentRepository = getRepository(),
): Promise<Post[]> {
  return repository.getRelatedPosts(id);
}

export function searchPosts(
  input: {
    locale: Locale;
    query: string;
    page: number;
    pageSize: number;
  },
  repository: ContentRepository = getRepository(),
): Promise<PageResult<Post>> {
  return repository.searchPosts(input);
}

export interface BlogListingPageInput {
  routeId?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  locale?: Locale;
}

export interface BlogListingPageData {
  posts: Post[];
  thumbnailAssets: AssetRef[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  settings: ListingSettings | null;
  categories: (PostCategory & { count: number })[];
  basePath: string;
  copy: (typeof blogListingCopy)['vi'] | (typeof blogListingCopy)['en'];
}

export async function getBlogListingPage(
  input: BlogListingPageInput = {},
  repository: ContentRepository = getRepository(),
): Promise<BlogListingPageData | null> {
  const { page = 1, pageSize = 6, locale = 'vi', category } = input;

  const routes = await repository.listRoutes();

  let routeId = input.routeId;
  let targetRoute: (typeof routes)[0] | undefined;

  if (routeId) {
    targetRoute = routes.find((r) => r.id === routeId);
  } else if (category) {
    const catPath = page === 1 ? `/${category}/` : `/${category}/page/${page}/`;
    targetRoute = routes.find((r) => r.locale === locale && r.path === catPath);
    if (targetRoute) {
      routeId = targetRoute.id;
    }
  } else if (locale === 'en') {
    targetRoute = routes.find((r) => r.locale === 'en' && r.path === '/en/insight/');
    if (targetRoute) {
      routeId = targetRoute.id;
    }
  } else {
    const gocNhinPath = page === 1 ? '/goc-nhin/' : `/goc-nhin/page/${page}/`;
    targetRoute = routes.find((r) => r.locale === 'vi' && r.path === gocNhinPath);
    if (targetRoute) {
      routeId = targetRoute.id;
    }
  }

  if (!targetRoute || targetRoute.kind !== 'post-list') {
    return null;
  }

  const [result, settings, categories] = await Promise.all([
    repository.listPosts({ locale, category, page, pageSize }),
    routeId ? repository.getListingSettings(routeId) : null,
    repository.getPostCategories(locale),
  ]);

  const thumbnailIds = result.items
    .map((p) => p.thumbnailId)
    .filter((id): id is string => Boolean(id));

  const thumbnailAssets = thumbnailIds.length ? await repository.getAssets(thumbnailIds) : [];
  const totalPages = result.pageSize > 0 ? Math.ceil(result.total / result.pageSize) : 1;

  const basePath = category ? `/${category}/` : locale === 'en' ? '/en/insight/' : '/goc-nhin/';
  const copy = blogListingCopy[locale];

  return {
    posts: result.items,
    thumbnailAssets,
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages,
    settings,
    categories,
    basePath,
    copy,
  };
}

export interface PostDetailData {
  post: Post;
  featuredAsset: AssetRef | null;
  copy: typeof blogDetailCopy;
}

export async function getPostDetail(
  slug: string,
  repository: ContentRepository = getRepository(),
): Promise<PostDetailData | null> {
  const post = await repository.getPost(slug);
  if (!post) {
    return null;
  }

  const assetId = post.featuredImageId ?? post.thumbnailId;
  const assets = assetId ? await repository.getAssets([assetId]) : [];
  const featuredAsset = assets[0] ?? null;

  return {
    post,
    featuredAsset,
    copy: blogDetailCopy,
  };
}
