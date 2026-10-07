import { describe, expect, it } from 'vitest';
import type { ServiceAssets, ServicePage } from '@/lib/queries/services';
import { hostingServices } from '@/data/services/hosting';
import { websitePricing } from '@/data/pricing/website';
import { HostingServiceView } from './HostingServiceView';
import { VpsServiceView } from './VpsServiceView';
import { EmailServiceView } from './EmailServiceView';

const page = (pricing: ServicePage['pricing']): ServicePage => ({
  service: hostingServices[0],
  faqs: [],
  testimonials: [],
  projects: [],
  pricing,
});
const assets = {} as ServiceAssets;

describe.each([
  ['HostingServiceView', HostingServiceView],
  ['VpsServiceView', VpsServiceView],
  ['EmailServiceView', EmailServiceView],
])('%s', (_, View) => {
  it('throws when pricing is missing', () => {
    expect(() => View({ page: page(null), assets, locale: 'vi' })).toThrow(/table pricing/);
  });

  it('throws when pricing is not a table', () => {
    expect(() => View({ page: page(websitePricing[0]), assets, locale: 'vi' })).toThrow(
      /table pricing/,
    );
  });
});
