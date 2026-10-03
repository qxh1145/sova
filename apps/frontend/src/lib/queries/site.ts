import { getRepository } from '@/lib/repositories';
import { resolvePath } from '@/lib/routes';
import type { Locale, Navigation, RouteEntry, SiteSettings } from '@/types/content';
import { resolveDeep } from './tokens';

/** `value` with `{{site.*}}` tokens resolved; SiteSettings is read only when a token is present. */
export async function withSiteTokens<T>(value: T, locale: Locale): Promise<T> {
  if (!JSON.stringify(value).includes('{{site.')) return value;
  return resolveDeep(value, await getRepository().getSiteSettings(locale));
}

export async function getSiteSettings(locale: Locale): Promise<SiteSettings> {
  const settings = await getRepository().getSiteSettings(locale);
  return JSON.stringify(settings).includes('{{site.') ? resolveDeep(settings, settings) : settings;
}

export async function getNavigation(locale: Locale): Promise<Navigation> {
  return withSiteTokens(await getRepository().getNavigation(locale), locale);
}

export function listRoutes(): Promise<RouteEntry[]> {
  return getRepository().listRoutes();
}

export async function resolveRoute(path: string) {
  return resolvePath(await listRoutes(), path);
}
