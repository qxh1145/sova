import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import type { ServiceAssets, ServicePage } from '@/lib/queries/services';
import type { RouteEntry } from '@/types/content';
import { storageServices } from '@/data/services/storage';
import { StorageServiceView } from './StorageServiceView';

const mockRoutes: RouteEntry[] = [
  {
    id: 'route-hosting-doanh-nghiep',
    locale: 'vi',
    path: '/hosting-doanh-nghiep/',
    kind: 'service',
    source: { file: 'hosting-doanh-nghiep/index.html', line: 676 },
    aliases: [],
  },
  {
    id: 'route-vps-doanh-nghiep',
    locale: 'vi',
    path: '/vps-doanh-nghiep/',
    kind: 'service',
    source: { file: 'vps-doanh-nghiep/index.html', line: 676 },
    aliases: [],
  },
  {
    id: 'route-e-mail-doanh-nghiep',
    locale: 'vi',
    path: '/e-mail-doanh-nghiep/',
    kind: 'service',
    source: { file: 'e-mail-doanh-nghiep/index.html', line: 676 },
    aliases: [],
  },
  {
    id: 'route-en--business-hosting',
    locale: 'en',
    path: '/en/business-hosting/',
    kind: 'service',
    source: { file: 'en/business-hosting/index.html', line: 676 },
    aliases: [],
  },
  {
    id: 'route-en--business-vps',
    locale: 'en',
    path: '/en/business-vps/',
    kind: 'service',
    source: { file: 'en/business-vps/index.html', line: 676 },
    aliases: [],
  },
  {
    id: 'route-en--business-e-mail',
    locale: 'en',
    path: '/en/business-e-mail/',
    kind: 'service',
    source: { file: 'en/business-e-mail/index.html', line: 676 },
    aliases: [],
  },
];

const mockPage = (service = storageServices[0]): ServicePage => ({
  service,
  faqs: [],
  testimonials: [],
  projects: [],
  pricing: null,
});

const mockAssets: ServiceAssets = {
  heroImage: null,
  heroBgImage: null,
  benefitsBgImage: null,
  advantagesPhoto: null,
  advantagesDeco: null,
  offeringsBgImage: null,
  ctaIcon: null,
  benefitsVideo: null,
  benefitIcons: [],
  offeringMedia: [],
  subtractIcon: null,
  testimonialAvatars: [],
  testimonialArt: {
    photo: { id: 'p', src: '/p.webp', alt: '', kind: 'image', status: 'local', sources: [] },
    quoteIcon: { id: 'q', src: '/q.svg', alt: '', kind: 'image', status: 'local', sources: [] },
    line: { id: 'l', src: '/l.svg', alt: '', kind: 'image', status: 'local', sources: [] },
  },
  planIcons: [],
  marqueeSeparator: null,
  projectAssets: [],
  projectCategories: [],
};

describe('StorageOfferings / StorageServiceView', () => {
  it.each([
    [
      'vi',
      storageServices[0],
      ['/hosting-doanh-nghiep/', '/vps-doanh-nghiep/', '/e-mail-doanh-nghiep/'],
    ],
    [
      'en',
      storageServices[1],
      ['/en/business-hosting/', '/en/business-vps/', '/en/business-e-mail/'],
    ],
  ] as const)(
    '%s resolves hrefs for all offering cards and renders 3 slides',
    (locale, service, paths) => {
      const root = parse(
        renderToStaticMarkup(
          StorageServiceView({
            page: mockPage(service),
            assets: mockAssets,
            routes: mockRoutes,
            locale,
          }),
        ),
      );
      // next/link drops the trailing slash outside the Next runtime (trailingSlash config unset).
      const hrefs = paths.map((p) => p.replace(/\/$/, ''));
      const grid = root.querySelector('.eras-table-price.hide-for-small'); // business-text-ok: source CSS class name
      const slider = root.querySelector('.slide_gplt');

      expect(grid?.querySelectorAll('a.but-lh').map((a) => a.getAttribute('href'))).toEqual(hrefs);
      expect(slider?.querySelectorAll('a.but-lh').map((a) => a.getAttribute('href'))).toEqual(
        hrefs,
      );
      expect(slider?.querySelectorAll('h3').map((h) => h.text)).toEqual(
        service.offerings.map((o) => o.slideTitle),
      );
    },
  );

  it('throws naming unknown routeId when offering cta routeId is not in registry', () => {
    const brokenService = {
      ...storageServices[0],
      offerings: [
        {
          ...storageServices[0].offerings[0],
          cta: { label: 'Xem chi tiết', routeId: 'route-unknown-xyz' },
        },
      ],
    };

    expect(() =>
      StorageServiceView({
        page: mockPage(brokenService),
        assets: mockAssets,
        routes: mockRoutes,
        locale: 'vi',
      }),
    ).toThrow(/unknown routeId 'route-unknown-xyz'/);
  });
});
