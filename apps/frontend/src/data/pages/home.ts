// Seeded by scripts/import, then curated by hand. npm run import skips it unless IMPORT_OVERWRITE_CONTENT=1.
import type { HomePageRecord } from '@/types/content';

export const homePages: HomePageRecord[] = [
  {
    id: 'home-vi',
    locale: 'vi',
    path: '/',
    title: 'Trang chủ',
    sources: [{ file: 'index.html', line: 654, sourceId: '6877' }],
    translationKey: 'home',
    hero: {
      headingLines: ['Trải nghiệm số trọn vẹn', 'khởi nguồn từ thấu hiểu', 'và sự đồng hành'],
      videoId: 'asset-8f7199f69f',
      cta: { label: 'Về chúng tôi →', href: '/gioi-thieu/' },
    },
    seo: {
      title: 'Trang chủ - Công ty thiết kế website chuyên nghiệp | Sova',
      description:
        'Sova mang đến giải pháp tối ưu cho từng bài toán của khách hàng, cùng những sản phẩm được hoàn thiện kỹ lưỡng, đáp ứng tốt nhu cầu hôm nay lẫn mai sau.',
      canonicalPath: '/',
      imageId: 'asset-b1da605d35',
    },
    statIds: ['stat-clients-vi', 'stat-projects-vi', 'stat-members-vi', 'stat-years-vi'],
    sectionCopy: {
      achievements: {
        title: 'Thành quả Sova đã gặt hái',
        titleLines: ['Thành quả', 'Sova đã gặt hái'],
        description:
          'Sova coi mỗi dự án là một hành trình chung: không chỉ tạo thêm giá trị cho doanh nghiệp, chúng tôi còn sát cánh cùng họ để từng sản phẩm số mang lại lợi ích lan tỏa đến chính khách hàng của họ.',
      },
      services: { eyebrow: 'Dịch vụ', title: 'Giải pháp từ Sova' },
      projects: {
        eyebrow: 'Sova',
        title: 'Mỗi dự án gửi gắm đam mê sáng tạo',
        titleLines: ['Mỗi dự án gửi gắm', 'đam mê sáng tạo'],
      },
      partners: { eyebrow: 'Khách hàng', title: 'Bạn đồng hành' },
      testimonials: {
        eyebrow: 'Sova',
        title: 'Tiếng nói từ phía khách hàng',
        titleLines: ['Tiếng nói từ phía', 'khách hàng'],
      },
      posts: {
        eyebrow: 'GÓC NHÌN',
        title: 'Bắt nhịp tin tức cùng Sova',
        titleLines: ['Bắt nhịp tin tức', 'cùng Sova'],
        description: 'Khám phá thêm →',
      },
    },
    serviceIds: [
      'service-website-vi',
      'service-mobile-vi',
      'service-seo-vi',
      'service-branding-vi',
      // 'service-storage-vi',
      // 'service-email-vi',
    ],
    marqueeText: ['Development', 'UI/UX', 'Sova', 'Branding', 'Writer', 'Mobile'],
    marqueeSeparatorId: 'asset-400b882328',
    testimonialArtIds: {
      photoId: 'asset-941f38ec1d',
      quoteIconId: 'asset-1d227d7c9b',
      lineId: 'asset-5763f42849',
    },
    projectPlacements: [
      { entityId: 'project-2348', order: 1 },
      { entityId: 'project-2182', order: 2 },
      { entityId: 'project-2176', order: 3 },
      { entityId: 'project-2170', order: 4 },
      { entityId: 'project-2161', order: 5 },
      { entityId: 'project-2120', order: 6 },
    ],
    partnerPlacements: [],
    // Testimonials hidden (stakeholder review 2026-10-27): the quotes came from the source site's
    // clients. Uncomment the entries to show the section again.
    testimonialPlacements: [
      // { entityId: 'testimonial-feedback-ten', order: 1 },
      // { entityId: 'testimonial-feedback-dong-a', order: 2 },
      // { entityId: 'testimonial-feedback-vinatex', order: 3 },
    ],
    postPlacements: [
      { entityId: 'post-2515', order: 1 },
      { entityId: 'post-2492', order: 2 },
      { entityId: 'post-2475', order: 3 },
    ],
  },
  {
    id: 'home-en',
    locale: 'en',
    path: '/en/home/',
    title: 'Home',
    sources: [{ file: 'en/home/index.html', line: 654, sourceId: '7378' }],
    translationKey: 'home',
    hero: {
      headingLines: ['Complete Digital Experiences,', 'Rooted in Insight', 'and Partnership'],
      videoId: 'asset-8f7199f69f',
      cta: { label: 'About us →', href: '/en/about-us/' },
    },
    seo: {
      title: 'Home - Professional Website Design Company | Sova',
      description:
        'Sova delivers optimal solutions to each client’s challenge, along with carefully refined products that meet today’s needs and tomorrow’s alike.',
      canonicalPath: '/en/home/',
      imageId: 'asset-01ee7c94d0',
    },
    statIds: ['stat-clients-en', 'stat-projects-en', 'stat-members-en', 'stat-years-en'],
    sectionCopy: {
      achievements: {
        title: 'Sova’s Milestones',
        description:
          'Sova treats every project as a shared journey: beyond adding value for a business, we stand by its side so each digital product brings benefits that reach its own customers.',
      },
      services: { eyebrow: 'Service', title: 'Our Solutions' },
      projects: {
        eyebrow: 'Sova',
        title: 'Each Project Carries Our Creative Passion',
        titleLines: ['Each Project Carries', 'Our Creative Passion'],
      },
      partners: { eyebrow: 'Customers', title: 'Our Partners' },
      testimonials: { eyebrow: 'Sova', title: 'Voices of Clients' },
      posts: { eyebrow: 'INSIGHT', title: 'Catch Up on Sova News', description: 'Explore More →' },
    },
    serviceIds: [
      'service-website-en',
      'service-mobile-en',
      'service-seo-en',
      'service-branding-en',
      // 'service-storage-en',
      // 'service-email-en',
    ],
    marqueeText: ['Development', 'UI/UX', 'Sova', 'Branding', 'Writer', 'Mobile'],
    marqueeSeparatorId: 'asset-400b882328',
    testimonialArtIds: {
      photoId: 'asset-941f38ec1d',
      quoteIconId: 'asset-1d227d7c9b',
      lineId: 'asset-5763f42849',
    },
    projectPlacements: [],
    partnerPlacements: [],
    // Testimonials hidden (stakeholder review 2026-10-27): the quotes came from the source site's
    // clients. Uncomment the entries to show the section again.
    testimonialPlacements: [
      // { entityId: 'testimonial-feedback-ten', order: 1 },
      // { entityId: 'testimonial-feedback-dong-a', order: 2 },
      // { entityId: 'testimonial-feedback-vinatex', order: 3 },
    ],
    postPlacements: [],
  },
];
