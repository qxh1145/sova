import { blogDetailCopy, blogListingCopy } from '@/data/listings';
import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import { pathForRouteId, totalPages } from '@/lib/routes';
import type {
  AssetRef,
  ListingSettings,
  Locale,
  PageResult,
  Post,
  PostCategoryWithCount,
} from '@/types/content';

/** Posts per blog listing page; static params and the 404 gate share it. */
export const BLOG_PAGE_SIZE = 6;

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
  categories: PostCategoryWithCount[];
  basePath: string;
  copy: (typeof blogListingCopy)['vi'] | (typeof blogListingCopy)['en'];
  searchQuery?: string;
  blogBasePath: string;
}

async function resolveListingTail(
  result: PageResult<Post>,
  categories: PostCategoryWithCount[],
  repository: ContentRepository,
  options: {
    basePath: string;
    copy: BlogListingPageData['copy'];
    settings?: ListingSettings | null;
    searchQuery?: string;
    blogBasePath: string;
  },
): Promise<BlogListingPageData> {
  const thumbnailIds = result.items
    .map((p) => p.thumbnailId)
    .filter((id): id is string => Boolean(id));

  const thumbnailAssets = thumbnailIds.length ? await repository.getAssets(thumbnailIds) : [];
  const totalPagesCount = totalPages(result.total, result.pageSize);

  return {
    posts: result.items,
    thumbnailAssets,
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages: totalPagesCount,
    settings: options.settings ?? null,
    categories,
    basePath: options.basePath,
    copy: options.copy,
    ...(options.searchQuery !== undefined ? { searchQuery: options.searchQuery } : {}),
    blogBasePath: options.blogBasePath,
  };
}

export async function getBlogListingPage(
  input: BlogListingPageInput = {},
  repository: ContentRepository = getRepository(),
): Promise<BlogListingPageData | null> {
  const { page = 1, pageSize = BLOG_PAGE_SIZE, locale = 'vi', category } = input;

  const routes = await repository.listRoutes();

  if (input.routeId) {
    const explicitRoute = routes.find((r) => r.id === input.routeId);
    if (!explicitRoute || explicitRoute.kind !== 'post-list') {
      return null;
    }
  }

  const blogBasePath =
    locale === 'en'
      ? (pathForRouteId(routes, 'route-en--insight') ?? '/en/insight/')
      : (pathForRouteId(routes, 'route-goc-nhin') ?? '/goc-nhin/');
  const basePath = category ? `/${category}/` : blogBasePath;

  const baseRoute = routes.find((r) => r.locale === locale && r.path === basePath);
  if (!baseRoute || baseRoute.kind !== 'post-list') {
    return null;
  }

  const [result, categories] = await Promise.all([
    repository.listPosts({ locale, category, page, pageSize }),
    repository.getPostCategories(locale),
  ]);

  const totalPagesCount = totalPages(result.total, pageSize);
  if (page < 1 || (page > 1 && page > totalPagesCount)) {
    return null;
  }

  let routeId = input.routeId;
  if (!routeId) {
    if (page === 1) {
      routeId = baseRoute.id;
    } else {
      const pagedPath = `${basePath}page/${page}/`;
      const pagedRoute = routes.find((r) => r.locale === locale && r.path === pagedPath);
      routeId = pagedRoute?.id ?? baseRoute.id;
    }
  }

  const settings = routeId ? await repository.getListingSettings(routeId) : null;
  const copy = blogListingCopy[locale];

  return resolveListingTail(result, categories, repository, {
    basePath,
    blogBasePath,
    copy,
    settings,
  });
}

export interface BlogSearchPageInput {
  query: string;
  page?: number;
  pageSize?: number;
}

/** Page numbers past page 1 for a VI blog listing, derived from published counts. */
async function pagedNumbers(repository: ContentRepository, category?: string): Promise<string[]> {
  const { total } = await repository.listPosts({
    locale: 'vi',
    category,
    page: 1,
    pageSize: BLOG_PAGE_SIZE,
  });
  return Array.from({ length: Math.max(0, totalPages(total, BLOG_PAGE_SIZE) - 1) }, (_, i) =>
    String(i + 2),
  );
}

/** Static params for `/goc-nhin/page/[page]/`. */
export async function getBlogPagedParams(
  repository: ContentRepository = getRepository(),
): Promise<{ page: string }[]> {
  return (await pagedNumbers(repository)).map((page) => ({ page }));
}

/** Static params for `/[slug]/page/[page]/` across VI post categories. */
export async function getBlogCategoryPagedParams(
  repository: ContentRepository = getRepository(),
): Promise<{ slug: string; page: string }[]> {
  const categories = await repository.getPostCategories('vi');
  const perCategory = await Promise.all(
    categories.map(async (cat) =>
      (await pagedNumbers(repository, cat.slug)).map((page) => ({ slug: cat.slug, page })),
    ),
  );
  return perCategory.flat();
}

export async function getBlogSearchPage(
  input: BlogSearchPageInput,
  repository: ContentRepository = getRepository(),
): Promise<BlogListingPageData | null> {
  const { query, page = 1, pageSize = BLOG_PAGE_SIZE } = input;
  const locale: Locale = 'vi';

  const [result, categories, routes] = await Promise.all([
    repository.searchPosts({ locale, query, page, pageSize }),
    repository.getPostCategories(locale),
    repository.listRoutes(),
  ]);

  const totalPagesCount = totalPages(result.total, result.pageSize);
  if (page < 1 || (page > 1 && page > totalPagesCount)) {
    return null;
  }

  const copy = blogListingCopy[locale];
  const blogBasePath = pathForRouteId(routes, 'route-goc-nhin') ?? '/goc-nhin/';

  return resolveListingTail(result, categories, repository, {
    basePath: '/',
    blogBasePath,
    copy,
    settings: null,
    searchQuery: query,
  });
}

function applyMediaFallback(html: string, missingSrcs: Set<string>): string {
  if (missingSrcs.size === 0) return html;
  const stripped = html.replace(
    /<(img|source|video)\b([^>]*?)(\/?)>/gi,
    (match, tag, attrs, selfClose) => {
      const srcMatch = attrs.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
      if (!srcMatch) return match;
      const src = srcMatch[2];
      if (missingSrcs.has(src)) {
        const strippedAttrs = attrs
          .replace(/\bsrc\s*=\s*(["']).*?\1/i, '')
          .replace(/\s+/g, ' ')
          .trim();
        const closeSuffix = selfClose ? ' /' : '';
        return `<${tag}${strippedAttrs ? ' ' + strippedAttrs : ''} data-media-status="missing"${closeSuffix}>`;
      }
      return match;
    },
  );
  // A video whose every <source> lost its src is itself missing: mark it so the empty-box CSS applies.
  return stripped.replace(/<video\b([^>]*)>([\s\S]*?)<\/video>/gi, (match, attrs, inner) =>
    /<source\b/i.test(inner) &&
    !/<source\b[^>]*\ssrc\s*=/i.test(inner) &&
    !attrs.includes('data-media-status')
      ? `<video${attrs} data-media-status="missing">${inner}</video>`
      : match,
  );
}

export interface RelatedPostCard {
  post: Post;
  thumbnailAsset: AssetRef | null;
}

export interface PostDetailData {
  post: Post;
  featuredAsset: AssetRef | null;
  related: RelatedPostCard[];
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

  const relatedPosts = await repository.getRelatedPosts(post.id);

  const assetId = post.featuredImageId ?? post.thumbnailId;
  const bodyAssetIds = post.body?.assetIds ?? [];
  const relatedThumbnailIds = relatedPosts
    .map((p) => p.thumbnailId ?? p.featuredImageId)
    .filter((id): id is string => Boolean(id));

  const neededAssetIds = Array.from(
    new Set([...(assetId ? [assetId] : []), ...bodyAssetIds, ...relatedThumbnailIds]),
  );

  const assets = neededAssetIds.length ? await repository.getAssets(neededAssetIds) : [];
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const featuredAsset = assetId ? (assetMap.get(assetId) ?? null) : null;

  const missingSrcs = new Set(
    bodyAssetIds
      .map((id) => assetMap.get(id))
      .filter((a): a is AssetRef => Boolean(a && a.status === 'missing' && a.src))
      .map((a) => a.src),
  );

  const fallbackAppliedBody = post.body
    ? {
        ...post.body,
        html: applyMediaFallback(post.body.html, missingSrcs),
      }
    : post.body;

  const related: RelatedPostCard[] = relatedPosts.map((relatedPost) => {
    const thumbId = relatedPost.thumbnailId ?? relatedPost.featuredImageId;
    return {
      post: relatedPost,
      thumbnailAsset: thumbId ? (assetMap.get(thumbId) ?? null) : null,
    };
  });

  return {
    post: {
      ...post,
      body: fallbackAppliedBody,
    },
    featuredAsset,
    related,
    copy: blogDetailCopy,
  };
}
