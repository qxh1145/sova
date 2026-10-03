// Guards the committed importer output (the importer itself cannot run in CI).
import { expect, test } from 'vitest';
import { BRAND_LEAK_RE } from '@/lib/content/brand';
import { SCRUB_RULES } from '@/lib/content/scrub';
import { createMockRepository } from '@/lib/repositories/mock';
import type { ContentData } from '@/lib/repositories/contracts';
import { assets } from './assets';
import { listingSnapshots } from './listings';
import { postCategories } from './post-categories';
import { posts } from './posts';

const PAGE_SIZE = 6;
const postIds = new Set(posts.map((p) => p.id));
const assetById = new Map(assets.map((a) => [a.id, a]));

test('27 VI posts and 6 categories with the sidebar counts', () => {
  expect(posts).toHaveLength(27);
  expect(posts.every((p) => p.locale === 'vi')).toBe(true);
  expect(Object.fromEntries(postCategories.map((c) => [c.slug, c.sourceDisplayCount]))).toEqual({
    'creative-branding': 1,
    'goc-nhin-website': 6,
    'social-marketing': 7,
    'thu-thuat': 12,
    'tin-tuc': 3,
    'ux-ui': 2,
  });
});

test('ids are unique and every record keeps its source', () => {
  const ids = [...posts, ...postCategories, ...assets].map((r) => r.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const record of [...posts, ...postCategories, ...assets])
    expect(record.sources.length).toBeGreaterThan(0);
});

test('category, related and snapshot ids resolve', () => {
  const categoryIds = new Set(postCategories.map((c) => c.id));
  for (const post of posts) {
    expect(post.categoryIds.length).toBeGreaterThan(0);
    for (const id of post.categoryIds) expect(categoryIds).toContain(id);
    for (const id of post.relatedPostIds) expect(postIds).toContain(id);
  }
  // Multi-category posts keep every category: assignments add up to the sidebar counts (31 > 27).
  expect(posts.flatMap((p) => p.categoryIds)).toHaveLength(
    postCategories.reduce((n, c) => n + c.sourceDisplayCount!, 0),
  );
  expect(posts.some((p) => p.categoryIds.length > 1)).toBe(true);
  for (const snapshot of listingSnapshots)
    for (const id of snapshot.orderedIds) expect(postIds).toContain(id);
});

test('listPosts reproduces every captured listing page and total', async () => {
  const repo = createMockRepository({ posts, postCategories } as unknown as ContentData);
  const totals: Record<string, number> = { '/goc-nhin/': 27 };
  for (const c of postCategories) totals[c.path] = c.sourceDisplayCount!;
  for (const { routeId, page, orderedIds } of listingSnapshots) {
    const category = routeId === '/goc-nhin/' ? undefined : routeId.slice(1, -1);
    const result = await repo.listPosts({ locale: 'vi', category, page, pageSize: PAGE_SIZE });
    expect(
      result.items.map((p) => p.id),
      `${routeId} page ${page}`,
    ).toEqual(orderedIds);
    expect(result.total).toBe(totals[routeId]);
  }
});

test('every post asset resolves; local assets live under /wp-content/uploads/', () => {
  for (const post of posts) {
    const ids = [post.thumbnailId, post.featuredImageId, post.seo.imageId, ...post.body.assetIds];
    for (const id of ids.filter(Boolean)) expect(assetById.has(id!), `${post.id} ${id}`).toBe(true);
    const srcs = post.body.assetIds.map((id) => assetById.get(id)!.src);
    for (const [, src] of post.body.html.matchAll(/<(?:img|source) src="([^"]*)"/g))
      expect(srcs).toContain(src.replace(/&amp;/g, '&'));
  }
  for (const asset of assets)
    if (asset.status === 'local') expect(asset.src.startsWith('/wp-content/uploads/')).toBe(true);
});

test('no Eras word or raw Eras contact value in post and category text', () => {
  // Asset paths are source-determined (e.g. ERAS-THUMB-*.webp) and excluded.
  const alts = assets.map((a) => a.alt);
  const text = JSON.stringify({ posts, postCategories, listingSnapshots, alts }).replace(
    /src=\\"[^"\\]*\\"/g,
    '',
  );
  expect([...text.matchAll(BRAND_LEAK_RE)].map((m) => m[0])).toEqual([]);
  for (const [pattern] of SCRUB_RULES) expect(text.match(pattern)).toBeNull();
});
