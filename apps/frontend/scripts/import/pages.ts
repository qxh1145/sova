import type { AssetRegistry } from './assets.ts';
import type { AssetRef, RouteEntry, Stat } from '../../src/types/content.ts';
import type { Stats } from './html.ts';
import { load } from './projects.ts';
import { count, EXPECTED, must, readStats, type Page, type PageRefs } from './pages/shared.ts';
import { home } from './pages/home.ts';
import { about } from './pages/about.ts';
import { contact } from './pages/contact.ts';
import { legal, payment } from './pages/legal.ts';
import { profile } from './pages/profile.ts';
import { faqPage } from './pages/faq.ts';
import { listing } from './pages/listing.ts';
import { login, sample, thankYou } from './pages/utility.ts';

export type { PageRefs } from './pages/shared.ts';
export { matchServiceByTitle, readStats, resolveServiceCard } from './pages/shared.ts';
export { faqPage } from './pages/faq.ts';
export { contact } from './pages/contact.ts';

export function importPages(
  erasDir: string,
  registry: AssetRegistry,
  stats: Stats,
  refs: PageRefs,
) {
  const pages = (kind: RouteEntry['kind']) =>
    refs.routes
      .filter((r) => r.kind === kind)
      .map((route): Page & { source: string } => {
        const { source, root, lineOf } = load(erasDir, route.source.file);
        const wpId = /\bpage-id-(\d+)\b/.exec(
          /<body[^>]*\sclass="([^"]*)"/.exec(source)?.[1] ?? '',
        )?.[1];
        return { route, file: route.source.file, root, lineOf, wpId, source };
      });
  // Legal pairs share a translation key: the VI path slug.
  const pairKey = (route: RouteEntry) => {
    const vi =
      route.locale === 'vi' ? route : refs.routes.find((r) => r.id === route.counterpartId);
    return `legal-${(vi ?? route).path.split('/').at(-2)}`;
  };

  const homePages = pages('home').map((p) => home(p, registry, stats, refs));
  const aboutPages = pages('about').map((p) => about(p, registry, stats));
  const statRecords = pages('home').flatMap((p) =>
    readStats(p.root, p.file, p.route.locale, stats),
  );
  // A01: About shows the same counters as Home, so it references the shared records.
  // Label case may differ (EN "Team Members" vs "Team members"): logged, the home label is kept.
  for (const p of pages('about')) {
    const key = (list: Stat[]) =>
      JSON.stringify(list.map((s) => ({ ...s, label: s.label.toLowerCase() })));
    const own = readStats(p.root, p.file, p.route.locale, stats);
    const shared = statRecords.filter((s) => s.id.endsWith(`-${p.route.locale}`));
    if (key(own) !== key(shared))
      throw new Error(`Source drift: ${p.file} stats differ from the home stats`);
    own.forEach((s, i) => {
      if (s.label !== shared[i].label)
        console.log(
          `source oddity ${p.file}: stat label "${s.label}" vs home "${shared[i].label}" (home kept)`,
        );
    });
  }

  const legalRoutes = count(
    pages('legal'),
    EXPECTED.legalRoutes,
    { file: 'routes' } as Page,
    'legal routes',
  );
  const isPayment = (p: Page) => !!p.root.querySelector('#content .row-collapse.align-middle');
  const legalPages = legalRoutes
    .filter((p) => !isPayment(p))
    .map((p) => legal(p, registry, stats, pairKey(p.route)));
  const paymentGuides = legalRoutes
    .filter(isPayment)
    .map((p) => payment(p, registry, stats, pairKey(p.route)));

  // The Sova wordmark (SiteSettings.logoIds) takes the source logo slot; no file exists yet.
  const homeVi = pages('home').find((p) => p.route.locale === 'vi')!;
  const logo = must(homeVi.root.querySelector('#logo img'), homeVi, 'header logo');
  const wordmark: AssetRef = {
    id: 'asset-sova-wordmark',
    src: '/sova-wordmark.svg',
    alt: 'Sova',
    kind: 'image',
    status: 'missing',
    sources: [{ file: homeVi.file, line: homeVi.lineOf(logo.range[0]) }],
  };

  return {
    homePages,
    aboutPages,
    contactPages: pages('contact').map((p) => contact(p, registry, stats)),
    legalPages,
    paymentGuides,
    profiles: pages('profile').map((p) => profile(p, registry, stats)),
    faqPages: pages('faq').map((p) => faqPage(p, registry, stats)),
    stats: statRecords,
    listingSettings: [...pages('post-list'), ...pages('project-list')].map((p) =>
      listing(p, registry, stats),
    ),
    thankYou: pages('thank-you').map((p) => thankYou(p, registry, stats)),
    sample: pages('sample').map((p) => sample(p, registry, stats)),
    login: pages('login').map((p) => login(p, registry, stats)),
    wordmark,
  };
}
