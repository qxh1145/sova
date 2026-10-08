import { blogDetailCopy, blogListingCopy } from '@/data/listings';
import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import type {
  AssetRef,
  ListingSettings,
  Locale,
  PageResult,
  Post,
  PostCategoryWithCount,
} from '@/types/content';

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
  },
): Promise<BlogListingPageData> {
  const thumbnailIds = result.items
    .map((p) => p.thumbnailId)
    .filter((id): id is string => Boolean(id));

  const thumbnailAssets = thumbnailIds.length ? await repository.getAssets(thumbnailIds) : [];
  const totalPages = Math.ceil(result.total / result.pageSize);

  return {
    posts: result.items,
    thumbnailAssets,
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages,
    settings: options.settings ?? null,
    categories,
    basePath: options.basePath,
    copy: options.copy,
    ...(options.searchQuery !== undefined ? { searchQuery: options.searchQuery } : {}),
  };
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

  const basePath = category ? `/${category}/` : locale === 'en' ? '/en/insight/' : '/goc-nhin/';
  const copy = blogListingCopy[locale];

  return resolveListingTail(result, categories, repository, {
    basePath,
    copy,
    settings,
  });
}

export interface BlogSearchPageInput {
  query: string;
  page?: number;
  pageSize?: number;
}

export async function getBlogSearchPage(
  input: BlogSearchPageInput,
  repository: ContentRepository = getRepository(),
): Promise<BlogListingPageData | null> {
  const { query, page = 1, pageSize = 6 } = input;
  const locale: Locale = 'vi';

  const [result, categories] = await Promise.all([
    repository.searchPosts({ locale, query, page, pageSize }),
    repository.getPostCategories(locale),
  ]);

  const totalPages = Math.ceil(result.total / result.pageSize);
  if (page > 1 && page > totalPages) {
    return null;
  }

  const copy = blogListingCopy[locale];

  return resolveListingTail(result, categories, repository, {
    basePath: '/',
    copy,
    settings: null,
    searchQuery: query,
  });
}

function applyMediaFallback(html: string, missingSrcs: Set<string>): string {
  if (missingSrcs.size === 0) return html;
  const stripped = html.replace(/<(img|source|video)\b([^>]*?)(\/?)>/gi, (match, tag, attrs, selfClose) => {
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
  });
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

  const featuredAsset = assetId ? assetMap.get(assetId) ?? null : null;

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
      thumbnailAsset: thumbId ? assetMap.get(thumbId) ?? null : null,
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
