import type { SiteSettings } from '@/types/content';

// Hand-written, not imported. Placeholder contacts only: real Sova values replace these later.
// The map points at central Hanoi, not a real office. `asset-sova-wordmark` is registered by the
// importer (status missing until the logo file exists).
const shared = {
  companyName: 'Sova',
  wordmark: 'Sova',
  phones: [{ label: '0000 000 000', href: 'tel:0000000000' }],
  email: 'hello@example.com',
  socialLinks: [],
  messengerHref: 'https://example.com/messenger',
  zaloHref: 'https://example.com/zalo',
  mapEmbedUrl: 'https://maps.google.com/maps?q=21.0285,105.8542&z=15&output=embed',
  logoIds: ['asset-sova-wordmark'],
};

export const siteSettings: SiteSettings[] = [
  { locale: 'vi', ...shared, address: 'Địa chỉ đang cập nhật' },
  { locale: 'en', ...shared, address: 'Address coming soon' },
];
