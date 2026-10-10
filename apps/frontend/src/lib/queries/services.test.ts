import { expect, test, vi } from 'vitest';
import type { ContentData, ContentRepository } from '@/lib/repositories/contracts';
import { createMockRepository } from '@/lib/repositories/mock';
import { assets } from '@/data/assets';
import { faqs } from '@/data/faq';
import { hostingPricing } from '@/data/pricing/hosting';
import { websitePricing } from '@/data/pricing/website';
import { projectCategories } from '@/data/project-categories';
import { projects } from '@/data/projects';
import { hostingServices } from '@/data/services/hosting';
import { seoServices } from '@/data/services/seo';
import { websiteServices } from '@/data/services/website';
import { testimonials } from '@/data/testimonials';
import type { Pricing, SiteSettings } from '@/types/content';
import { getPricing, getServiceAssets, getServicePage } from './services';

let repository: ContentRepository;
vi.mock('@/lib/repositories', () => ({ getRepository: () => repository }));

const settings: SiteSettings = {
  locale: 'vi',
  companyName: 'Test',
  wordmark: 'Test',
  address: 'Test address',
  phones: [{ label: '0000 000 000', href: 'tel:0000000000' }],
  email: 'hi@example.com',
  socialLinks: [],
  messengerHref: 'https://example.com/messenger',
  zaloHref: 'https://example.com/zalo?a=1&b=2',
  mapEmbedUrl: '',
  logoIds: [],
};

// The committed import output, with optional overrides of one domain.
const repoWith = (data: Partial<ContentData> = {}) =>
  createMockRepository({
    services: [...websiteServices, ...seoServices, ...hostingServices],
    assets,
    faqs,
    testimonials,
    projects,
    projectCategories,
    pricing: [...websitePricing, ...hostingPricing],
    siteSettings: [settings],
    ...data,
  } as unknown as ContentData);

test('service page query: FAQs in placement order, 3 testimonials, 6 projects, pricing, no tokens', async () => {
  repository = repoWith();
  const page = await getServicePage('website', 'vi');
  const service = websiteServices.find((s) => s.locale === 'vi')!;
  expect(page?.service.id).toBe('service-website-vi');
  expect(page?.faqs.map((f) => f.id)).toEqual(
    [...service.faqs].sort((a, b) => a.order - b.order).map((p) => p.faqId),
  );
  expect(page?.testimonials).toHaveLength(3);
  expect(page?.projects.map((p) => p.id)).toEqual(service.featuredProjectIds);
  expect(page?.projects).toHaveLength(6);
  expect(page?.pricing?.id).toBe('pricing-website');
  expect(JSON.stringify(page)).not.toContain('{{site.');
});

test('getServiceAssets: VI website returns 6 project assets + categories, EN returns empty without calls', async () => {
  repository = repoWith();
  const viPage = await getServicePage('website', 'vi');
  expect(viPage).not.toBeNull();
  const viAssets = await getServiceAssets(viPage!);
  expect(viAssets.projectAssets).toHaveLength(6);
  expect(viAssets.projectAssets.map((a) => a.id)).toEqual(
    viPage!.projects.map((p) => p.galleryIds[0]),
  );
  expect(viAssets.projectCategories.map((c) => c.id)).toEqual(projectCategories.map((c) => c.id));

  const enPage = await getServicePage('website', 'en');
  expect(enPage).not.toBeNull();
  expect(enPage!.projects).toHaveLength(0);

  const getAssetsSpy = vi.spyOn(repository, 'getAssets');
  const getCategoriesSpy = vi.spyOn(repository, 'getProjectCategories');

  const enAssets = await getServiceAssets(enPage!);
  expect(enAssets.projectAssets).toHaveLength(0);
  expect(enAssets.projectCategories).toHaveLength(0);
  expect(getCategoriesSpy).not.toHaveBeenCalled();
  const requestedAssetIds = getAssetsSpy.mock.calls.flat(2);
  for (const asset of viAssets.projectAssets) {
    expect(requestedAssetIds).not.toContain(asset.id);
  }
});

test('missing service resolves null', async () => {
  repository = repoWith({ services: [] });
  expect(await getServicePage('website', 'vi')).toBeNull();
});

test('A05: the SEO placement shows its source revision', async () => {
  repository = repoWith();
  const page = await getServicePage('seo', 'vi');
  const placement = page!.service.faqs.find((p) => p.sourceRevisionId)!;
  const faq = page!.faqs.find((f) => f.id === placement.faqId)!;
  expect(faq.answer.html).toBe(faqs.find((f) => f.id === faq.id)!.sourceRevisions![0].answer.html);
});

test('shared change: an edited hosting price and shared FAQ answer reach every page using them', async () => {
  const [vi, ...rest] = hostingPricing.filter((p) => p.locale === 'vi');
  const edited: Pricing = {
    ...vi,
    plans: vi.plans.map((plan, i) =>
      i === 0 ? { ...plan, price: { ...plan.price!, amount: 1, displayText: '1 VNĐ' } } : plan,
    ),
  };
  // No source FAQ sits on two service pages, so the website page also places a hosting FAQ.
  const faqId = hostingServices[0].faqs[0].faqId;
  const website = websiteServices.find((s) => s.locale === 'vi')!;
  repository = repoWith({
    services: [
      { ...website, faqs: [...website.faqs, { faqId, order: website.faqs.length + 1 }] },
      ...hostingServices,
    ],
    pricing: [
      ...websitePricing,
      edited,
      ...rest,
      ...hostingPricing.filter((p) => p.locale === 'en'),
    ],
    faqs: faqs.map((f) =>
      f.id === faqId ? { ...f, answer: { ...f.answer, html: '<p>Changed</p>' } } : f,
    ),
  });
  const hosting = await getServicePage('hosting', 'vi');
  const web = await getServicePage('website', 'vi');
  expect(hosting?.pricing?.plans[0].price?.displayText).toBe('1 VNĐ');
  for (const page of [hosting, web])
    expect(page?.faqs.find((f) => f.id === faqId)?.answer.html).toBe('<p>Changed</p>');
});

test('dangling FAQ, testimonial, project or pricing ids throw naming the service and ids', async () => {
  const website = websiteServices.find((s) => s.locale === 'vi')!;
  repository = repoWith({
    services: [
      {
        ...website,
        faqs: [...website.faqs, { faqId: 'faq-gone', order: 99 }],
        testimonialIds: ['testimonial-gone'],
        featuredProjectIds: ['project-gone'],
        pricingId: 'pricing-gone',
      },
    ],
  });
  await expect(getServicePage('website', 'vi')).rejects.toThrow(
    'service-website-vi references missing ids: faq-gone, testimonial-gone, project-gone, pricing-gone',
  );
});

test('contact in CTA: the pricing Zalo token resolves to SiteSettings.zaloHref; unknown stays', async () => {
  const [vi] = hostingPricing.filter((p) => p.locale === 'vi');
  expect(vi.plans[0].cta.href).toBe('{{site.zaloHref}}');
  repository = repoWith({
    pricing: [{ ...vi, heading: 'Gọi {{site.unknown}}' }],
  });
  const page = await getServicePage('hosting', 'vi');
  expect(page?.pricing?.plans.map((p) => p.cta.href)).toEqual(
    vi.plans.map(() => 'https://example.com/zalo?a=1&b=2'),
  );
  expect(page?.pricing?.heading).toBe('Gọi {{site.unknown}}');
  expect((await getPricing(vi.id, 'vi'))?.plans[0].cta.href).toBe(
    'https://example.com/zalo?a=1&b=2',
  );
});
