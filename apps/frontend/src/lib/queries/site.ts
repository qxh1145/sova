import type { Metadata } from 'next';
import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import { buildCounterpartMap, pathForRouteId, resolvePath } from '@/lib/routes';
import type { Locale, Navigation, PublicPath, RouteEntry, SEO, ShellContent, SiteSettings } from '@/types/content';
import { resolveDeep } from './tokens';

export const BRAND_TITLE_SUFFIX = ' - Công ty thiết kế website chuyên nghiệp | Sova';

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
  const viCta = cta(vi, '/lien-he/');
  const enCta = cta(en, '/en/contact-us/');
  return {
    locale,
    settings,
    navigation,
    routes,
    logoAsset,
    shellContent: locale === 'en' ? en : vi,
    headerCtas: {
      vi: locale === 'en' ? { ...viCta, href: enCta.href } : viCta,
      en: enCta,
    },
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

export async function getCounterpartMap(locale: Locale): Promise<Record<string, string>> {
  return buildCounterpartMap(await listRoutes(), locale);
}

export async function resolveRoute(path: string) {
  return resolvePath(await listRoutes(), path);
}

export async function routeAlternates(path: PublicPath): Promise<Metadata['alternates']> {
  const routes = await listRoutes();
  const entry = routes.find((r) => r.path === path);
  if (!entry) return { canonical: path };
  const other = buildCounterpartMap(routes, entry.locale)[path];
  const otherLocale = entry.locale === 'vi' ? 'en' : 'vi';
  return { canonical: path, languages: { [entry.locale]: path, ...(other && { [otherLocale]: other }) } };
}

export async function seoMetadata(seo: SEO): Promise<Metadata> {
  const alternates = await routeAlternates(seo.canonicalPath);
  return {
    title: seo.title,
    ...(seo.description && { description: seo.description }),
    alternates,
    ...(seo.noIndex && { robots: { index: false, follow: true } }),
  };
}
