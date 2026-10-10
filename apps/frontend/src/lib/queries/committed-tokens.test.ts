// DW3: every repository-backed query over the committed data returns resolved copy.
import { expect, test, vi } from 'vitest';
import type { ContentRepository } from '@/lib/repositories/contracts';
import { createMockRepository, mockRepository } from '@/lib/repositories/mock';
import { utilityContent } from '@/data/content';
import { faqs } from '@/data/faq';
import { listingSettings, listingSnapshots } from '@/data/listings';
import { legalPages } from '@/data/pages/legal';
import { posts } from '@/data/posts';
import { projects } from '@/data/projects';
import { routes } from '@/data/routes';
import { siteSettings } from '@/data/site';
import { emailPricing } from '@/data/pricing/email';
import { hostingPricing } from '@/data/pricing/hosting';
import { vpsPricing } from '@/data/pricing/vps';
import { websitePricing } from '@/data/pricing/website';
import { stats } from '@/data/stats';
import { partners } from '@/data/partners';
import { testimonials } from '@/data/testimonials';
import { assets } from '@/data/assets';
import type { ContentData } from '@/lib/repositories/contracts';
import type { Locale, ServiceKey } from '@/types/content';
import { getAssets } from './assets';
import { getFAQs, getFAQTopics } from './faq';
import {
  getAboutPage,
  getContactPage,
  getFAQPage,
  getHomePage,
  getLegalPage,
  getListingSettings,
  getListingSnapshot,
  getPaymentGuide,
  getProfile,
  getUtilityContent,
} from './pages';
import { getNavigation, getShellContent, getSiteSettings } from './site';
import { getPricing, getService, getServicePage } from './services';
import { getPartners, getStats, getTestimonials } from './social-proof';

let repository: ContentRepository = mockRepository;
vi.mock('@/lib/repositories', () => ({ getRepository: () => repository }));

const KEYS: ServiceKey[] = [
  'website',
  'mobile',
  'seo',
  'branding',
  'storage',
  'email',
  'hosting',
  'vps',
];
const ALL = { page: 1, pageSize: Number.MAX_SAFE_INTEGER };
const pricing = [...websitePricing, ...emailPricing, ...hostingPricing, ...vpsPricing];

test.each<Locale>(['vi', 'en'])('no %s query result contains {{site.', async (locale) => {
  repository = mockRepository;
  const results = await Promise.all([
    getSiteSettings(locale),
    getNavigation(locale),
    getShellContent(locale),
    ...KEYS.flatMap((key) => [getService(key, locale), getServicePage(key, locale)]),
    ...pricing.map((p) => getPricing(p.id, locale)),
    ...projects.map((p) => repository.getProject(p.slug)),
    repository.listProjects(ALL),
    ...posts.map((p) => repository.getPost(p.slug)),
    repository.listPosts({ locale, ...ALL }),
    getFAQs(
      faqs.map((f) => f.id),
      locale,
    ),
    getFAQTopics(locale),
    getTestimonials(
      testimonials.map((t) => t.id),
      locale,
    ),
    getPartners(partners.map((p) => p.id)),
    getStats(stats.map((s) => s.id)),
    getAssets(assets.map((a) => a.id)),
    getHomePage(locale),
    getAboutPage(locale),
    getContactPage(locale),
    getProfile(locale),
    getFAQPage(locale),
    ...legalPages.map((p) => getLegalPage(p.path, locale)),
    getPaymentGuide(locale),
    ...listingSettings.map((l) => getListingSettings(l.routeId)),
    ...listingSnapshots.map((s) => getListingSnapshot(s.routeId, s.page)),
    ...utilityContent.map((c) => getUtilityContent(c.id)),
  ]);
  expect(results.filter((r) => JSON.stringify(r ?? null).includes('{{site.'))).toEqual([]);
});

test('a planted unknown key stays literal; known keys beside it resolve', async () => {
  repository = createMockRepository({
    siteSettings,
    routes,
    utilityContent: [
      {
        id: 'utility-x',
        body: { ...utilityContent[0].body, html: '<p>{{site.nope}} {{site.email}}</p>' },
      },
    ],
  } as unknown as ContentData);
  const vi = siteSettings.find((s) => s.locale === 'vi')!;
  expect((await getUtilityContent('utility-x'))?.body.html).toBe(
    `<p>{{site.nope}} ${vi.email}</p>`,
  );
});

test('every listing snapshot is reachable by its registry route id', async () => {
  repository = mockRepository;
  const routeIds = new Set(routes.map((r) => r.id));
  for (const snapshot of listingSnapshots) {
    expect(routeIds).toContain(snapshot.routeId);
    expect(await getListingSnapshot(snapshot.routeId, snapshot.page)).toEqual(snapshot);
  }
  for (const project of projects.filter((p) => p.deliveryTermsId))
    expect(await getUtilityContent(project.deliveryTermsId!)).not.toBeNull();
});
