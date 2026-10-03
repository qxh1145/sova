import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { getRepository } from '@/lib/repositories';
import { getAssets } from '@/lib/queries/assets';
import { getFAQs } from '@/lib/queries/faq';
import {
  getAboutPage,
  getContactPage,
  getHomePage,
  getLegalPage,
  getListingSettings,
  getProfile,
} from '@/lib/queries/pages';
import { getPost, listPosts } from '@/lib/queries/posts';
import { getProject, listProjects } from '@/lib/queries/projects';
import { getNavigation, getSiteSettings, listRoutes } from '@/lib/queries/site';
import { getPricing, getService } from '@/lib/queries/services';
import { getPartners, getStats, getTestimonials } from '@/lib/queries/social-proof';
import type { PageResult } from '@/types/content';
import { scenarioNames } from './scenarios';

type Shape = 'shell' | 'single' | 'list' | 'page';

// Every query, called with keys that exist in the fixtures, and the fixture id(s) it must return
// (routeId/locale for id-less records).
const queries: [
  name: string,
  shape: Shape,
  expected: string | string[],
  run: () => Promise<unknown>,
][] = [
  ['getSiteSettings', 'shell', 'vi', () => getSiteSettings('vi')],
  ['getNavigation', 'shell', 'vi', () => getNavigation('vi')],
  ['listRoutes', 'list', ['route-1'], () => listRoutes()],
  ['getService', 'single', 'service-1', () => getService('website', 'vi')],
  ['getPricing', 'single', 'pricing-1', () => getPricing('pricing-1', 'vi')],
  ['getProject', 'single', 'project-1', () => getProject('fixture-project')],
  [
    'listProjects',
    'page',
    ['project-1'],
    () => listProjects({ category: 'website', page: 1, pageSize: 10 }),
  ],
  ['getPost', 'single', 'post-1', () => getPost('fixture-post')],
  [
    'listPosts',
    'page',
    ['post-1'],
    () => listPosts({ locale: 'vi', category: 'fixture-category', page: 1, pageSize: 10 }),
  ],
  ['getFAQs', 'list', ['faq-1'], () => getFAQs(['faq-1'], 'vi')],
  ['getTestimonials', 'list', ['testimonial-1'], () => getTestimonials(['testimonial-1'], 'vi')],
  ['getPartners', 'list', ['partner-1'], () => getPartners(['partner-1'])],
  ['getStats', 'list', ['stat-1'], () => getStats(['stat-1'])],
  ['getAssets', 'list', ['asset-1'], () => getAssets(['asset-1'])],
  ['getHomePage', 'single', 'home-1', () => getHomePage('vi')],
  ['getAboutPage', 'single', 'about-1', () => getAboutPage('vi')],
  ['getContactPage', 'single', 'contact-1', () => getContactPage('vi')],
  ['getProfile', 'single', 'profile-1', () => getProfile('vi')],
  ['getLegalPage', 'single', 'legal-1', () => getLegalPage('/fixture-legal', 'vi')],
  ['getListingSettings', 'single', 'route-1', () => getListingSettings('route-1')],
];

type Identified = { id?: string; routeId?: string; locale?: string } | null;
const ident = (r: Identified) => r?.id ?? r?.routeId ?? r?.locale;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe.each(['happy-path', 'missing-media'])('%s scenario', (scenario) => {
  test.each(queries)('%s resolves fixture data', async (_, shape, expected, run) => {
    vi.stubEnv('CONTENT_SCENARIO', scenario);
    const result = await run();
    if (shape === 'list') expect((result as Identified[]).map(ident)).toEqual(expected);
    else if (shape === 'page')
      expect((result as PageResult<Identified>).items.map(ident)).toEqual(expected);
    else expect(ident(result as Identified)).toBe(expected);
  });
});

test('missing-media marks assets missing; happy-path keeps them local', async () => {
  vi.stubEnv('CONTENT_SCENARIO', 'missing-media');
  expect((await getAssets(['asset-1'])).map((a) => a.status)).toEqual(['missing']);
  vi.stubEnv('CONTENT_SCENARIO', 'happy-path');
  expect((await getAssets(['asset-1'])).map((a) => a.status)).toEqual(['local']);
});

describe('empty scenario', () => {
  test.each(queries)('%s returns empty', async (_, shape, __, run) => {
    vi.stubEnv('CONTENT_SCENARIO', 'empty');
    const result = await run();
    if (shape === 'shell') expect(result).not.toBeNull();
    else if (shape === 'list') expect(result).toEqual([]);
    else if (shape === 'page') expect((result as PageResult<unknown>).total).toBe(0);
    else expect(result).toBeNull();
  });
});

describe('error scenario', () => {
  test.each(queries)('%s rejects naming the method', async (name, _, __, run) => {
    vi.stubEnv('CONTENT_SCENARIO', 'error');
    await expect(run()).rejects.toThrow(new RegExp(`\\b${name}\\b`));
  });
});

test('missing key resolves null', async () => {
  vi.stubEnv('CONTENT_SCENARIO', 'happy-path');
  expect(await getService('vps', 'en')).toBeNull();
});

test('getFAQs preserves ids order and skips unknown ids', async () => {
  vi.stubEnv('CONTENT_SCENARIO', 'happy-path');
  expect((await getFAQs(['nope', 'faq-1'], 'vi')).map((f) => f.id)).toEqual(['faq-1']);
});

test('invalid page/pageSize returns no items', async () => {
  vi.stubEnv('CONTENT_SCENARIO', 'happy-path');
  for (const [page, pageSize] of [
    [-1, 10],
    [0, 10],
    [1.5, 10],
    [1, 0],
    [1, 2.5],
  ]) {
    const result = await listProjects({ page, pageSize });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(1);
  }
});

test('unknown scenario throws naming it', () => {
  vi.stubEnv('CONTENT_SCENARIO', 'foo');
  expect(() => getRepository()).toThrow(/"foo"/);
});

test('production ignores CONTENT_SCENARIO', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  for (const name of [...scenarioNames, 'foo']) {
    vi.stubEnv('CONTENT_SCENARIO', name);
    expect((await getSiteSettings('vi')).companyName).toBe('Sova');
  }
});

test('src/dev is imported only by lib/repositories/index.ts', () => {
  const src = join(__dirname, '..');
  const importers = readdirSync(src, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.tsx?$/.test(file) && !file.startsWith('dev/'))
    .filter((file) => /['"](@\/dev|(\.\.?\/)+dev)\//.test(readFileSync(join(src, file), 'utf8')));
  expect(importers).toEqual(['lib/repositories/index.ts']);
});
