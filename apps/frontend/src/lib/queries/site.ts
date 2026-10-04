import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import { pathForRouteId, resolvePath } from '@/lib/routes';
import type { Locale, Navigation, RouteEntry, ShellContent, SiteSettings } from '@/types/content';
import { resolveDeep } from './tokens';

const resolveSettings = (settings: SiteSettings) =>
  JSON.stringify(settings).includes('{{site.') ? resolveDeep(settings, settings) : settings;

export async function getSiteSettings(locale: Locale): Promise<SiteSettings> {
  return resolveSettings(await getRepository().getSiteSettings(locale));
}

/** Everything SiteShell needs for a locale. The repository is injectable so the dev fixture page runs this same path. */
export async function getShellProps(locale: Locale, repo: ContentRepository = getRepository()) {
  const [rawSettings, navigation, routes, vi, en] = await Promise.all([
    repo.getSiteSettings(locale),
    repo.getNavigation(locale),
    repo.listRoutes(),
    repo.getShellContent('vi'),
    repo.getShellContent('en'),
  ]);
  const settings = resolveSettings(rawSettings);
  const [logoAsset = null] = await repo.getAssets(settings.logoIds);
  const cta = (shell: ShellContent, fallback: string) => ({
    label: shell.headerCta.label,
    href: pathForRouteId(routes, shell.headerCta.routeId) ?? fallback,
  });
  return {
    locale,
    settings,
    navigation,
    routes,
    logoAsset,
    shellContent: locale === 'en' ? en : vi,
    headerCtas: { vi: cta(vi, '/lien-he/'), en: cta(en, '/en/contact-us/') },
    counterparts: buildCounterpartMap(routes, locale),
  };
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

