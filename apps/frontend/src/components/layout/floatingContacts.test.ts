import { describe, expect, it } from 'vitest';
import type { ShellContent, SiteSettings } from '@/types/content';
import { buildContactItems } from './floatingContacts';

describe('buildContactItems', () => {
  const dummyLabels: ShellContent['floatingContacts'] = {
    buttonText: 'Contact us',
    menuHeader: 'Xin chào, Chúng tôi có thể giúp gì cho bạn.',
    hours: '(7h30 - 23h00)',
    hotline: 'Hotline',
    messenger: 'Messenger',
    zalo: 'Chat Zalo',
    email: 'Email us',
  };

  const dummySettings: SiteSettings = {
    locale: 'vi',
    companyName: 'Test Co',
    wordmark: 'Test',
    address: '123 St',
    phones: [{ label: '0123 456 789', href: 'tel:0123456789' }],
    email: 'hello@example.com',
    socialLinks: [],
    messengerHref: 'https://m.me/test',
    zaloHref: 'https://zalo.me/0123456789',
    mapEmbedUrl: '',
    logoIds: [],
  };

  it('builds all 4 items when all contact targets are provided', () => {
    const items = buildContactItems(dummySettings, dummyLabels);
    expect(items).toHaveLength(4);

    expect(items[0]).toEqual({
      id: 'msg-item-10',
      title: 'Hotline',
      subtitle: '(7h30 - 23h00)',
      href: 'tel:0123456789',
      iconSrc: '/wp-content/uploads/2025/04/call-111.png',
      target: '_blank',
    });

    expect(items[1]).toEqual({
      id: 'msg-item-11',
      title: 'Messenger',
      subtitle: '(7h30 - 23h00)',
      href: 'https://m.me/test',
      iconSrc: '/wp-content/uploads/2025/04/messenger-111.png',
      target: '_blank',
    });

    expect(items[2]).toEqual({
      id: 'msg-item-12',
      title: 'Chat Zalo',
      subtitle: '(7h30 - 23h00)',
      href: 'https://zalo.me/0123456789',
      iconSrc: '/wp-content/uploads/2025/04/zalo-111.png',
      target: '_blank',
    });

    expect(items[3]).toEqual({
      id: 'msg-item-13',
      title: 'Email us',
      subtitle: '(7h30 - 23h00)',
      href: 'mailto:hello@example.com',
      target: '_blank',
    });
    expect(items[3].iconSrc).toBeUndefined();
  });

  it('omits Hotline item when phones list is empty', () => {
    const noPhones = { ...dummySettings, phones: [] };
    const items = buildContactItems(noPhones, dummyLabels);
    expect(items).toHaveLength(3);
    expect(items.some((i) => i.id === 'msg-item-10')).toBe(false);
    expect(items.map((i) => i.id)).toEqual(['msg-item-11', 'msg-item-12', 'msg-item-13']);
  });

  it('omits messenger when messengerHref is missing', () => {
    const noMessenger = { ...dummySettings, messengerHref: '' };
    const items = buildContactItems(noMessenger, dummyLabels);
    expect(items.some((i) => i.id === 'msg-item-11')).toBe(false);
  });

  it('omits zalo when zaloHref is missing', () => {
    const noZalo = { ...dummySettings, zaloHref: '' };
    const items = buildContactItems(noZalo, dummyLabels);
    expect(items.some((i) => i.id === 'msg-item-12')).toBe(false);
  });

  it('omits email when email is missing', () => {
    const noEmail = { ...dummySettings, email: '' };
    const items = buildContactItems(noEmail, dummyLabels);
    expect(items.some((i) => i.id === 'msg-item-13')).toBe(false);
  });
});
