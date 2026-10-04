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

/** Every string resolved; `html` fields are HTML-escaped, the rest (labels, hrefs) are not. */
export function resolveDeep<T>(value: T, settings: SiteSettings, html = false): T {
  if (typeof value === 'string') return resolveSiteTokens(value, settings, html) as T;
  if (Array.isArray(value)) return value.map((v) => resolveDeep(v, settings)) as T;
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, resolveDeep(v, settings, k === 'html')]),
    ) as T;
  return value;
}
