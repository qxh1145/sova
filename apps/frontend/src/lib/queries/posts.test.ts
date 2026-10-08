import { expect, test } from 'vitest';
import { createMockRepository, defaultContentData } from '@/lib/repositories/mock';
import { posts } from '@/data/posts';
import {
  getBlogListingPage,
  getPostCategories,
  getPostDetail,
  getRelatedPosts,
  searchPosts,
} from './posts';
import { getRelatedProjects } from './projects';

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
  expect(data).not.toBeNull();
  expect(data!.posts).toHaveLength(6);
  expect(data!.total).toBe(27);
  expect(data!.totalPages).toBe(5);
  expect(data!.thumbnailAssets.map((a) => a.id).sort()).toEqual(
    data!.posts.map((p) => p.thumbnailId).sort(),
  );
  expect(data!.categories.map((c) => c.count)).toEqual([1, 6, 7, 12, 3, 2]);
});

test('getBlogListingPage slices category pages correctly', async () => {
  const thuThuatPage1 = await getBlogListingPage(
    { category: 'thu-thuat', page: 1, pageSize: 6 },
    6,
    repository,
  );
  expect(thuThuatPage1).not.toBeNull();
  expect(thuThuatPage1!.posts).toHaveLength(6);
  expect(thuThuatPage1!.total).toBe(12);
  expect(thuThuatPage1!.totalPages).toBe(2);
  expect(thuThuatPage1!.basePath).toBe('/thu-thuat/');

  const thuThuatPage2 = await getBlogListingPage(
    { category: 'thu-thuat', page: 2, pageSize: 6 },
    6,
    repository,
  );
  expect(thuThuatPage2).not.toBeNull();
  expect(thuThuatPage2!.posts).toHaveLength(6);

  const socialPage2 = await getBlogListingPage(
    { category: 'social-marketing', page: 2, pageSize: 6 },
    6,
    repository,
  );
  expect(socialPage2).not.toBeNull();
  expect(socialPage2!.posts).toHaveLength(1);
  expect(socialPage2!.total).toBe(7);
});

test('getBlogListingPage returns null for unknown route or unsourced page', async () => {
  expect(
    await getBlogListingPage({ routeId: 'route-non-existent' }, 6, repository),
  ).toBeNull();
  // /tin-tuc/ only has page 1 in routes
  expect(
    await getBlogListingPage({ category: 'tin-tuc', page: 2 }, 6, repository),
  ).toBeNull();
  // /goc-nhin/page/6/ not in routes
  expect(
    await getBlogListingPage({ page: 6 }, 6, repository),
  ).toBeNull();
  // number input for unsourced page 6 returns null
  expect(
    await getBlogListingPage(6, 6, repository),
  ).toBeNull();
});

test('getBlogListingPage returns EN shell with no posts for en insight', async () => {
  const enInsight = await getBlogListingPage(
    { routeId: 'route-en--insight', locale: 'en' },
    6,
    repository,
  );
  expect(enInsight).not.toBeNull();
  expect(enInsight!.posts).toHaveLength(0);
  expect(enInsight!.categories).toHaveLength(0);
  expect(enInsight!.copy.title).toBe('Insight');
  expect(enInsight!.basePath).toBe('/en/insight/');
});

test('getPostCategories computes category counts in source order', async () => {
  const categories = await getPostCategories('vi', repository);
  expect(categories.map((c) => c.slug)).toEqual([
    'creative-branding',
    'goc-nhin-website',
    'social-marketing',
    'thu-thuat',
    'tin-tuc',
    'ux-ui',
  ]);
  expect(categories.map((c) => c.count)).toEqual([1, 6, 7, 12, 3, 2]);
});

test('getPostCategories counts a newly added mock post with no code change', async () => {
  const before = await getPostCategories('vi', repository);
  const added = { ...posts[0], id: 'post-added-test', slug: 'post-added-test' };
  const repoWithAdded = createMockRepository({
    ...defaultContentData,
    posts: [...defaultContentData.posts, added],
  });
  const after = await getPostCategories('vi', repoWithAdded);
  expect(after.map((c) => c.count)).toEqual(
    before.map((c) => c.count + (added.categoryIds.includes(c.id) ? 1 : 0)),
  );
});

test('getRelatedPosts returns posts in relatedPostIds order, skipping unknown ids', async () => {
  const post = posts[0];
  const related = await getRelatedPosts(post.id, repository);
  expect(related.map((p) => p.id)).toEqual(post.relatedPostIds);

  const unknown = await getRelatedPosts('unknown-id', repository);
  expect(unknown).toEqual([]);

  const repoWithMissing = createMockRepository({
    ...defaultContentData,
    posts: [
      {
        ...post,
        id: 'test-parent',
        relatedPostIds: ['unknown-1', posts[2].id, 'unknown-2', posts[1].id],
      },
      posts[1],
      posts[2],
    ],
  });
  const filtered = await getRelatedPosts('test-parent', repoWithMissing);
  expect(filtered.map((p) => p.id)).toEqual([posts[2].id, posts[1].id]);
});

test('getRelatedProjects returns projects in relatedProjectIds order, skipping unknown ids', async () => {
  const project = defaultContentData.projects.find((p) => p.id === 'project-473')!;
  const related = await getRelatedProjects(project.id, repository);
  expect(related.map((p) => p.id)).toEqual(project.relatedProjectIds);

  const unknown = await getRelatedProjects('unknown-project', repository);
  expect(unknown).toEqual([]);

  const [first, second] = defaultContentData.projects;
  const repoWithMissing = createMockRepository({
    ...defaultContentData,
    projects: [
      {
        ...project,
        id: 'test-parent',
        relatedProjectIds: ['unknown-1', second.id, 'unknown-2', first.id],
      },
      first,
      second,
    ],
  });
  const filtered = await getRelatedProjects('test-parent', repoWithMissing);
  expect(filtered.map((p) => p.id)).toEqual([second.id, first.id]);
});

test('searchPosts searches title, excerpt, and tag-stripped body HTML with accents and case folding', async () => {
  for (const query of ['', '   ']) {
    const blank = await searchPosts({ locale: 'vi', query, page: 1, pageSize: 6 }, repository);
    expect(blank.total).toBe(27);
    expect(blank.items.map((p) => p.id)).toEqual(posts.slice(0, 6).map((p) => p.id));
  }

  // Accent & case folding: "thu thuat" matches "Thủ thuật"
  const accentResult = await searchPosts(
    { locale: 'vi', query: 'thu thuat', page: 1, pageSize: 50 },
    repository,
  );
  expect(accentResult.total).toBeGreaterThan(0);
  expect(
    accentResult.items.some(
      (p) => p.title.includes('Thủ thuật') || p.body.html.includes('thủ thuật'),
    ),
  ).toBe(true);

  // Tag stripping: text inside attribute must not match
  const customPost: (typeof posts)[0] = {
    ...posts[0],
    id: 'post-html-test',
    slug: 'post-html-test',
    title: 'Đường Tiêu Đề',
    excerpt: 'Mô tả ngắn gọn',
    body: {
      format: 'sanitized-html',
      html: '<p class="secret-attr-only">Visible Body Content</p>\n<p><strong>Next</strong>  paragraph</p>',
      assetIds: [],
      sources: [],
    },
  };
  const htmlRepo = createMockRepository({
    ...defaultContentData,
    posts: [customPost],
  });
  const attrMatch = await searchPosts(
    { locale: 'vi', query: 'secret-attr-only', page: 1, pageSize: 10 },
    htmlRepo,
  );
  expect(attrMatch.total).toBe(0);

  const bodyMatch = await searchPosts(
    { locale: 'vi', query: 'Visible Body Content', page: 1, pageSize: 10 },
    htmlRepo,
  );
  expect(bodyMatch.total).toBe(1);

  // One field each, case folding, đ→d folding, phrase across tag boundaries
  for (const query of [
    'DUONG TIEU DE',
    'mo ta ngan',
    'visible body content',
    'content next paragraph',
  ]) {
    const match = await searchPosts({ locale: 'vi', query, page: 1, pageSize: 10 }, htmlRepo);
    expect(
      match.items.map((p) => p.id),
      query,
    ).toEqual(['post-html-test']);
  }

  const noMatch = await searchPosts(
    { locale: 'vi', query: 'xyznonexistentterm123', page: 1, pageSize: 10 },
    repository,
  );
  expect(noMatch.items).toEqual([]);
  expect(noMatch.total).toBe(0);
});

test('draft fixture post is excluded from getPost, listPosts, getRelatedPosts, getPostCategories and searchPosts', async () => {
  const publishedPost = posts[0];
  const draftPost: (typeof posts)[0] = {
    ...posts[1],
    id: 'post-draft-test',
    slug: 'post-draft-test',
    title: 'Unique Draft Title For Test',
    categoryIds: publishedPost.categoryIds,
    relatedPostIds: [publishedPost.id],
    editorial: {
      status: 'draft',
      updatedAt: '2026-10-08',
      revision: 1,
    },
  };
  const testRepo = createMockRepository({
    ...defaultContentData,
    posts: [
      {
        ...publishedPost,
        relatedPostIds: [draftPost.id],
      },
      draftPost,
    ],
  });

  // getPost returns null
  expect(await testRepo.getPost(draftPost.slug)).toBeNull();

  // listPosts excludes draft
  const list = await testRepo.listPosts({ locale: 'vi', page: 1, pageSize: 10 });
  expect(list.items.map((p) => p.id)).toEqual([publishedPost.id]);
  expect(list.total).toBe(1);

  // getRelatedPosts excludes draft
  const related = await testRepo.getRelatedPosts(publishedPost.id);
  expect(related).toEqual([]);
  expect(await testRepo.getRelatedPosts(draftPost.id)).toEqual([]);

  // getPostCategories excludes draft from count
  const cats = await testRepo.getPostCategories('vi');
  for (const cat of cats) {
    if (publishedPost.categoryIds.includes(cat.id)) {
      expect(cat.count).toBe(1);
    } else {
      expect(cat.count).toBe(0);
    }
  }

  // searchPosts excludes draft even when query matches
  const search = await testRepo.searchPosts({
    locale: 'vi',
    query: 'Unique Draft Title',
    page: 1,
    pageSize: 10,
  });
  expect(search.total).toBe(0);
  expect(search.items).toEqual([]);
});
