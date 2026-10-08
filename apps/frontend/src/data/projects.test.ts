// Guards the committed importer output (the importer itself cannot run in CI).
import { expect, test } from 'vitest';
import { BRAND_LEAK_RE } from '@/lib/content/brand';
import { SCRUB_RULES } from '@/lib/content/scrub';
import { createMockRepository, defaultContentData } from '@/lib/repositories/mock';
import type { ContentData } from '@/lib/repositories/contracts';
import { assets } from './assets';
import { utilityContent } from './content';
import { listingSettings } from './listings';
import { projectCategories } from './project-categories';
import { featuredItemOrder, projects } from './projects';

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
  // Source refs are provenance, not text (the thank-you page's mirror folder keeps the brand).
  const text = JSON.stringify({ projects, projectCategories, utilityContent }, (key, value) =>
    key === 'sources' ? undefined : value,
  );
  expect([...text.matchAll(BRAND_LEAK_RE)].map((m) => m[0])).toEqual([]);
  for (const [pattern] of SCRUB_RULES) expect(text.match(pattern)).toBeNull();
});

test('getProjectCategories returns all project categories', async () => {
  const repo = createMockRepository({ projectCategories } as unknown as ContentData);
  const categories = await repo.getProjectCategories();
  expect(categories).toEqual(projectCategories);
});

test('getProjectListingPage returns locale projects, categories with derived counts, and copy', async () => {
  const { getProjectListingPage } = await import('@/lib/queries/projects');
  const repo = createMockRepository({
    projects,
    projectCategories,
    assets: [],
    listingSettings: [
      {
        routeId: 'route-du-an',
        heading: { title: 'Dự án' },
      },
      {
        routeId: 'route-en--our-project',
        heading: { title: 'Projects' },
      },
    ],
  } as unknown as ContentData);

  const viData = await getProjectListingPage('vi', repo);
  expect(viData.locale).toBe('vi');
  expect(viData.projects).toHaveLength(62);
  expect(viData.copy.filterAll).toBe('Tất cả');
  expect(viData.categories.find((c) => c.slug === 'website')?.count).toBe(59);
  expect(viData.categories.find((c) => c.slug === 'branding')?.count).toBe(2);
  expect(viData.categories.find((c) => c.slug === 'mobile-app')?.count).toBe(1);

  const enData = await getProjectListingPage('en', repo);
  expect(enData.locale).toBe('en');
  expect(enData.projects).toHaveLength(0);
  expect(enData.copy.filterAll).toBe('All');
  expect(enData.categories.every((c) => c.count === 0)).toBe(true);
});

test('getProjectListingPage serves featured archives: 62 all, 59/2/1 by category, THP branding', async () => {
  const { getProjectListingPage } = await import('@/lib/queries/projects');
  const repo = createMockRepository({
    projects,
    projectCategories,
    assets,
    listingSettings,
  } as unknown as ContentData);

  const archive = await getProjectListingPage('vi', repo, { routeId: 'route-featured_item' });
  expect(archive.projects).toHaveLength(62);
  expect(archive.settings?.heading.title).toBe('Công ty Cổ phần Phát triển Công nghệ THP');
  expect(archive.heroImage).not.toBeNull();
  expect(archive.bgImage).not.toBeNull();

  const expected = {
    website: [59, 'Website'],
    branding: [2, 'Branding'],
    'mobile-app': [1, 'Mobile App'],
  };
  for (const [slug, [count, title]] of Object.entries(expected)) {
    const data = await getProjectListingPage('vi', repo, {
      routeId: `route-featured_item_category--${slug}`,
      category: slug,
    });
    expect(
      data.projects.map((p) => p.id),
      slug,
    ).toEqual(idsIn(slug));
    expect(data.projects).toHaveLength(count as number);
    expect(data.settings?.heading.title).toBe(title);
    expect(data.categories.find((c) => c.slug === slug)?.count).toBe(count);
    expect(data.thumbnailAssets).toHaveLength(count as number);
  }
  const branding = await getProjectListingPage('vi', repo, { category: 'branding' });
  expect(branding.projects.map((p) => p.id)).toContain('project-2348');

  const unknown = await getProjectListingPage('vi', repo, { category: 'nope' });
  expect(unknown.projects).toHaveLength(0);

  // du-an default is unchanged.
  const duAn = await getProjectListingPage('vi', repo);
  expect(duAn.settings?.routeId).toBe('route-du-an');
  expect(duAn.projects).toHaveLength(62);
});

test('every listing hero asset id resolves to a committed asset', () => {
  for (const { routeId, hero } of listingSettings)
    for (const id of [hero?.imageId, hero?.bgImageId, hero?.videoId].filter(Boolean))
      expect(assetById.has(id!), `${routeId} ${id}`).toBe(true);
});

test('getProjectListingPage resolves both listing hero images from committed data', async () => {
  const { getProjectListingPage } = await import('@/lib/queries/projects');
  const repo = createMockRepository(defaultContentData);
  for (const locale of ['vi', 'en'] as const) {
    const data = await getProjectListingPage(locale, repo);
    expect(data.heroImage?.id, locale).toBe(data.settings?.hero?.imageId);
    expect(data.bgImage?.id, locale).toBe(data.settings?.hero?.bgImageId);
    expect(data.heroImage).not.toBeNull();
    expect(data.bgImage).not.toBeNull();
  }
});

test('featuredItemOrder has 62 unique project ids in source archive order (STORMICK 19th, Dsmart 23rd)', () => {
  expect(featuredItemOrder).toHaveLength(62);
  expect(new Set(featuredItemOrder).size).toBe(62);

  const projectIds = new Set(projects.map((p) => p.id));
  for (const id of featuredItemOrder) {
    expect(projectIds).toContain(id);
  }

  // Source archive order: 19th is STORMICK (project-565), 23rd is Dsmart (project-585)
  expect(featuredItemOrder[18]).toBe('project-565');
  const stormick = projects.find((p) => p.id === 'project-565');
  expect(stormick?.slug).toBe('stormick-cong-ty-tnhh-storm-entertaiment');

  expect(featuredItemOrder[22]).toBe('project-585');
  const dsmart = projects.find((p) => p.id === 'project-585');
  expect(dsmart?.slug).toBe('giao-dien-dsmart-giai-phap-dieu-khien-xe-hoi-tren-smartphone');
});

