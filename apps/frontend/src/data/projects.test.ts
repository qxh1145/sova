// Guards the committed importer output (the importer itself cannot run in CI).
import { expect, test } from 'vitest';
import { BRAND_LEAK_RE } from '@/lib/content/brand';
import { SCRUB_RULES } from '@/lib/content/scrub';
import { createMockRepository } from '@/lib/repositories/mock';
import type { ContentData } from '@/lib/repositories/contracts';
import { assets } from './assets';
import { utilityContent } from './content';
import { projectCategories } from './project-categories';
import { projects } from './projects';

const PAGE_SIZE = 6;
const assetById = new Map(assets.map((a) => [a.id, a]));
const idsIn = (slug: string) =>
  projects.filter((p) => p.categoryIds.includes(`project-category-${slug}`)).map((p) => p.id);

test('62 VI projects: website 59, branding 2, mobile-app 1; THP is branding', () => {
  expect(projects).toHaveLength(62);
  expect(projects.every((p) => p.locale === 'vi')).toBe(true);
  expect(Object.fromEntries(projectCategories.map((c) => [c.slug, idsIn(c.slug).length]))).toEqual({
    website: 59,
    branding: 2,
    'mobile-app': 1,
  });
  expect(
    projects.find((p) => p.slug === 'cong-ty-co-phan-phat-trien-cong-nghe-thp')?.categoryIds,
  ).toEqual(['project-category-branding']);
});

test('ids are unique and every record keeps its source', () => {
  const ids = [...projects, ...projectCategories, ...utilityContent].map((r) => r.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const record of [...projects, ...projectCategories, ...assets])
    expect(record.sources.length).toBeGreaterThan(0);
  for (const { body } of utilityContent) expect(body.sources.length).toBeGreaterThan(0);
});

test('category, related and delivery-terms ids resolve', () => {
  const categoryIds = new Set(projectCategories.map((c) => c.id));
  const projectIds = new Set(projects.map((p) => p.id));
  const termsIds = new Set(utilityContent.map((t) => t.id));
  for (const project of projects) {
    expect(project.categoryIds.length).toBeGreaterThan(0);
    for (const id of project.categoryIds) expect(categoryIds).toContain(id);
    for (const id of project.relatedProjectIds) expect(projectIds).toContain(id);
    expect(termsIds).toContain(project.deliveryTermsId);
    expect(project.body.html).toBe('');
  }
});

test('listProjects returns 6 per page in source order, overall and per category', async () => {
  const repo = createMockRepository({ projects, projectCategories } as unknown as ContentData);
  // Source order: the website listing's cards, then branding, then mobile-app.
  const expected: Record<string, string[]> = {
    '': [...idsIn('website'), ...idsIn('branding'), ...idsIn('mobile-app')],
  };
  for (const c of projectCategories) expected[c.slug] = idsIn(c.slug);
  for (const [category, ids] of Object.entries(expected)) {
    for (let page = 1; (page - 1) * PAGE_SIZE < ids.length; page++) {
      const result = await repo.listProjects({
        category: category || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      expect(
        result.items.map((p) => p.id),
        `${category || 'all'} page ${page}`,
      ).toEqual(ids.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
      expect(result.total).toBe(ids.length);
    }
  }
});

test('every project image resolves to a local /wp-content/uploads/ or missing asset', () => {
  for (const project of projects) {
    const ids = [
      project.thumbnailId,
      project.heroImageId,
      project.seo.imageId,
      ...project.galleryIds,
    ];
    for (const id of ids.filter(Boolean)) {
      const asset = assetById.get(id!);
      expect(asset, `${project.id} ${id}`).toBeDefined();
      if (asset!.status === 'local')
        expect(asset!.src.startsWith('/wp-content/uploads/')).toBe(true);
      else expect(asset!.status).toBe('missing');
    }
  }
  expect(projects.flatMap((p) => p.galleryIds)).toHaveLength(136);
});

test('gallery shapes 0–4 and the 7 pages without a display date', () => {
  const sizes = projects.map((p) => p.galleryIds.length);
  expect(Math.max(...sizes)).toBe(4);
  expect(sizes.filter((n) => n === 0)).toHaveLength(4);
  expect(sizes.filter((n) => n === 1)).toHaveLength(8);
  expect(projects.filter((p) => !p.displayDate)).toHaveLength(7);
});

test('no Eras word or raw Eras contact value in project, category and terms text', () => {
  const text = JSON.stringify({ projects, projectCategories, utilityContent });
  expect([...text.matchAll(BRAND_LEAK_RE)].map((m) => m[0])).toEqual([]);
  for (const [pattern] of SCRUB_RULES) expect(text.match(pattern)).toBeNull();
});
