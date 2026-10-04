import { getRepository } from '@/lib/repositories';
import { resolvePath } from '@/lib/routes';
import type { Locale, Navigation, RouteEntry, SiteSettings } from '@/types/content';
import { resolveDeep } from './tokens';

export async function getSiteSettings(locale: Locale): Promise<SiteSettings> {
  const settings = await getRepository().getSiteSettings(locale);
  return JSON.stringify(settings).includes('{{site.') ? resolveDeep(settings, settings) : settings;
}

export function getNavigation(locale: Locale): Promise<Navigation> {
  return getRepository().getNavigation(locale);
}

export function listRoutes(): Promise<RouteEntry[]> {
  return getRepository().listRoutes();
}

export async function resolveRoute(path: string) {
  return resolvePath(await listRoutes(), path);
}
