import { expect, test } from 'vitest';
import { createMockRepository, defaultContentData } from '@/lib/repositories/mock';
import { posts } from '@/data/posts';
import { getBlogListingPage, getPostDetail } from './posts';

const repository = createMockRepository(defaultContentData);

test('getPostDetail returns null for an unknown slug', async () => {
  expect(await getPostDetail('khong-ton-tai', repository)).toBeNull();
});

test('getPostDetail prefers featuredImageId over thumbnailId', async () => {
  // Real posts share one id for both fields, so use a distinct featured image.
  const post = { ...posts[0], featuredImageId: posts[1].thumbnailId };
  expect(post.featuredImageId).not.toBe(post.thumbnailId);
  const repo = createMockRepository({ ...defaultContentData, posts: [post] });
  const detail = await getPostDetail(post.slug, repo);
  expect(detail?.post.id).toBe(post.id);
  expect(detail?.featuredAsset?.id).toBe(post.featuredImageId);
});

test('getPostDetail falls back to thumbnailId without a featured image', async () => {
  const post = { ...posts[0], featuredImageId: undefined };
  const repo = createMockRepository({ ...defaultContentData, posts: [post] });
  const detail = await getPostDetail(post.slug, repo);
  expect(detail?.featuredAsset?.id).toBe(post.thumbnailId);
});

test('getBlogListingPage returns page 1 with thumbnails and total pages', async () => {
  const data = await getBlogListingPage(1, 6, repository);
  expect(data.posts).toHaveLength(6);
  expect(data.total).toBe(27);
  expect(data.totalPages).toBe(5);
  expect(data.thumbnailAssets.map((a) => a.id).sort()).toEqual(
    data.posts.map((p) => p.thumbnailId).sort(),
  );
});
