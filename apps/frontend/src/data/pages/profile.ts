// Seeded by scripts/import, then curated by hand. npm run import skips it unless IMPORT_OVERWRITE_CONTENT=1.
import type { CompanyProfileContent } from '@/types/content';

export const profiles: CompanyProfileContent[] = [
  {
    id: 'profile-en',
    locale: 'en',
    path: '/en/sova-portfolio/',
    title: 'Portfolio Sova',
    sources: [{ file: 'en/porfolio-eras-vietnam/index.html', line: 625, sourceId: '7355' }],
    translationKey: 'profile',
    coverId: 'asset-3a2f0e6140',
    pdfAssetId: 'asset-eeb72bb0f1',
    seo: {
      title: 'Sova Portfolio - Professional Website Design Company | Sova',
      description:
        'Sova company portfolio: our website design, mobile app, SEO and branding services, with selected projects.',
      canonicalPath: '/en/sova-portfolio/',
      imageId: 'asset-7bf27997e2',
    },
  },
  {
    id: 'profile-vi',
    locale: 'vi',
    path: '/ho-so-nang-luc-sova/',
    title: 'Hồ Sơ Năng Lực Sova',
    sources: [{ file: 'ho-so-nang-luc-eras-vietnam/index.html', line: 625, sourceId: '7211' }],
    translationKey: 'profile',
    coverId: 'asset-3a2f0e6140',
    pdfAssetId: 'asset-e6d8764e5f',
    seo: {
      title: 'Hồ sơ năng lực Sova - Công ty thiết kế website chuyên nghiệp | Sova',
      description:
        'Hồ sơ năng lực Sova: giới thiệu dịch vụ thiết kế website, app mobile, SEO, branding và các dự án tiêu biểu.',
      canonicalPath: '/ho-so-nang-luc-sova/',
      imageId: 'asset-7bf27997e2',
    },
  },
];
