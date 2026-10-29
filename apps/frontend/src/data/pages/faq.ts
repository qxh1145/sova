// Seeded by scripts/import, then curated by hand. npm run import skips it unless IMPORT_OVERWRITE_CONTENT=1.
import type { FAQPageContent } from '@/types/content';

export const faqPages: FAQPageContent[] = [
  {
    id: 'faq-vi',
    locale: 'vi',
    path: '/cau-hoi-thuong-gap/',
    title: 'CÂU HỎI THƯỜNG GẶP',
    sources: [{ file: 'cau-hoi-thuong-gap/index.html', line: 618, sourceId: '7209' }],
    translationKey: 'faq',
    breadcrumb: { homeLabel: 'Trang chủ', current: 'Câu hỏi thường gặp' },
    seo: {
      title: 'Câu hỏi thường gặp - Công ty thiết kế website chuyên nghiệp | Sova',
      description:
        'Giải đáp thắc mắc thường gặp về dịch vụ thiết kế website, app mobile, SEO từ khóa và UI/UX, branding của Sova: hợp đồng, chi phí, thời gian và bàn giao.',
      canonicalPath: '/cau-hoi-thuong-gap/',
    },
  },
  {
    id: 'faq-en',
    locale: 'en',
    path: '/en/faq/',
    title: 'FAQ',
    sources: [{ file: 'en/faq/index.html', line: 618, sourceId: '7328' }],
    translationKey: 'faq',
    breadcrumb: { homeLabel: 'Home', current: 'FAQ' },
    seo: {
      title: 'FAQ - Professional Website Design Company | Sova',
      description:
        'Answers to common questions about Sova’s website design, mobile app, keyword SEO, UI/UX and branding services: contracts, costs, timelines and handover.',
      canonicalPath: '/en/faq/',
    },
  },
];
