// Guards the committed importer output (the importer itself cannot run in CI).
import { expect, test } from 'vitest';
import { BRAND_LEAK_RE } from '@/lib/content/brand';
import { SCRUB_RULES } from '@/lib/content/scrub';
import type { NavigationItem } from '@/types/content';
import { listingSettings } from './listings';
import { navigation } from './navigation';
import { aboutPages } from './pages/about';
import { contactPages } from './pages/contact';
import { homePages } from './pages/home';
import { legalPages, paymentGuides } from './pages/legal';
import { profiles } from './pages/profile';
import { routes } from './routes';
import { stats } from './stats';

// ROUTE_MAP excluded families (docs/ is gitignored, so not read from routes.json).
const EXCLUDED =
  /^\/(?:en\/)?(?:tuyen-dung|giai-phap-truyen-thong-so|digital-communications-solutions)\//;
const flatten = (items: NavigationItem[]): NavigationItem[] =>
  items.flatMap((i) => [i, ...flatten(i.children ?? [])]);

test('every internal destination resolves in routes and none is an excluded path', () => {
  const byId = new Map(routes.map((r) => [r.id, r]));
  for (const nav of navigation) {
    const items = flatten([
      ...nav.header,
      ...nav.mobile,
      ...nav.footerGroups.flatMap((g) => g.items),
      ...nav.serviceOptions,
    ]);
    for (const item of items) {
      if (item.destination?.kind !== 'internal') continue;
      const route = byId.get(item.destination.routeId);
      expect(route, item.id).toBeDefined();
      expect(route!.path).not.toMatch(EXCLUDED);
    }
  }
});

test('12 header links and 6 service options per locale, each option a service page', () => {
  expect(navigation.map((n) => n.locale).sort()).toEqual(['en', 'vi']);
  for (const nav of navigation) {
    expect(flatten(nav.header).filter((i) => i.destination)).toHaveLength(12);
    expect(nav.mobile).toEqual(nav.header);
    expect(nav.footerGroups.map((g) => g.id)).toEqual([
      'footer-about',
      'footer-service',
      'footer-quick-links',
    ]);
    expect(nav.serviceOptions).toHaveLength(6);
    for (const option of nav.serviceOptions) {
      const routeId = option.destination?.kind === 'internal' ? option.destination.routeId : '';
      expect(routes.find((r) => r.id === routeId)?.kind, option.id).toBe('service');
    }
  }
});

test('page records: one per page route, 4 shared stats per locale', () => {
  const pathsOf = (kind: string) =>
    routes
      .filter((r) => r.kind === kind)
      .map((r) => r.path)
      .sort();
  const paths = (list: { path: string }[]) => list.map((p) => p.path).sort();
  expect(paths(homePages)).toEqual(pathsOf('home'));
  expect(paths(aboutPages)).toEqual(pathsOf('about'));
  expect(paths(contactPages)).toEqual(pathsOf('contact'));
  expect(paths([...legalPages, ...paymentGuides])).toEqual(pathsOf('legal'));
  expect(paths(profiles)).toEqual(pathsOf('profile'));
  expect(listingSettings.map((l) => l.routeId).sort()).toEqual(
    routes
      .filter((r) => r.kind === 'post-list' || r.kind === 'project-list')
      .map((r) => r.id)
      .sort(),
  );
  const statIds = new Set(stats.map((s) => s.id));
  expect(statIds.size).toBe(8);
  for (const page of [...homePages, ...aboutPages]) {
    expect(page.statIds).toEqual(
      ['clients', 'projects', 'members', 'years'].map((k) => `stat-${k}-${page.locale}`),
    );
    for (const id of page.statIds) expect(statIds).toContain(id);
  }
  for (const guide of paymentGuides)
    for (const account of guide.accounts) {
      expect(account.accountNumber).toBe('0000000000');
      expect(account.qrAssetId).toBeUndefined();
    }
});

test('no Eras word or raw Eras contact value in page, stat, listing or navigation text', () => {
  // Source refs are provenance and public paths come from the route registry: neither is text.
  const text = routes.reduce(
    (acc, r) => acc.replaceAll(`"${r.path}"`, '""').replaceAll(`"${r.id}"`, '""'),
    JSON.stringify(
      {
        homePages,
        aboutPages,
        contactPages,
        legalPages,
        paymentGuides,
        profiles,
        stats,
        listingSettings,
        navigation,
      },
      (key, value) => (key === 'sources' ? undefined : value),
    ),
  );
  expect([...text.matchAll(BRAND_LEAK_RE)].map((m) => m[0])).toEqual([]);
  expect(text.match(/\bERAS\b/g)).toBeNull();
  for (const [pattern] of SCRUB_RULES) expect(text.match(pattern)).toBeNull();
});
