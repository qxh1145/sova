import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from 'vitest';
import { createAssetRegistry } from './assets';
import { importProjects } from './projects';

const COUNTS = { website: 59, branding: 2, 'mobile-app': 1 } as const;

/** Minimal mirror with 59/2/1 cards; `overrides` changes one detail page's parts. */
function mirror(
  overrides: Record<
    string,
    {
      category?: string;
      terms?: string;
      related?: string;
      date?: string;
      sidebar?: string;
      gallery?: string;
    }
  > = {},
) {
  const dir = mkdtempSync(path.join(tmpdir(), 'projects-mirror-'));
  const write = (file: string, html: string) => {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), html);
  };
  write(
    'du-an/index.html',
    `<div class="filter-nav">${Object.keys(COUNTS)
      .map((s) => `<a href="index.html" data-term="${s}">${s}</a>`)
      .join('')}</div>`,
  );
  for (const [category, count] of Object.entries(COUNTS)) {
    const slugs = Array.from({ length: count }, (_, i) => `${category}-${i}`);
    write(
      `featured_item_category/${category}/index.html`,
      slugs
        .map(
          (s) =>
            `<div class="col" data-terms='["x"]'><a href="../../featured_item/${s}/index.html">${s}</a></div>`,
        )
        .join(''),
    );
    slugs.forEach((slug, i) => {
      const o = overrides[slug] ?? {};
      write(
        `featured_item/${slug}/index.html`,
        `<html><body class="postid-${category.length * 100 + i} featured-item-category-${o.category ?? category}">` +
          `<h1 class="entry-title">${slug}</h1>` +
          (o.gallery ? `<div class="slider-wrapper relative" id="slider-duan">${o.gallery}</div>` : '') +
          `<div class="qodef-portfolio-content"><p>${o.terms ?? 'Terms'}</p></div>` +
          (o.date ? `<div class="qodef-e qodef-info--date">${o.date}</div>` : '') +
          (o.sidebar
            ? `<div class="col large-3 small-12"><div class="col-inner"><h3>Thông tin dự án</h3>${o.sidebar}</div></div>`
            : '') +
          `<div class="portfolio-related">${o.related ? `<a href="${o.related}"><div class="portfolio-box"></div></a>` : ''}</div>` +
          `</body></html>`,
      );
    });
  }
  return dir;
}

const run = (dir: string) => {
  const stats = { brand: 0, scrub: 0 };
  return importProjects(dir, createAssetRegistry(dir, stats), stats);
};

test('a fixture mirror imports 62 projects in website, branding, mobile-app order', () => {
  const { projects, terms } = run(mirror());
  expect(projects).toHaveLength(62);
  expect(projects.map((p) => p.slug).slice(57, 62)).toEqual([
    'website-57',
    'website-58',
    'branding-0',
    'branding-1',
    'mobile-app-0',
  ]);
  expect(terms).toHaveLength(1);
});

test('source drift: card count, body category, related href and a 3rd terms variant throw', () => {
  const dir = mirror();
  writeFileSync(path.join(dir, 'featured_item_category/branding/index.html'), '');
  expect(() => run(dir)).toThrow(/Source drift: .*branding.* has 0 cards, expected 2/);
  expect(() => run(mirror({ 'website-3': { category: 'branding' } }))).toThrow(
    /Source drift: featured_item\/website-3\/index.html body says branding, listing says website/,
  );
  expect(() =>
    run(mirror({ 'website-0': { related: '../../featured_item/nope/index.html' } })),
  ).toThrow(/Source drift: .* is not a project folder/);
  const gone = mirror();
  writeFileSync(
    path.join(gone, 'featured_item_category/mobile-app/index.html'),
    `<div class="col" data-terms='["x"]'><a href="../../featured_item/gone/index.html">x</a></div>`,
  );
  expect(() => run(gone)).toThrow(
    /Source drift: featured_item_category\/mobile-app\/index.html: ..\/..\/featured_item\/gone\/index.html has no project folder/,
  );
  expect(() =>
    run(mirror({ 'website-1': { terms: 'Variant 2' }, 'website-2': { terms: 'Variant 3' } })),
  ).toThrow(/Source drift: featured_item\/website-2\/index.html has terms variant 3/);
});

test('date markup variants and sidebar excerpt import as displayDate, displayDateMarkup and summary', () => {
  const { projects } = run(
    mirror({
      'website-0': {
        date: '<h3 class="qodef-e-title">DATE: 24 Tháng Bảy, 2022</h3>',
        sidebar: '\n  HÌNH THỨC THANH TOÁN:\n » Lần 1 trong...  ',
      },
      'website-1': {
        date: '<p class="qodef-e-title">DATE:</p><p class="entry-date updated">24 Tháng Bảy, 2022</p>',
      },
      'website-2': { date: '<p class="qodef-e-title">DATE:</p>\nNgày 22 tháng 4 năm 2023\n' },
    }),
  );
  const pick = (slug: string) => {
    const p = projects.find((x) => x.slug === slug)!;
    return [p.displayDate, p.displayDateMarkup, p.summary];
  };
  expect(pick('website-0')).toEqual([
    '24 Tháng Bảy, 2022',
    'heading',
    'HÌNH THỨC THANH TOÁN: » Lần 1 trong...',
  ]);
  expect(pick('website-1')).toEqual(['24 Tháng Bảy, 2022', 'entry-date', undefined]);
  expect(pick('website-2')).toEqual(['Ngày 22 tháng 4 năm 2023', 'text', undefined]);
  expect(pick('website-3')).toEqual([undefined, undefined, undefined]);
});

test('galleryLayout imports as slider or row based on #slider-duan markup', () => {
  const { projects } = run(
    mirror({
      'website-0': {
        gallery: '<div class="slider slider-nav-circle"><div class="img col"><img src="1.jpg"></div></div>',
      },
      'website-1': {
        gallery: '<div class="row"><div class="col large-12"><img src="1.jpg"></div></div>',
      },
      'website-2': {
        gallery: '<div class="row"></div>',
      },
    }),
  );
  expect(projects.find((p) => p.slug === 'website-0')?.galleryLayout).toBe('slider');
  expect(projects.find((p) => p.slug === 'website-1')?.galleryLayout).toBe('row');
  expect(projects.find((p) => p.slug === 'website-2')?.galleryLayout).toBe('row');
  expect(projects.find((p) => p.slug === 'website-3')?.galleryLayout).toBeUndefined();
});
