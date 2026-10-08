// Pure route registry helpers. Relative imports only: the importer loads this with Node type stripping.
import type { Locale, NavigationItem, PublicPath, RouteEntry } from '../types/content.ts';

/** Drops query and hash, adds the leading and trailing slash. */
export function normalizePath(input: string): PublicPath {
  const bare = input.split(/[?#]/, 1)[0];
  const lead = bare.startsWith('/') ? bare : `/${bare}`;
  return (lead.endsWith('/') ? lead : `${lead}/`) as PublicPath;
}

const firstSegment = (path: string) => path.split('/')[1];
export const pathSegments = (path: string): string[] => path.split('/').filter(Boolean);

/**
 * Validates and parses a 1-based page path parameter.
 * Returns the page number (>= 2) or null if invalid or < 2.
 */
export function parsePageParam(pageStr: string): number | null {
  if (!/^[1-9]\d*$/.test(pageStr)) return null;
  const pageNum = parseInt(pageStr, 10);
  return pageNum >= 2 ? pageNum : null;
}

export const categorySlugs = (routes: RouteEntry[]) =>
  routes
    .filter((r) => r.kind === 'post-list' && r.entityId && r.path.split('/').length === 3)
    .map((r) => firstSegment(r.path));

/**
 * Root slugs the `[slug]` resolver must not hand to a post or category: the first segment of
 * every canonical path it does not own (all but post details and post-category listings and
 * their pages) plus the first segment of every alias.
 */
export function reservedRootSlugs(routes: RouteEntry[]): string[] {
  const categories = new Set(categorySlugs(routes));
  const owned = (r: RouteEntry) =>
    r.kind === 'post-detail' || (r.kind === 'post-list' && categories.has(firstSegment(r.path)));
  const slugs = routes.flatMap((r) => [
    ...(owned(r) ? [] : [firstSegment(r.path)]),
    ...r.aliases.map(firstSegment),
  ]);
  return [...new Set(slugs.filter(Boolean))].sort();
}

/** Throws on the first broken registry rule, naming the offending path, id or slug. */
export function validateRoutes(
  routes: RouteEntry[],
  { postSlugs, projectSlugs }: { postSlugs: string[]; projectSlugs: string[] },
): void {
  const byId = new Map<string, RouteEntry>();
  const paths = new Set<string>();
  for (const r of routes) {
    if (byId.has(r.id)) throw new Error(`routes: duplicate id ${r.id}`);
    byId.set(r.id, r);
    if (normalizePath(r.path) !== r.path) throw new Error(`routes: path ${r.path} not normalized`);
    if (paths.has(r.path)) throw new Error(`routes: duplicate path ${r.path}`);
    paths.add(r.path);
    if (r.locale !== (r.path.startsWith('/en/') ? 'en' : 'vi'))
      throw new Error(`routes: ${r.path} has locale ${r.locale}`);
  }
  const aliases = new Set<string>();
  for (const r of routes)
    for (const a of r.aliases) {
      if (normalizePath(a) !== a) throw new Error(`routes: alias ${a} not normalized`);
      if (paths.has(a)) throw new Error(`routes: alias ${a} is a canonical path`);
      if (aliases.has(a)) throw new Error(`routes: alias ${a} appears twice`);
      aliases.add(a);
    }
  for (const r of routes) {
    if (r.locale === 'en' && paths.has(r.path.slice(3)))
      throw new Error(`routes: ${r.path} is /en + VI path ${r.path.slice(3)}`);
    if (!r.counterpartId) continue;
    const other = byId.get(r.counterpartId);
    if (!other || other.locale === r.locale || other.counterpartId !== r.id)
      throw new Error(`routes: ${r.path} counterpart ${r.counterpartId} is not mutual`);
  }
  const reserved = new Set(reservedRootSlugs(routes));
  for (const [label, slugs] of [
    ['post', postSlugs],
    ['project', projectSlugs],
    ['post category', categorySlugs(routes)],
  ] as const)
    for (const slug of slugs)
      if (reserved.has(slug))
        throw new Error(`routes: ${label} slug ${slug} is a reserved root slug`);
}

/** `redirect` is true when the input path (query and hash aside) was not canonical: slash or alias. */
export function resolvePath(
  routes: RouteEntry[],
  path: string,
): { route: RouteEntry; redirect: boolean } | null {
  const normalized = normalizePath(path);
  const route = routes.find((r) => r.path === normalized);
  if (route) return { route, redirect: normalized !== path.split(/[?#]/, 1)[0] };
  const aliased = routes.find((r) => r.aliases.includes(normalized));
  return aliased ? { route: aliased, redirect: true } : null;
}

/** Looks up a route by its entity id and returns its canonical public path. */
export function pathForRouteId(routes: RouteEntry[], id: string): PublicPath | undefined {
  return routes.find((r) => r.id === id)?.path;
}

/** Href for a navigation destination; undefined when the item has none. */
export function resolveDestination(
  destination: NavigationItem['destination'],
  routes: RouteEntry[],
): string | undefined {
  if (!destination) return undefined;
  if (destination.kind === 'internal') {
    return pathForRouteId(routes, destination.routeId) ?? '#';
  }
  if (destination.kind === 'external') {
    return destination.href;
  }
  return destination.hash;
}

/** Locale home path, falling back to the known home paths when the registry lacks them. */
export function homeHref(routes: RouteEntry[], locale: Locale): string {
  const id = locale === 'en' ? 'route-en--home' : 'route-root';
  return pathForRouteId(routes, id) ?? (locale === 'en' ? '/en/home/' : '/');
}
