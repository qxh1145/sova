import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { EntityId, PublicPath, RouteEntry } from '../../src/types/content.ts';
import { validateRoutes } from '../../src/lib/routes.ts';
import { load } from './projects.ts';

const EXPECTED_RETAINED = 147;
// Source hreflang pairs: home, about, faq, contact, profile, 8 services, 5 legal, du-an, goc-nhin.
const EXPECTED_PAIRS = 20;
const LOGIN = {
  path: '/login-eras/',
  source: 'login-eras/index__q_6b334f548d36.html',
} as const;
/** ROUTE_MAP alias table: alias -> canonical path. */
const ALIASES: Record<PublicPath, PublicPath> = {
  '/en/': '/en/home/',
  '/ui-ux-branding-design-2/': '/en/ui-ux-branding-design-2/',
  '/en/ui-ux-branding-design/': '/ui-ux-branding-design/',
  '/porfolio-eras-vietnam/': '/en/porfolio-eras-vietnam/',
  '/dang-ky-nghi-phep/': LOGIN.path,
};
const KINDS: Record<string, RouteEntry['kind']> = {
  home: 'home',
  about: 'about',
  faq: 'faq',
  contact: 'contact',
  profile: 'profile',
  'thank-you': 'thank-you',
  sample: 'sample',
  'post-detail': 'post-detail',
  'project-detail': 'project-detail',
  content: 'legal',
  projects: 'project-list',
  blog: 'post-list',
  ...Object.fromEntries(
    ['website', 'seo', 'mobile', 'branding', 'email', 'hosting', 'vps', 'storage'].map((k) => [
      k,
      'service' as const,
    ]),
  ),
};

interface Row {
  route: PublicPath;
  source: string;
  composition: string;
  disposition: 'retained' | 'excluded';
}
type EntityRef = { id: EntityId; path: PublicPath };

/** Registry route id of a public path (`/a/b/` -> `route-a--b`). */
export const routeId = (p: string) =>
  p === '/' ? 'route-root' : `route-${p.split('/').filter(Boolean).join('--')}`;

/** Source href (relative to `file`) -> public folder path; `index.mirror-*.html` counts as its folder. */
function folderPath(href: string, file: string): PublicPath {
  const target = path.posix.join(path.posix.dirname(file), href);
  const dir = path.posix.dirname(target);
  return dir === '.' ? '/' : `/${dir}/`;
}

export function importRoutes(
  docsDir: string,
  erasDir: string,
  records: {
    posts: (EntityRef & { slug: string })[];
    projects: (EntityRef & { slug: string })[];
    postCategories: EntityRef[];
    projectCategories: EntityRef[];
    services: EntityRef[];
  },
): RouteEntry[] {
  const rows: Row[] = JSON.parse(readFileSync(path.join(docsDir, 'evidence/routes.json'), 'utf8'));
  const retained = rows.filter((r) => r.disposition === 'retained');
  if (retained.length !== EXPECTED_RETAINED)
    throw new Error(
      `routes.json: ${retained.length} retained routes, expected ${EXPECTED_RETAINED}`,
    );

  const entityByPath = new Map<string, EntityId>(
    Object.values(records)
      .flat()
      .map((r) => [r.path, r.id]),
  );
  const paths = new Set<string>(retained.map((r) => r.route));
  const routes: RouteEntry[] = retained.map((row) => {
    const kind = KINDS[row.composition];
    if (!kind)
      throw new Error(`routes.json: ${row.route} has unknown composition ${row.composition}`);
    const entityId = entityByPath.get(row.route);
    if (!entityId && (kind === 'post-detail' || kind === 'project-detail'))
      throw new Error(`${row.source}: ${kind} route has no imported record`);
    const locale = row.route.startsWith('/en/') ? 'en' : 'vi';
    const counterpart = load(erasDir, row.source)
      .root.querySelectorAll('link[rel="alternate"][hreflang]')
      .filter((link) => link.getAttribute('hreflang') !== locale)
      .map((link) => folderPath(link.getAttribute('href') ?? '', row.source))
      .find((p) => paths.has(p));
    return {
      id: routeId(row.route),
      locale,
      path: row.route,
      kind,
      ...(entityId && { entityId }),
      ...(counterpart && { counterpartId: routeId(counterpart) }),
      aliases: [],
      source: { file: row.source, line: 1 },
    };
  });
  routes.push({
    id: routeId(LOGIN.path),
    locale: 'vi',
    path: LOGIN.path,
    kind: 'login',
    aliases: [],
    source: { file: LOGIN.source, line: 1 },
  });

  for (const [alias, target] of Object.entries(ALIASES) as [PublicPath, PublicPath][]) {
    const route = routes.find((r) => r.path === target);
    if (!route) throw new Error(`routes: alias ${alias} targets missing route ${target}`);
    route.aliases.push(alias);
  }
  for (const r of [...records.posts, ...records.projects])
    if (!routes.some((route) => route.path === r.path))
      throw new Error(`routes: record ${r.id} (${r.path}) has no route`);
  const pairs = routes.filter((r) => r.counterpartId && r.locale === 'vi').length;
  if (pairs !== EXPECTED_PAIRS)
    throw new Error(`routes: ${pairs} hreflang pairs, expected ${EXPECTED_PAIRS}`);

  routes.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  for (const r of routes) r.aliases.sort();
  validateRoutes(routes, {
    postSlugs: records.posts.map((p) => p.slug),
    projectSlugs: records.projects.map((p) => p.slug),
  });
  return routes;
}
