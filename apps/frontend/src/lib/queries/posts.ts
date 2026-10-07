import { blogDetailCopy, blogListingCopy } from '@/data/listings';
import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import type { AssetRef, ListingSettings, Locale, PageResult, Post } from '@/types/content';

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

export interface BlogListingPageData {
  posts: Post[];
  thumbnailAssets: AssetRef[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  settings: ListingSettings | null;
  copy: typeof blogListingCopy;
}

export async function getBlogListingPage(
  page = 1,
  pageSize = 6,
  repository: ContentRepository = getRepository(),
): Promise<BlogListingPageData> {
  const [result, settings] = await Promise.all([
    repository.listPosts({ locale: 'vi', page, pageSize }),
    repository.getListingSettings('route-goc-nhin'),
  ]);

  const thumbnailIds = result.items
    .map((p) => p.thumbnailId)
    .filter((id): id is string => Boolean(id));

  const thumbnailAssets = thumbnailIds.length ? await repository.getAssets(thumbnailIds) : [];
  const totalPages = result.pageSize > 0 ? Math.ceil(result.total / result.pageSize) : 1;

  return {
    posts: result.items,
    thumbnailAssets,
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    totalPages,
    settings,
    copy: blogListingCopy,
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
