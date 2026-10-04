import { getRepository } from '@/lib/repositories';
import { resolvePath } from '@/lib/routes';
import type { Locale, Navigation, RouteEntry, ShellContent, SiteSettings } from '@/types/content';
import { resolveDeep } from './tokens';

export async function getSiteSettings(locale: Locale): Promise<SiteSettings> {
  const settings = await getRepository().getSiteSettings(locale);
  return JSON.stringify(settings).includes('{{site.') ? resolveDeep(settings, settings) : settings;
}

export function getNavigation(locale: Locale): Promise<Navigation> {
  return getRepository().getNavigation(locale);
}

export function getShellContent(locale: Locale): Promise<ShellContent> {
  return getRepository().getShellContent(locale);
}

export function listRoutes(): Promise<RouteEntry[]> {
  return getRepository().listRoutes();
}

/** Builds a pathname -> counterpart pathname map for a given locale from a routes list. */
export function buildCounterpartMap(routes: RouteEntry[], locale: Locale): Record<string, string> {
  const map: Record<string, string> = {};
  const byId = new Map(routes.map((r) => [r.id, r]));
  for (const r of routes) {
    if (r.locale === locale && r.counterpartId) {
      const counterpart = byId.get(r.counterpartId);
      if (counterpart) {
        map[r.path] = counterpart.path;
      }
    }
  }
  return map;
}

export async function getCounterpartMap(locale: Locale): Promise<Record<string, string>> {
  return buildCounterpartMap(await listRoutes(), locale);
}

export async function resolveRoute(path: string) {
  return resolvePath(await listRoutes(), path);
}

