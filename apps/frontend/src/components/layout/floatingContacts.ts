import type { ShellContent, SiteSettings } from '@/types/content';

export const CONTACT_ICON_SRC = {
  call: '/wp-content/uploads/2025/04/call-111.png',
  messenger: '/wp-content/uploads/2025/04/messenger-111.png',
  zalo: '/wp-content/uploads/2025/04/zalo-111.png',
} as const;

export const FLOATING_CONTACT_COLOR = '#2A63D7';

export interface ContactItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  iconSrc?: string;
  target?: string;
}

export function buildContactItems(
  settings: SiteSettings,
  labels: ShellContent['floatingContacts'],
): ContactItem[] {
  const items: ContactItem[] = [];

  const primaryPhone = settings.phones?.[0];
  if (primaryPhone?.href) {
    items.push({
      id: 'msg-item-10',
      title: labels.hotline,
      subtitle: labels.hours,
      href: primaryPhone.href,
      iconSrc: CONTACT_ICON_SRC.call,
      target: '_blank',
    });
  }

  if (settings.messengerHref) {
    items.push({
      id: 'msg-item-11',
      title: labels.messenger,
      subtitle: labels.hours,
      href: settings.messengerHref,
      iconSrc: CONTACT_ICON_SRC.messenger,
      target: '_blank',
    });
  }

  if (settings.zaloHref) {
    items.push({
      id: 'msg-item-12',
      title: labels.zalo,
      subtitle: labels.hours,
      href: settings.zaloHref,
      iconSrc: CONTACT_ICON_SRC.zalo,
      target: '_blank',
    });
  }

  if (settings.email) {
    items.push({
      id: 'msg-item-13',
      title: labels.email,
      subtitle: labels.hours,
      href: `mailto:${settings.email}`,
      target: '_blank',
    });
  }

  return items;
}
