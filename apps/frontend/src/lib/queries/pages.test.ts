import { expect, test, vi } from 'vitest';
import type { ContentData, ContentRepository } from '@/lib/repositories/contracts';
import { createMockRepository } from '@/lib/repositories/mock';
import { faqs } from '@/data/faq';
import { navigation } from '@/data/navigation';
import { contactPages } from '@/data/pages/contact';
import { homePages } from '@/data/pages/home';
import { legalPages, paymentGuides } from '@/data/pages/legal';
import { partners } from '@/data/partners';
import { posts } from '@/data/posts';
import { projects } from '@/data/projects';
import { websitePricing } from '@/data/pricing/website';
import { brandingServices } from '@/data/services/branding';
import { emailServices } from '@/data/services/email';
import { mobileServices } from '@/data/services/mobile';
import { seoServices } from '@/data/services/seo';
import { storageServices } from '@/data/services/storage';
import { websiteServices } from '@/data/services/website';
import { siteSettings } from '@/data/site';
import { stats } from '@/data/stats';
import { testimonials } from '@/data/testimonials';
import type { ContactPageContent, SiteSettings } from '@/types/content';
import { getFAQs } from './faq';
import { getContactPage, getHomePage, getLegalPage, getPaymentGuide } from './pages';
import { getPost } from './posts';
import { getPricing, getService, getServicePage } from './services';
import { getNavigation } from './site';

let repository: ContentRepository;
vi.mock('@/lib/repositories', () => ({ getRepository: () => repository }));

const viSettings = siteSettings.find((s) => s.locale === 'vi')!;
// The contact record keeps contacts in SiteSettings; a token in its copy must still resolve.
const contact = contactPages.find((p) => p.locale === 'vi')!;
const contactWithPhone: ContactPageContent = {
  ...contact,
  introduction: {
    ...contact.introduction,
    html: `${contact.introduction.html}<p>{{site.phone}}</p>`,
  },
};

// No committed service carries a phone token, so the test plants one.
const website = websiteServices.find((s) => s.locale === 'vi')!;
const websiteWithPhone = { ...website, summary: `${website.summary} {{site.phone}}` };

// The committed import output, with optional overrides of one domain.
const repoWith = (data: Partial<ContentData> = {}) =>
  createMockRepository({
    siteSettings,
    navigation,
    // Every service the home page places; the VI website one carries the planted token.
    services: [
      websiteWithPhone,
      ...[mobileServices, seoServices, brandingServices, storageServices, emailServices].flat(),
    ],
    faqs,
    testimonials,
    partners,
    projects,
    projectCategories: [],
    posts,
    postCategories: [],
    stats,
    pricing: websitePricing,
    homePages,
    contactPages: [contactWithPhone],
    legalPages,
    paymentGuides,
    ...data,
  } as unknown as ContentData);

test('phone change: contact, legal warranty, FAQs and service page all show the new phone', async () => {
  const phone = '1111 222 333';
  const edited: SiteSettings = {
    ...viSettings,
    phones: [{ label: phone, href: 'tel:1111222333' }],
  };
  repository = repoWith({ siteSettings: [edited] });
  const warranty = legalPages.find((p) => p.path === '/chinh-sach-bao-hanh/')!;
  expect(warranty.body.html).toContain('{{site.phone}}');
  const faqId = faqs.find((f) => f.locale === 'vi' && f.answer.html.includes('{{site.phone}}'))!.id;
  const results = [
    await getContactPage('vi'),
    await getLegalPage(warranty.path, 'vi'),
    await getFAQs([faqId], 'vi'),
    await getServicePage('website', 'vi'),
  ];
  for (const result of results) {
    expect(JSON.stringify(result)).toContain(phone);
    expect(JSON.stringify(result)).not.toContain('{{site.');
  }
});

test('phone change: post, service, pricing, payment guide and FAQ all show the new phone', async () => {
  const phone = '1111 222 333';
  const edited: SiteSettings = {
    ...viSettings,
    phones: [{ label: phone, href: 'tel:1111222333' }],
  };
  // No committed pricing carries a phone token, so the test plants one.
  const pricing = websitePricing.find((p) => p.locale === 'vi')!;
  repository = repoWith({
    siteSettings: [edited],
    pricing: [{ ...pricing, heading: `${pricing.heading} {{site.phone}}` }],
  });
  const post = posts.find((p) => p.body.html.includes('{{site.phone}}'))!;
  const faqId = faqs.find((f) => f.locale === 'vi' && f.answer.html.includes('{{site.phone}}'))!.id;
  expect(JSON.stringify(paymentGuides.find((p) => p.locale === 'vi'))).toContain('{{site.phone}}');
  const results = [
    await getPost(post.slug),
    await getService('website', 'vi'),
    await getPricing(pricing.id, 'vi'),
    await getPaymentGuide('vi'),
    await getFAQs([faqId], 'vi'),
  ];
  for (const result of results) {
    expect(JSON.stringify(result)).toContain(phone);
    expect(JSON.stringify(result)).not.toContain('{{site.');
  }
});

test('hero change: the home query returns the edited hero line with its shared stats', async () => {
  const home = homePages.find((p) => p.locale === 'vi')!;
  repository = repoWith({
    homePages: [{ ...home, hero: { ...home.hero, headingLines: ['Dòng mới', 'Fixture'] } }],
  });
  const page = await getHomePage('vi');
  expect(page?.hero.headingLines[0]).toBe('Dòng mới');
  expect(page?.stats.map((s) => s.id)).toEqual(home.statIds);
  expect(page).not.toHaveProperty('statIds');
  expect(JSON.stringify(page)).not.toContain('{{site.');
});

test('dangling stat or placement ids throw naming the page and ids', async () => {
  const home = homePages.find((p) => p.locale === 'vi')!;
  repository = repoWith({
    homePages: [
      {
        ...home,
        statIds: [...home.statIds, 'stat-gone'],
        serviceIds: [...home.serviceIds, 'service-gone-vi'],
        projectPlacements: [{ entityId: 'project-gone', order: 1 }],
        partnerPlacements: [{ entityId: 'partner-gone', order: 1 }],
      },
    ],
  });
  await expect(getHomePage('vi')).rejects.toThrow(
    'home-vi references missing ids: stat-gone, project-gone, partner-gone, service-gone-vi',
  );
});

test('navigation resolves without tokens left', async () => {
  repository = repoWith();
  const nav = await getNavigation('en');
  expect(nav.serviceOptions).toHaveLength(6);
  expect(JSON.stringify(nav)).not.toContain('{{site.');
});
