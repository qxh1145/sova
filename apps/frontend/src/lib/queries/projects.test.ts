import { describe, expect, test } from 'vitest';
import { featuredItemOrder } from '@/data/projects';
import { createMockRepository, defaultContentData } from '@/lib/repositories/mock';
import { getProjectListingPage } from './projects';

describe('getProjectListingPage', () => {
  const repository = createMockRepository(defaultContentData);

  test('featured_item route orders projects according to featuredItemOrder', async () => {
    const data = await getProjectListingPage('vi', repository, {
      routeId: 'route-featured_item',
    });
    expect(data).not.toBeNull();
    expect(data!.projects.length).toBeGreaterThan(0);

    const orderMap = new Map(featuredItemOrder.map((id, idx) => [id, idx]));
    const projectIds = data!.projects.map((p) => p.id);
    const expectedIds = [...projectIds].sort(
      (a, b) => (orderMap.get(a) ?? 999) - (orderMap.get(b) ?? 999),
    );
    expect(projectIds).toEqual(expectedIds);
  });

  test('filters projects by category and derives category counts', async () => {
    const data = await getProjectListingPage('vi', repository, {
      routeId: 'route-featured_item_category--branding',
      category: 'branding',
    });
    expect(data).not.toBeNull();
    expect(data!.projects.every((p) => p.categoryIds.includes('project-category-branding'))).toBe(true);
  });

  test('returns null for an invalid category', async () => {
    const data = await getProjectListingPage('vi', repository, {
      category: 'non-existent-category',
    });
    expect(data).toBeNull();
  });
});
