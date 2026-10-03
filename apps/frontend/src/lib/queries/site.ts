import { getRepository } from '@/lib/repositories';
import type { Locale, Navigation, RouteEntry, SiteSettings } from '@/types/content';

export function getSiteSettings(locale: Locale): Promise<SiteSettings> {
  return getRepository().getSiteSettings(locale);
}

export function getNavigation(locale: Locale): Promise<Navigation> {
  return getRepository().getNavigation(locale);
}

export function listRoutes(): Promise<RouteEntry[]> {
  return getRepository().listRoutes();
}
