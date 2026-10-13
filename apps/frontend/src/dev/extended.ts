import type { ContentData } from '@/lib/repositories/contracts';
import { defaultContentData } from '@/lib/repositories/mock';
import { validateRoutes } from '@/lib/routes';
import type { Post, Project, PublicPath, RouteEntry } from '@/types/content';

const mockProjectSlug = 'du-an-mock-mo-rong';
const mockProjectId = 'project-mock-extended';
const mockProjectRouteId = `route-featured_item--${mockProjectSlug}`;
export const mockProjectPath = `/featured_item/${mockProjectSlug}/` as PublicPath;

const mockPostSlug = 'bai-viet-mock-mo-rong-tim-kiem-xyz987';
const mockPostId = 'post-mock-extended';
const mockPostRouteId = `route-${mockPostSlug}`;
export const mockPostPath = `/${mockPostSlug}/` as PublicPath;
export const mockPostSearchToken = 'xyz987';

export const mockProject: Project = {
  id: mockProjectId,
  locale: 'vi',
  path: mockProjectPath,
  title: 'Dự án Mock Mở Rộng',
  slug: mockProjectSlug,
  categoryIds: ['project-category-mobile-app'],
  galleryIds: ['asset-3005f09701'],
  galleryLayout: 'slider',
  body: {
    format: 'sanitized-html',
    html: '<p>Nội dung chi tiết dự án mock mở rộng.</p>',
    assetIds: [],
    sources: [{ file: 'mock/project.html', line: 1 }],
  },
  metadata: [],
  deliveryTermsId: 'project-terms-1',
  relatedProjectIds: ['project-585', 'project-2348'],
  seo: {
    title: 'Dự án Mock Mở Rộng - Công ty thiết kế website chuyên nghiệp | Sova',
    canonicalPath: mockProjectPath,
    description: 'Mô tả dự án mock mở rộng.',
  },
  sources: [{ file: 'mock/project.html', line: 1, sourceId: 'mock-project' }],
  thumbnailId: 'asset-3005f09701',
  heroImageId: 'asset-6ea8fcf731',
  displayDate: '24 Tháng Bảy, 2024',
  displayDateMarkup: 'heading',
  summary: 'Tóm tắt dự án mock mở rộng phục vụ kiểm thử data-driven.',
};

export const mockPost: Post = {
  id: mockPostId,
  locale: 'vi',
  path: mockPostPath,
  title: `Bài viết Mock Mở Rộng ${mockPostSearchToken}`,
  slug: mockPostSlug,
  categoryIds: ['post-category-creative-branding'],
  excerpt: `Đoạn trích dẫn bài viết mock mở rộng chứa từ khóa ${mockPostSearchToken}.`,
  body: {
    format: 'sanitized-html',
    html: `<p>Nội dung chi tiết bài viết mock mở rộng chứa mã độc nhất ${mockPostSearchToken} để kiểm thử tìm kiếm.</p>`,
    assetIds: [],
    sources: [{ file: 'mock/post.html', line: 1 }],
  },
  author: { id: 'author-quantri', name: 'quantri' },
  relatedPostIds: ['post-2515', 'post-2492', 'post-888'],
  editorial: {
    status: 'published',
    updatedAt: '2026-10-09T00:00:00+07:00',
    revision: 1,
    publishedAt: '2026-10-09T00:00:00+07:00',
  },
  seo: {
    title: `Bài viết Mock Mở Rộng ${mockPostSearchToken} - Sova`,
    canonicalPath: mockPostPath,
    description: `Mô tả bài viết mock mở rộng chứa mã độc nhất ${mockPostSearchToken}.`,
  },
  sources: [{ file: 'mock/post.html', line: 1, sourceId: 'mock-post' }],
  thumbnailId: 'asset-4c87ea5453',
  featuredImageId: 'asset-4c87ea5453',
  publishedAt: '2026-10-09T00:00:00+07:00',
  modifiedAt: '2026-10-09T00:00:00+07:00',
  displayDate: 'Tháng 10 9, 2026',
};

const mockProjectRoute: RouteEntry = {
  id: mockProjectRouteId,
  locale: 'vi',
  path: mockProjectPath,
  kind: 'project-detail',
  entityId: mockProjectId,
  aliases: [],
  source: { file: 'mock/project.html', line: 1 },
};

const mockPostRoute: RouteEntry = {
  id: mockPostRouteId,
  locale: 'vi',
  path: mockPostPath,
  kind: 'post-detail',
  entityId: mockPostId,
  aliases: [],
  source: { file: 'mock/post.html', line: 1 },
};

const mockOverflowPosts: Post[] = [1, 2, 3, 4].map((i) => ({
  ...mockPost,
  id: `post-mock-extended-overflow-${i}`,
  slug: `bai-viet-mock-mo-rong-overflow-${i}`,
  path: `/bai-viet-mock-mo-rong-overflow-${i}/` as PublicPath,
  title: `Bài viết Mock Mở Rộng Overflow ${i}`,
  categoryIds: ['post-category-goc-nhin-website'],
  excerpt: `Đoạn trích dẫn bài viết mock overflow ${i}.`,
  body: {
    format: 'sanitized-html',
    html: `<p>Nội dung chi tiết bài viết mock overflow ${i}.</p>`,
    assetIds: [],
    sources: [{ file: 'mock/post.html', line: 1 }],
  },
  sources: [{ file: 'mock/post.html', line: 1, sourceId: `mock-post-overflow-${i}` }],
  seo: {
    ...mockPost.seo,
    title: `Bài viết Mock Mở Rộng Overflow ${i} - Sova`,
    description: `Mô tả bài viết mock overflow ${i}.`,
    canonicalPath: `/bai-viet-mock-mo-rong-overflow-${i}/` as PublicPath,
  },
}));

const mockOverflowRoutes: RouteEntry[] = mockOverflowPosts.map((p) => ({
  id: `route-${p.slug}`,
  locale: 'vi',
  path: p.path,
  kind: 'post-detail',
  entityId: p.id,
  aliases: [],
  source: { file: 'mock/post.html', line: 1 },
}));

export const mockGocNhinPage6Route: RouteEntry = {
  id: 'route-goc-nhin--page--6',
  locale: 'vi',
  path: '/goc-nhin/page/6/',
  kind: 'post-list',
  aliases: [],
  source: { file: 'mock/extended.html', line: 1 },
};

export const extendedMockPosts = [mockPost, ...mockOverflowPosts];

export function withRecords(
  base: ContentData,
  records: {
    projects?: Project[];
    posts?: Post[];
    routes?: RouteEntry[];
  },
): ContentData {
  const mergedProjects = records.projects ? [...base.projects, ...records.projects] : base.projects;
  const mergedPosts = records.posts ? [...base.posts, ...records.posts] : base.posts;
  const mergedRoutes = records.routes ? [...base.routes, ...records.routes] : base.routes;

  validateRoutes(mergedRoutes, {
    postSlugs: mergedPosts.map((p) => p.slug),
    projectSlugs: mergedProjects.map((p) => p.slug),
  });

  return {
    ...base,
    projects: mergedProjects,
    posts: mergedPosts,
    routes: mergedRoutes,
  };
}

// Built on demand so production, which ignores CONTENT_SCENARIO, never runs the merge.
export const buildExtendedFixtures = (): ContentData =>
  withRecords(defaultContentData, {
    projects: [mockProject],
    posts: [mockPost, ...mockOverflowPosts],
    routes: [mockProjectRoute, mockPostRoute, ...mockOverflowRoutes, mockGocNhinPage6Route],
  });
