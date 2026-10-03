import type { SiteSettings } from '@/types/content';

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Replace `{{site.x}}` tokens left by the import scrub; unknown tokens stay as-is. */
export function resolveSiteTokens(text: string, settings: SiteSettings, html = true): string {
  const values: Record<string, string | undefined> = {
    phone: settings.phones[0]?.label,
    phoneHref: settings.phones[0]?.href,
    email: settings.email,
    address: settings.address,
    zaloHref: settings.zaloHref,
    messengerHref: settings.messengerHref,
    domain: settings.email.split('@')[1],
  };
  return text.replace(/\{\{site\.(\w+)\}\}/g, (token, key: string) => {
    const value = values[key];
    if (value === undefined) return token;
    return html ? escapeHtml(value) : value;
  });
}
