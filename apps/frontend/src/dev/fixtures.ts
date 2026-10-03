// Test-only fake content: one minimal VI record per domain. No real or imported text.
import type { ContentData } from '@/lib/repositories/contracts';
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
  ],
  navigation: [
    {
      locale: 'vi',
      header: [
        { id: 'nav-1', label: 'Home', destination: { kind: 'internal', routeId: 'route-1' } },
      ],
      mobile: [],
      footerGroups: [],
    },
  ],
  routes: [
    { id: 'route-1', locale: 'vi', path: '/', kind: 'home', aliases: [], source: sources[0] },
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
  ],
  homePages: [
    {
      ...page('home-1', '/'),
      hero,
      stats: [],
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
      stats: [],
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
  profiles: [{ ...page('profile-1', '/fixture-profile'), pdfAssetId: 'asset-1' }],
  listingSettings: [{ routeId: 'route-1', heading: { title: 'Fixture' } }],
};

export const missingMediaFixtures: ContentData = {
  ...fixtures,
  assets: fixtures.assets.map((asset) => ({ ...asset, status: 'missing' })),
};
