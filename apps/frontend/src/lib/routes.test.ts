import { expect, test } from 'vitest';
import { posts } from '@/data/posts';
import { projects } from '@/data/projects';
import { routes } from '@/data/routes';
import type { RouteEntry } from '@/types/content';
import { normalizePath, reservedRootSlugs, resolvePath, validateRoutes } from './routes';

const slugs = { postSlugs: posts.map((p) => p.slug), projectSlugs: projects.map((p) => p.slug) };
// The 16 `excluded` rows of docs/evidence/routes.json (docs/ is not committed).
const EXCLUDED = [
  '/en/digital-communications-solutions/',
  '/giai-phap-truyen-thong-so/',
  '/en/tuyen-dung/',
  '/tuyen-dung/',
  ...[
    'content-marketing-intern',
    'marketing-advertising-specialist',
    'php-developer-intern',
    'php-software-engineer',
    'sales-executive',
    'videographer-video-editor',
  ].map((s) => `/en/tuyen-dung/${s}/`),
  ...[
    'chuyen-vien-kinh-doanh',
    'chuyen-vien-lap-trinh-php',
    'chuyen-vien-quang-cao-marketing',
    'nhan-vien-quay-dung-video-editor',
    'thuc-tap-sinh-content-marketing',
    'thuc-tap-sinh-lap-trinh-php',
  ].map((s) => `/tuyen-dung/${s}/`),
];

const route = (path: string, extra: Partial<RouteEntry> = {}): RouteEntry => ({
  id: `route-${path}`,
  locale: path.startsWith('/en/') ? 'en' : 'vi',
  path: path as RouteEntry['path'],
  kind: 'about',
  aliases: [],
  source: { file: 'x/index.html', line: 1 },
  ...extra,
});
const noSlugs = { postSlugs: [], projectSlugs: [] };

test('registry: 148 entries, trailing slashes, unique ids, valid', () => {
  expect(routes).toHaveLength(148);
  expect(routes.every((r) => r.path.endsWith('/'))).toBe(true);
  expect(new Set(routes.map((r) => r.id)).size).toBe(routes.length);
  expect(() => validateRoutes(routes, slugs)).not.toThrow();
  expect(routes.find((r) => r.path === '/login-eras/')).toMatchObject({
    id: 'route-login-eras',
    kind: 'login',
    aliases: ['/dang-ky-nghi-phep/'],
    source: { file: 'login-eras/index__q_6b334f548d36.html', line: 1 },
  });
});

test('every canonical path and alias resolves without chains', () => {
  for (const r of routes) {
    expect(resolvePath(routes, r.path)).toEqual({ route: r, redirect: false });
    for (const a of r.aliases) {
      expect(resolvePath(routes, a)).toEqual({ route: r, redirect: true });
      expect(routes.some((other) => other.path === a)).toBe(false);
    }
  }
});

test('excluded and missing-content paths are neither routes nor aliases', () => {
  expect(EXCLUDED).toHaveLength(16);
  for (const p of [...EXCLUDED, '/cloud-vps/', '/mat-khau-an-toan/'])
    expect(resolvePath(routes, p)).toBeNull();
});

test('EN routes: no /en + VI path, counterparts are mutual', () => {
  const paths = new Set(routes.map((r) => r.path));
  const byId = new Map(routes.map((r) => [r.id, r]));
  for (const r of routes) {
    if (r.locale === 'en') expect(paths.has(r.path.slice(3) as RouteEntry['path'])).toBe(false);
    if (r.counterpartId) expect(byId.get(r.counterpartId)?.counterpartId).toBe(r.id);
  }
  expect(byId.get('route-du-an')?.counterpartId).toBe('route-en--our-project');
  expect(byId.get('route-goc-nhin')?.counterpartId).toBe('route-en--insight');
});

test('I/O matrix: canonical, no slash + query + hash, alias, unknown', () => {
  expect(resolvePath(routes, '/gioi-thieu/')).toMatchObject({
    route: { id: 'route-gioi-thieu' },
    redirect: false,
  });
  expect(resolvePath(routes, '/goc-nhin?s=x#a')).toMatchObject({
    route: { path: '/goc-nhin/' },
    redirect: true,
  });
  expect(resolvePath(routes, '/en/')).toMatchObject({
    route: { path: '/en/home/' },
    redirect: true,
  });
  expect(resolvePath(routes, '/login-eras/?redirect_to=x')).toMatchObject({
    route: { kind: 'login' },
    redirect: false,
  });
  expect(resolvePath(routes, '/?s=x')).toMatchObject({
    route: { id: 'route-root' },
    redirect: false,
  });
  expect(resolvePath(routes, '/cloud-vps/')).toBeNull();
  expect(resolvePath(routes, '/tuyen-dung/')).toBeNull();
  expect(normalizePath('goc-nhin')).toBe('/goc-nhin/');
});

test('reserved root slugs cover non-[slug] roots and aliases, not post categories', () => {
  const reserved = reservedRootSlugs(routes);
  for (const s of ['en', 'goc-nhin', 'du-an', 'featured_item', 'featured_item_category'])
    expect(reserved).toContain(s);
  for (const s of ['login-eras', 'lien-he', 'dang-ky-nghi-phep', 'porfolio-eras-vietnam'])
    expect(reserved).toContain(s);
  for (const s of ['social-marketing', 'thu-thuat', ...slugs.postSlugs])
    expect(reserved).not.toContain(s);
});

test('validateRoutes rejects crafted registries', () => {
  expect(() => validateRoutes([route('/a/', { aliases: ['/b/'] }), route('/b/')], noSlugs)).toThrow(
    '/b/',
  );
  expect(() =>
    validateRoutes(
      [route('/a/', { aliases: ['/c/'] }), route('/b/', { aliases: ['/c/'] })],
      noSlugs,
    ),
  ).toThrow('/c/');
  expect(() =>
    validateRoutes([route('/lien-he/', { kind: 'contact' })], {
      postSlugs: ['lien-he'],
      projectSlugs: [],
    }),
  ).toThrow('lien-he');
  expect(() =>
    validateRoutes([route('/lien-he/', { kind: 'contact' })], {
      postSlugs: [],
      projectSlugs: ['lien-he'],
    }),
  ).toThrow('lien-he');
  expect(() => validateRoutes([route('/gioi-thieu/'), route('/en/gioi-thieu/')], noSlugs)).toThrow(
    '/en/gioi-thieu/',
  );
  expect(() =>
    validateRoutes([route('/a/', { counterpartId: 'route-/en/b/' }), route('/en/b/')], noSlugs),
  ).toThrow('not mutual');
  expect(() =>
    validateRoutes(
      [
        route('/featured_item_category/', { kind: 'post-list', entityId: 'post-category-x' }),
        route('/featured_item_category/website/', { kind: 'project-list' }),
      ],
      noSlugs,
    ),
  ).toThrow('featured_item_category');
});
