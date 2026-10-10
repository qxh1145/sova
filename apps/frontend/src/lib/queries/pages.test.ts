import { expect, test, vi } from 'vitest';
import type { ContentData, ContentRepository } from '@/lib/repositories/contracts';
import { createMockRepository } from '@/lib/repositories/mock';
import { assets } from '@/data/assets';
import { faqs } from '@/data/faq';
import { navigation } from '@/data/navigation';
import { aboutPages } from '@/data/pages/about';
import { contactPages } from '@/data/pages/contact';
import { homePages } from '@/data/pages/home';
import { legalPages, paymentGuides } from '@/data/pages/legal';
import { faqPages } from '@/data/pages/faq';
import { partners } from '@/data/partners';
import { posts } from '@/data/posts';
import { projectCategories } from '@/data/project-categories';
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
import {
  getAboutAssets,
  getAboutPage,
  getContactAssets,
  getContactPage,
  getFAQPage,
  getHomeAssets,
  getHomePage,
  getLegalPage,
  getPaymentGuide,
} from './pages';
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
    services: [
      websiteWithPhone,
      ...websiteServices.filter((s) => s.locale !== 'vi'),
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
    assets,
    homePages,
    aboutPages,
    contactPages: [contactWithPhone],
    legalPages,
    paymentGuides,
    faqPages,
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
    await repository.getPost(post.slug),
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
        marqueeSeparatorId: 'asset-gone',
      },
    ],
  });
  await expect(getHomePage('vi')).rejects.toThrow(
    'home-vi references missing ids: stat-gone, project-gone, partner-gone, service-gone-vi, asset-gone',
  );
});

test('VI home query resolves all collections in record order', async () => {
  repository = repoWith();
  const home = homePages.find((p) => p.locale === 'vi')!;
  const page = await getHomePage('vi');
  expect(page).not.toBeNull();
  expect(page?.services.map((s) => s.id)).toEqual(home.serviceIds);
  expect(page?.projects.map((p) => p.id)).toEqual(home.projectPlacements.map((p) => p.entityId));
  expect(page?.partners.map((p) => p.id)).toEqual(home.partnerPlacements.map((p) => p.entityId));
  expect(page?.testimonials.map((t) => t.id)).toEqual(
    home.testimonialPlacements.map((p) => p.entityId),
  );
  expect(page?.posts.map((p) => p.id)).toEqual(home.postPlacements.map((p) => p.entityId));
  expect(page?.stats.map((s) => s.id)).toEqual(home.statIds);
  expect(page?.marqueeSeparator.id).toBe(home.marqueeSeparatorId);
  expect(page?.marqueeSeparator.src).toBe('/wp-content/uploads/2024/02/Ellipse-2351.svg');
  expect(page?.services).toHaveLength(6);
  expect(page?.projects).toHaveLength(6);
  expect(page?.partners).toHaveLength(30);
  expect(page?.testimonials).toHaveLength(3);
  expect(page?.posts).toHaveLength(3);
  expect(page?.stats).toHaveLength(4);
  expect(page?.testimonialArt.photo.id).toBe(home.testimonialArtIds.photoId);
  expect(page?.testimonialArt.quoteIcon.id).toBe(home.testimonialArtIds.quoteIconId);
  expect(page?.testimonialArt.line.id).toBe(home.testimonialArtIds.lineId);
});

test('EN home query resolves services and empty lists', async () => {
  repository = repoWith();
  const home = homePages.find((p) => p.locale === 'en')!;
  const page = await getHomePage('en');
  expect(page).not.toBeNull();
  expect(page?.services.map((s) => s.id)).toEqual(home.serviceIds);
  expect(page?.services[0].id).toBe('service-website-en');
  expect(page?.services[1].id).toBe('service-mobile-en');
  expect(page?.marqueeSeparator.id).toBe(home.marqueeSeparatorId);
  expect(page?.testimonialArt.photo.id).toBe(home.testimonialArtIds.photoId);
  expect(page?.testimonialArt.quoteIcon.id).toBe(home.testimonialArtIds.quoteIconId);
  expect(page?.testimonialArt.line.id).toBe(home.testimonialArtIds.lineId);
  expect(page?.projects).toEqual([]);
  expect(page?.posts).toEqual([]);
  expect(page?.partners).toHaveLength(30);
  expect(page?.testimonials).toHaveLength(3);
});

test('dangling testimonial id throws naming the page and id', async () => {
  const home = homePages.find((p) => p.locale === 'vi')!;
  repository = repoWith({
    homePages: [
      {
        ...home,
        testimonialPlacements: [{ entityId: 'testimonial-gone', order: 1 }],
      },
    ],
  });
  await expect(getHomePage('vi')).rejects.toThrow(
    'home-vi references missing ids: testimonial-gone',
  );
});

test('dangling testimonial art id throws naming the page and id', async () => {
  const home = homePages.find((p) => p.locale === 'vi')!;
  repository = repoWith({
    homePages: [
      {
        ...home,
        testimonialArtIds: {
          ...home.testimonialArtIds,
          photoId: 'asset-gone-photo',
        },
      },
    ],
  });
  await expect(getHomePage('vi')).rejects.toThrow(
    'home-vi references missing ids: asset-gone-photo',
  );
});

test('getHomePage accepts optional repository parameter', async () => {
  // The default repository has no home page, so a resolved page proves the parameter is used.
  repository = repoWith({ homePages: [] });
  const customRepo = repoWith();
  const page = await getHomePage('vi', customRepo);
  expect(page?.locale).toBe('vi');
});

test('navigation resolves without tokens left', async () => {
  repository = repoWith();
  const nav = await getNavigation('en');
  expect(nav.serviceOptions).toHaveLength(6);
  expect(JSON.stringify(nav)).not.toContain('{{site.');
});

test('getHomeAssets resolves video, projects, categories, partners, testimonials, and posts in order', async () => {
  repository = repoWith({ projectCategories });
  const home = await getHomePage('vi');
  expect(home).not.toBeNull();
  const result = await getHomeAssets(home);

  expect(result.videoAsset?.id).toBe(home!.hero.videoId);
  expect(result.projectAssets.map((a) => a.id)).toEqual(
    home!.projects.map((p) => p.galleryIds[0]).filter(Boolean),
  );
  expect(result.projectCategories.map((c) => c.id)).toEqual(projectCategories.map((c) => c.id));
  expect(result.partnerAssets.map((a) => a.id)).toEqual(home!.partners.map((p) => p.logoId));
  expect(result.testimonialAssets.map((a) => a.id)).toEqual(
    home!.testimonials.map((t) => t.avatarId).filter(Boolean),
  );
  expect(result.postAssets.map((a) => a.id)).toEqual(
    home!.posts.map((p) => p.thumbnailId).filter(Boolean),
  );
});

test('getHomeAssets handles null content and missing hero video gracefully', async () => {
  repository = repoWith();
  const nullResult = await getHomeAssets(null);
  expect(nullResult).toEqual({
    videoAsset: null,
    projectAssets: [],
    projectCategories: [],
    partnerAssets: [],
    testimonialAssets: [],
    postAssets: [],
  });

  const home = await getHomePage('vi');
  expect(home).not.toBeNull();
  const noVideoHome = {
    ...home!,
    hero: { ...home!.hero, videoId: undefined },
  };
  const result = await getHomeAssets(noVideoHome);
  expect(result.videoAsset).toBeNull();
  expect(result.projectAssets.length).toBeGreaterThan(0);
});

test('getHomeAssets reads assets from the repository it is given', async () => {
  repository = repoWith({ homePages: [] });
  const customRepo = repoWith();
  const home = await getHomePage('vi', customRepo);
  expect(home).not.toBeNull();

  const getAssetsSpy = vi.spyOn(customRepo, 'getAssets');
  const getCategoriesSpy = vi.spyOn(customRepo, 'getProjectCategories');
  const result = await getHomeAssets(home, customRepo);

  expect(result.videoAsset?.id).toBe(home!.hero.videoId);
  expect(getAssetsSpy).toHaveBeenCalledWith([home!.hero.videoId]);
  expect(getAssetsSpy).toHaveBeenCalledWith(
    home!.projects.map((p) => p.galleryIds[0]).filter(Boolean),
  );
  expect(getCategoriesSpy).toHaveBeenCalledOnce();
});

test('getAboutAssets resolves hero background, subtract icon and goal icons in goal order', async () => {
  repository = repoWith();
  const about = await getAboutPage('vi');
  const result = await getAboutAssets(about!);
  expect(result.heroBgImage.id).toBe(about!.hero.imageId);
  expect(result.subtractIcon.src).toBe('/wp-content/uploads/2024/02/Subtract.svg');
  expect(result.goalIcons.map((a) => a.id)).toEqual(about!.goals.map((g) => g.iconId));
});

test('getAboutAssets rejects on a dangling goal icon id', async () => {
  repository = repoWith();
  const about = await getAboutPage('vi');
  const goals = about!.goals.map((g, i) => (i === 2 ? { ...g, iconId: 'asset-nope' } : g));
  await expect(getAboutAssets({ ...about!, goals })).rejects.toThrow(
    'about-vi references missing ids: asset-nope',
  );
});

test('getContactAssets resolves hero and info icons by id', async () => {
  repository = repoWith();
  const result = await getContactAssets(contact);
  expect(result.heroImage.id).toBe(contact.heroImageId);
  expect(result.heroImage.src).toBe('/wp-content/uploads/2024/03/contact_hero_bg.jpg');
  expect(result.infoIcons.address.id).toBe(contact.infoIconIds.address);
  expect(result.infoIcons.phone.id).toBe(contact.infoIconIds.phone);
  expect(result.infoIcons.email.id).toBe(contact.infoIconIds.email);
});

test('getContactAssets rejects on a dangling icon id', async () => {
  repository = repoWith();
  const infoIconIds = { ...contact.infoIconIds, phone: 'asset-nope' };
  await expect(getContactAssets({ ...contact, infoIconIds })).rejects.toThrow(
    'contact-vi references missing ids: asset-nope',
  );
});

test('getAboutPage resolves 3 testimonials in placement order', async () => {
  repository = repoWith();
  const about = await getAboutPage('vi');
  expect(about).not.toBeNull();
  expect(about!.testimonials).toHaveLength(3);
  expect(about!.testimonials.map((t) => t.id)).toEqual([
    'testimonial-feedback-ten',
    'testimonial-feedback-dong-a',
    'testimonial-feedback-vinatex',
  ]);
  expect(about!.stats).toHaveLength(4);
  expect(about!.marqueeSeparator.id).toBe('asset-400b882328');
  expect(about!.purposeImage.id).toBe('asset-e0d6652ff9');
  expect(about!.timelineDot.id).toBe('asset-c78e42b8a9');
});

test('getAboutPage rejects when testimonial id is missing', async () => {
  const aboutRecord = aboutPages.find((p) => p.locale === 'vi')!;
  repository = repoWith({
    aboutPages: [
      {
        ...aboutRecord,
        testimonialIds: [...aboutRecord.testimonialIds, 'testimonial-nonexistent'],
      },
    ],
  });
  await expect(getAboutPage('vi')).rejects.toThrow(
    'about-vi references missing ids: testimonial-nonexistent',
  );
});

test('getAboutPage rejects when an asset id is missing', async () => {
  const aboutRecord = aboutPages.find((p) => p.locale === 'vi')!;
  repository = repoWith({ aboutPages: [{ ...aboutRecord, timelineDotId: 'asset-nope' }] });
  await expect(getAboutPage('vi')).rejects.toThrow('about-vi references missing ids: asset-nope');
});

test('getAboutPage resolves the EN page with its stats in record order', async () => {
  repository = repoWith();
  const about = await getAboutPage('en');
  const record = aboutPages.find((p) => p.locale === 'en')!;
  expect(about!.id).toBe('about-en');
  expect(about!.stats.map((s) => s.id)).toEqual(record.statIds);
  expect(about!.testimonials.map((t) => t.id)).toEqual(record.testimonialIds);
  expect(about!.timelineDot.id).toBe(record.timelineDotId);
});

test('getFAQPage resolves the FAQ page record for vi and en', async () => {
  repository = repoWith();
  const viPage = await getFAQPage('vi');
  expect(viPage?.id).toBe('faq-vi');
  expect(viPage?.path).toBe('/cau-hoi-thuong-gap/');
  expect(viPage?.title).toBe('CÂU HỎI THƯỜNG GẶP');
  expect(viPage?.breadcrumb).toEqual({
    homeLabel: 'Trang chủ',
    current: 'Câu hỏi thường gặp',
  });

  const enPage = await getFAQPage('en');
  expect(enPage?.id).toBe('faq-en');
  expect(enPage?.path).toBe('/en/faq/');
  expect(enPage?.title).toBe('FAQ');
  expect(enPage?.breadcrumb).toEqual({
    homeLabel: 'Home',
    current: 'FAQ',
  });
});

test('getFAQPage returns null when record is missing', async () => {
  repository = repoWith({ faqPages: [] });
  expect(await getFAQPage('vi')).toBeNull();
  expect(await getFAQPage('en')).toBeNull();
});
