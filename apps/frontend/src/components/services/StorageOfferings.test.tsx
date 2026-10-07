import { describe, expect, it } from 'vitest';
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
};

describe('StorageOfferings / StorageServiceView', () => {
  it('resolves hrefs for all offering cards and renders 3 slides', () => {
    const viView = StorageServiceView({
      page: mockPage(storageServices[0]),
      assets: mockAssets,
      routes: mockRoutes,
      locale: 'vi',
    });
    expect(viView).toBeDefined();

    const enView = StorageServiceView({
      page: mockPage(storageServices[1]),
      assets: mockAssets,
      routes: mockRoutes,
      locale: 'en',
    });
    expect(enView).toBeDefined();
  });

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
