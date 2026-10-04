// Test-only fake content: one minimal VI record per domain. No real or imported text.
import type { ContentData } from '@/lib/repositories/contracts';
import { defaultContentData } from '@/lib/repositories/mock';
import type { RichContent, SEO, SourceRef } from '@/types/content';

const sources: SourceRef[] = [{ file: 'fixture', line: 1 }];
const rich: RichContent = {
  format: 'sanitized-html',
  html: '<p>Fixture</p>',
  assetIds: [],
  sources,
};
const seo = (path: `/${string}`): SEO => ({ title: 'Fixture', canonicalPath: path });
const hero = { headingLines: ['Fixture'] };
const page = (id: string, path: `/${string}`) => ({
  id,
  locale: 'vi' as const,
  path,
  title: 'Fixture',
  sources,
  seo: seo(path),
});

export const fixtures: ContentData = {
  siteSettings: [
    {
      locale: 'vi',
      companyName: 'Fixture Co',
      wordmark: 'Fixture',
      address: 'Fixture address',
      phones: [{ label: '000', href: 'tel:000' }],
      email: 'fixture@example.com',
      socialLinks: [],
      messengerHref: 'https://example.com/messenger',
      zaloHref: 'https://example.com/zalo',
      mapEmbedUrl: '',
      logoIds: ['asset-1'],
    },
    {
      locale: 'en',
      companyName: 'Fixture Co',
      wordmark: 'Fixture',
      address: 'Fixture address',
      phones: [{ label: '000', href: 'tel:000' }],
      email: 'fixture@example.com',
      socialLinks: [],
      messengerHref: 'https://example.com/messenger',
      zaloHref: 'https://example.com/zalo',
      mapEmbedUrl: '',
      logoIds: ['asset-1'],
    },
  ],
  navigation: [
    {
      locale: 'vi',
      header: [
        { id: 'nav-1', label: 'Home', destination: { kind: 'internal', routeId: 'route-1' } },
      ],
      mobile: [],
      footerGroups: [],
      serviceOptions: [
        { id: 'nav-2', label: 'Fixture', destination: { kind: 'internal', routeId: 'route-1' } },
      ],
    },
    {
      locale: 'en',
      header: [
        { id: 'nav-en-1', label: 'Home', destination: { kind: 'internal', routeId: 'route-en-1' } },
      ],
      mobile: [],
      footerGroups: [],
      serviceOptions: [
        { id: 'nav-en-2', label: 'Fixture', destination: { kind: 'internal', routeId: 'route-en-1' } },
      ],
    },
  ],
  shellContent: [
    {
      locale: 'vi',
      headerCta: { label: 'Fixture CTA', routeId: 'route-1' },
      footerCta: { headingLines: ['Fixture Heading'], targetRouteId: 'route-1' },
      copyright: 'Copyright © 2026 {{site.companyName}} | All Rights Reserved.',
      themeCredit: 'Flatsome Theme',
      languageLabels: { vi: 'VI', en: 'EN' },
      mobileMenu: {
        trigger: 'Menu',
        close: 'Đóng',
        tagline: 'Thấu hiểu, đồng hành và thiết kế trải nghiệm digital toàn diện',
        menuHeading: 'Menu',
        contactHeading: 'Liên hệ',
        toggleSubmenu: 'Mở rộng menu con',
      },
      consult: {
        heading: 'Đăng ký',
        placeholder: 'Số điện thoại',
        submit: 'Gửi đi  →',
        submitting: 'Đang gửi...',
        required: 'Vui lòng nhập số điện thoại',
        invalid: 'Số điện thoại không hợp lệ',
        success: 'Đã ghi nhận yêu cầu trong bản demo.',
        error: 'Đã có lỗi xảy ra trong quá trình gửi. Vui lòng thử lại.',
        demoBadge: 'Bản demo — chưa gửi thông tin',
        note: 'Đăng ký để nhận những thông tin mới nhất về các chương trình ưu đãi của {{site.companyName}}',
      },
      contactBar: {
        menu: 'Menu',
        contact: 'Liên hệ',
        call: 'Gọi ngay',
        messenger: 'Messenger',
        zalo: 'Zalo',
      },
      floatingContacts: {
        buttonText: 'Contact us',
        menuHeader: 'Xin chào, Chúng tôi có thể giúp gì cho bạn.',
        hours: '(7h30 - 23h00)',
        hotline: 'Hotline',
        messenger: 'Messenger',
        zalo: 'Chat Zalo',
        email: 'Email us',
      },
    },
    {
      locale: 'en',
      headerCta: { label: 'Fixture CTA EN', routeId: 'route-en-1' },
      footerCta: { headingLines: ['Fixture Heading EN'], targetRouteId: 'route-en-1' },
      copyright: 'Copyright © 2026 {{site.companyName}} | All Rights Reserved.',
      themeCredit: 'Flatsome Theme',
      languageLabels: { vi: 'VI', en: 'EN' },
      mobileMenu: {
        trigger: 'Menu',
        close: 'Close',
        tagline: 'Understand, accompany, and design a comprehensive digital experience.',
        menuHeading: 'Menu',
        contactHeading: 'Contact',
        toggleSubmenu: 'Toggle submenu',
      },
      consult: {
        heading: 'Register',
        placeholder: 'Phone Number',
        submit: 'Submit →',
        submitting: 'Sending...',
        required: 'Please enter your phone number',
        invalid: 'Invalid phone number',
        success: 'Request recorded in demo mode.',
        error: 'An error occurred while sending. Please try again.',
        demoBadge: 'Demo — no data was sent',
        note: "Register to receive the latest information about {{site.companyName}}'s promotional programs",
      },
      contactBar: {
        menu: 'Menu',
        contact: 'Contact',
        call: 'Call now',
        messenger: 'Messenger',
        zalo: 'Zalo',
      },
      floatingContacts: {
        buttonText: 'Contact us',
        menuHeader: 'How would you like to contact us?',
        hours: '(7h30 - 23h00)',
        hotline: 'Hotline',
        messenger: 'Messenger',
        zalo: 'Chat Zalo',
        email: 'Email us',
      },
    },
  ],
  routes: [
    { id: 'route-1', locale: 'vi', path: '/', kind: 'home', counterpartId: 'route-en-1', aliases: [], source: sources[0] },
    { id: 'route-en-1', locale: 'en', path: '/en/home/', kind: 'home', counterpartId: 'route-1', aliases: [], source: sources[0] },
    { id: 'route-no-counterpart', locale: 'vi', path: '/fixture-no-counterpart/', kind: 'about', aliases: [], source: sources[0] },
  ],
  services: [
    {
      ...page('service-1', '/fixture-service'),
      key: 'website',
      summary: 'Fixture',
      hero,
      benefits: [],
      faqs: [{ faqId: 'faq-1', order: 1 }],
      testimonialIds: ['testimonial-1'],
      featuredProjectIds: ['project-1'],
      pricingId: 'pricing-1',
      offerings: [],
      sectionCopy: {},
    },
  ],
  projects: [
    {
      ...page('project-1', '/featured_item/fixture-project'),
      slug: 'fixture-project',
      categoryIds: ['project-category-1'],
      thumbnailId: 'asset-1',
      galleryIds: [],
      body: rich,
      metadata: [],
      relatedProjectIds: [],
    },
  ],
  projectCategories: [
    {
      id: 'project-category-1',
      slug: 'website',
      label: 'Fixture',
      locale: 'vi',
      path: '/fixture-category',
    },
  ],
  posts: [
    {
      ...page('post-1', '/fixture-post'),
      slug: 'fixture-post',
      categoryIds: ['post-category-1'],
      excerpt: 'Fixture',
      body: rich,
      author: { id: 'author-1', name: 'Fixture' },
      relatedPostIds: [],
    },
  ],
  postCategories: [
    {
      id: 'post-category-1',
      locale: 'vi',
      slug: 'fixture-category',
      title: 'Fixture',
      path: '/fixture-post-category',
    },
  ],
  faqs: [
    {
      id: 'faq-1',
      locale: 'vi',
      question: 'Fixture?',
      answer: rich,
      topicIds: ['faq-topic-1'],
      serviceKeys: ['website'],
      sources,
    },
  ],
  faqTopics: [
    { id: 'faq-topic-1', locale: 'vi', label: 'Fixture', items: [{ faqId: 'faq-1', order: 1 }] },
  ],
  testimonials: [{ id: 'testimonial-1', locale: 'vi', person: 'Fixture', quote: rich, sources }],
  partners: [{ id: 'partner-1', name: 'Fixture', logoId: 'asset-1', sources }],
  stats: [{ id: 'stat-1', value: 1, label: 'Fixture' }],
  pricing: [
    {
      id: 'pricing-1',
      locale: 'vi',
      serviceKey: 'website',
      heading: 'Fixture',
      plans: [],
      sources,
      kind: 'cards',
      features: [],
    },
  ],
  assets: [
    {
      id: 'asset-1',
      src: '/fixture.png',
      alt: 'Fixture',
      kind: 'image',
      status: 'local',
      sources,
    },
    {
      id: 'asset-b',
      src: '/fixture-b.png',
      alt: 'Brand B',
      kind: 'image',
      status: 'local',
      sources,
    },
  ],
  homePages: [
    {
      ...page('home-1', '/'),
      hero,
      statIds: ['stat-1'],
      sectionCopy: {
        achievements: { title: 'Fixture' },
        services: { title: 'Fixture' },
        projects: { title: 'Fixture' },
        partners: { title: 'Fixture' },
        testimonials: { title: 'Fixture' },
        posts: { title: 'Fixture' },
      },
      serviceIds: ['service-1'],
      marqueeText: [],
      projectPlacements: [{ entityId: 'project-1', order: 1 }],
      partnerPlacements: [],
      testimonialPlacements: [],
      postPlacements: [],
    },
  ],
  aboutPages: [
    {
      ...page('about-1', '/fixture-about'),
      hero,
      statIds: ['stat-1'],
      goals: [],
      purposePanels: [],
      timeline: [],
      capabilities: [],
      partnerIds: [],
      testimonialIds: [],
    },
  ],
  contactPages: [
    { ...page('contact-1', '/fixture-contact'), heading: 'Fixture', introduction: rich },
  ],
  legalPages: [{ ...page('legal-1', '/fixture-legal'), body: rich }],
  paymentGuides: [
    {
      ...page('payment-1', '/fixture-payment'),
      introduction: rich,
      accounts: [{ id: 'account-1', bank: 'Fixture', holder: 'Fixture', accountNumber: '000' }],
      instructions: rich,
    },
  ],
  profiles: [{ ...page('profile-1', '/fixture-profile'), pdfAssetId: 'asset-1' }],
  listingSettings: [{ routeId: 'route-1', heading: { title: 'Fixture' } }],
  listingSnapshots: [{ routeId: 'route-1', page: 1, orderedIds: ['post-1'] }],
  utilityContent: [{ id: 'utility-1', body: rich }],
};

export const missingMediaFixtures: ContentData = {
  ...fixtures,
  assets: fixtures.assets.map((asset) => ({ ...asset, status: 'missing' })),
};

export const variantBFixtures: ContentData = {
  ...fixtures,
  siteSettings: [
    {
      locale: 'vi',
      companyName: 'Brand B Corp',
      wordmark: 'Brand B',
      address: '456 Second St, Hanoi',
      phones: [{ label: '0999 888 777', href: 'tel:0999888777' }],
      email: 'contact@brand-b.example.com',
      socialLinks: [{ label: 'Facebook', href: 'https://facebook.com/brand-b' }],
      messengerHref: 'https://example.com/messenger-b',
      zaloHref: 'https://example.com/zalo-b',
      mapEmbedUrl: '',
      logoIds: ['asset-b'],
    },
    {
      locale: 'en',
      companyName: 'Brand B Corp',
      wordmark: 'Brand B',
      address: '456 Second St, Hanoi',
      phones: [{ label: '0999 888 777', href: 'tel:0999888777' }],
      email: 'contact@brand-b.example.com',
      socialLinks: [{ label: 'Facebook', href: 'https://facebook.com/brand-b' }],
      messengerHref: 'https://example.com/messenger-b',
      zaloHref: 'https://example.com/zalo-b',
      mapEmbedUrl: '',
      logoIds: ['asset-b'],
    },
  ],
};

export const noPhonesFixtures: ContentData = {
  ...fixtures,
  siteSettings: fixtures.siteSettings.map((s) => ({ ...s, phones: [] })),
};

export const faqChangedFixtures: ContentData = (() => {
  const data = structuredClone(defaultContentData);
  const target = data.faqs.find((f) => f.id === 'faq-vi-3285462442');
  if (target) {
    target.answer.html = '<p>Nội dung câu hỏi FAQ đã được chỉnh sửa cho fixture test.</p>';
  }
  return data;
})();

