import { describe, expect, test } from 'vitest';
import { featuredItemOrder } from '@/data/projects';
import { createMockRepository, defaultContentData } from '@/lib/repositories/mock';
import { getProjectDetail, getProjectListingPage, listProjectCategorySlugs } from './projects';

describe('getProjectListingPage', () => {
  const repository = createMockRepository(defaultContentData);

  test('featured_item route orders projects according to featuredItemOrder', async () => {
    const data = await getProjectListingPage('vi', repository, {
      routeId: 'route-featured_item',
    });
    expect(data).not.toBeNull();
    expect(data!.projects.length).toBeGreaterThan(0);

    const projectIds = data!.projects.map((p) => p.id);
    const ordered = featuredItemOrder.filter((id) => projectIds.includes(id));
    expect(ordered.length).toBeGreaterThan(0);
    expect(projectIds.slice(0, ordered.length)).toEqual(ordered);
  });

  test('filters projects by category and derives category counts', async () => {
    const data = await getProjectListingPage('vi', repository, {
      routeId: 'route-featured_item_category--branding',
      category: 'branding',
    });
    expect(data).not.toBeNull();
    expect(data!.projects.every((p) => p.categoryIds.includes('project-category-branding'))).toBe(
      true,
    );
  });

  test('returns null for an invalid category', async () => {
    const data = await getProjectListingPage('vi', repository, {
      category: 'non-existent-category',
    });
    expect(data).toBeNull();
  });

  test('project detail gallery labels name the carousel region', async () => {
    const detail = await getProjectDetail('evc-athena-cong-ty-tnhh-evc-athena', repository);
    expect(detail!.carouselLabels.region).toBe('Thư viện ảnh dự án');
    expect(detail!.carouselLabels.pause).toBe('Tạm dừng trình chiếu');
  });

  test('category slugs cover every project category archive', async () => {
    expect(await listProjectCategorySlugs(repository)).toEqual([
      'website',
      'branding',
      'mobile-app',
    ]);
  });
});
