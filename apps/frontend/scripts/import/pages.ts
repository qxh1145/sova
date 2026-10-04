import { HTMLElement, TextNode, type Node } from 'node-html-parser';
import type {
  AboutPageRecord,
  AssetRef,
  CollectionPlacement,
  CompanyProfileContent,
  ContactPageContent,
  EntityId,
  Feature,
  HomePageRecord,
  LegalPage,
  ListingSettings,
  Locale,
  OfferingPanel,
  PaymentGuideContent,
  PublicPath,
  RichContent,
  RouteEntry,
  SectionCopy,
  SEO,
  SourceRef,
  Stat,
} from '../../src/types/content.ts';
import { applyBrandTerms, BRAND_LEAK_RE } from '../../src/lib/content/brand.ts';
import { ALLOWED, processHref, processText, sanitize, type Stats } from './html.ts';
import type { AssetRegistry } from './assets.ts';
import { slug } from './faq.ts';
import { ERAS_URL_TEXT } from './posts.ts';
import { load, projectSlug } from './projects.ts';
import { linkModel, plain, sectionCopy, trimBreaks } from './services.ts';
import { imageStem, readSlides } from './social.ts';

const STAT_KEYS = ['clients', 'projects', 'members', 'years'];
const EXPECTED = { goals: 6, purpose: 4, timeline: 9, capabilities: 3, legalRoutes: 10 };
const RICH_ALLOWED: ReadonlySet<string> = new Set([...ALLOWED, 'h2', 'h3', 'h4', 'h5', 'h6']);
/** Q1: real payment accounts and QR codes are not imported; these placeholders stand in. */
const DEMO_ACCOUNT: Record<Locale, { bank: string; holder: string; accountNumber: string }> = {
  vi: { bank: 'Ngân hàng Demo', holder: 'SOVA DEMO', accountNumber: '0000000000' },
  en: { bank: 'Demo Bank', holder: 'SOVA DEMO', accountNumber: '0000000000' },
};
/** The account holder named in the e-wallet steps: replaced by the demo holder (Q1). */
const HOLDER_NAME = /V[ŨU] H[ỒO]NG D[ŨU]NG/gi;
/** Bare uppercase ERAS naming the company in legal copy (the shared brand map keeps it for asset names). */
const BARE_ERAS = /(?<![\p{L}\p{N}_-])ERAS(?![\p{L}\p{N}_-])/gu;
/** Source typo with no space after the brand ("yêu cầu ERASkhuyến nghị"). */
const ERAS_TYPO = /ERASkhuyến/gu;

export interface PageRefs {
  routes: RouteEntry[];
  projectIdBySlug: Map<string, EntityId>;
  postIdBySlug: Map<string, EntityId>;
  services: { id: EntityId; path: PublicPath }[];
  partnerIds: Set<EntityId>;
}

interface Page {
  route: RouteEntry;
  file: string;
  root: HTMLElement;
  lineOf: (offset: number) => number;
  wpId?: string;
}

const placements = (ids: EntityId[]): CollectionPlacement[] =>
  ids.map((entityId, i) => ({ entityId, order: i + 1 }));

const rich = (html: string, sources: SourceRef[], assetIds: EntityId[] = []): RichContent => ({
  format: 'sanitized-html',
  html,
  assetIds,
  sources,
});

/** Text and href hooks of the shared pipeline; Eras URLs written as text keep their path. */
function hooks(page: Page, line: number, stats: Stats) {
  return {
    text: (raw: string) =>
      processText(raw, stats)
        .replace(ERAS_URL_TEXT, (_, urlPath?: string) =>
          !urlPath || urlPath === '/' ? '{{site.domain}}' : urlPath,
        )
        .replace(HOLDER_NAME, DEMO_ACCOUNT[page.route.locale].holder)
        .replace(BARE_ERAS, () => {
          stats.brand++;
          return 'Sova';
        })
        .replace(ERAS_TYPO, () => {
          stats.brand++;
          return 'Sova khuyến';
        }),
    href: (raw: string) => {
      const href = processHref(raw, page.file, line, stats);
      // A third-party URL naming the Eras brand (e.g. its fanpage) is unwrapped to its text.
      if (href && href.match(BRAND_LEAK_RE)) {
        console.log(`link ${page.file}:${line} ${raw} -> (unwrapped, brand URL)`);
        return null;
      }
      return href;
    },
  };
}

function seoOf(page: Page, registry: AssetRegistry, stats: Stats): SEO {
  const { root, file, lineOf, route } = page;
  const og = root.querySelector('meta[property="og:image"]');
  const description = root.querySelector('meta[name="description"]')?.getAttribute('content');
  return {
    title: processText(root.querySelector('title')?.rawText ?? '', stats).trim(),
    description: description ? processText(description, stats).trim() : undefined,
    canonicalPath: route.path,
    imageId: og
      ? registry.add(
          og.getAttribute('content'),
          { kind: 'image' },
          { file, line: lineOf(og.range[0]) },
        )?.id
      : undefined,
  };
}

/** LocalizedIdentity of a page; `title` defaults to the SEO title before its site suffix. */
function identity(page: Page, id: string, seo: SEO, line: number, title?: string) {
  return {
    id,
    locale: page.route.locale,
    path: page.route.path,
    title: title ?? seo.title.split(' - ')[0],
    sources: [{ file: page.file, line, sourceId: page.wpId }],
  };
}

const must = <T>(value: T | null | undefined, page: Page, what: string): T => {
  if (value === null || value === undefined || (Array.isArray(value) && !value.length))
    throw new Error(`Source drift: ${page.file} has no ${what}`);
  return value;
};

const count = <T>(list: T[], expected: number, page: Page, what: string) => {
  if (list.length !== expected)
    throw new Error(`Source drift: ${page.file} has ${list.length} ${what}, expected ${expected}`);
  return list;
};

/** Achievement counters (the rows holding `.col-thanhtuu .count-num`), ids in home order. */
export function readStats(root: HTMLElement, file: string, locale: Locale, stats: Stats): Stat[] {
  const rows = root
    .querySelectorAll('.col-thanhtuu .count-num')
    .map((n) => n.closest('.row'))
    .filter((r): r is HTMLElement => !!r);
  if (rows.length !== STAT_KEYS.length)
    throw new Error(`Source drift: ${file} has ${rows.length} stats, expected ${STAT_KEYS.length}`);
  return rows.map((row, i): Stat => {
    const number = row.querySelector('.count-up');
    const ps = row.querySelectorAll('p').filter((p) => !p.closest('.count-num'));
    const value = Number(number?.text.trim());
    if (!number || !Number.isInteger(value) || ps.length < 2)
      throw new Error(`${file}: unexpected stat markup`);
    const suffix = plain(ps[0], stats);
    return {
      id: `stat-${STAT_KEYS[i]}-${locale}`,
      value,
      ...(suffix && { suffix }),
      label: plain(ps.at(-1)!, stats),
    };
  });
}

function home(page: Page, registry: AssetRegistry, stats: Stats, refs: PageRefs) {
  const { root, file, lineOf, route } = page;
  const { locale } = route;
  const content = must(root.querySelector('#content'), page, '#content');
  const heading = must(content.querySelectorAll('.home_text_go h1'), page, 'hero heading');
  const video = content.querySelector('.banner .video-bg source');
  const ctx = { file, lineOf, stats };
  const section = (el: HTMLElement | null, what: string) =>
    must(el?.closest('section.section') ?? null, page, `${what} section`);
  const copy = (el: HTMLElement, what: string): SectionCopy =>
    must(sectionCopy(el, stats), page, `${what} copy`);

  // Services in card order (desktop cards), each resolved by its link path.
  const serviceIds = must(
    content.querySelectorAll('.hide-for-small .dich_vu .nut_xthem a'),
    page,
    'service cards',
  ).map((a) => {
    const href = processHref(a.getAttribute('href') ?? '', file, lineOf(a.range[0]), stats);
    const service = refs.services.find((s) => s.path === href);
    if (!service) throw new Error(`Source drift: ${file}: service card ${href} is not a service`);
    return service.id;
  });

  const marquee = must(content.querySelector('.cs-moving_text'), page, 'marquee');
  const marqueeText = marquee.childNodes
    .filter((n): n is TextNode => n instanceof TextNode)
    .map((n) => processText(n.rawText, stats).trim())
    .filter(Boolean);

  const projectIds = content.querySelectorAll('.scroll-item a.item-link').map((a) => {
    const id = refs.projectIdBySlug.get(projectSlug(a.getAttribute('href'), file));
    if (!id) throw new Error(`Source drift: ${file}: ${a.getAttribute('href')} is not a project`);
    return id;
  });

  // The first set of post cards (the markup repeats it for the slider).
  const postIds: EntityId[] = [];
  for (const a of content.querySelectorAll('.post-item-cus a.plain')) {
    const href = processHref(a.getAttribute('href') ?? '', file, lineOf(a.range[0]), stats);
    const id = refs.postIdBySlug.get((href ?? '').replace(/^\/|\/$/g, ''));
    if (!id) throw new Error(`Source drift: ${file}: ${href} is not a post`);
    if (postIds.includes(id)) break;
    postIds.push(id);
  }

  const logos = must(content.querySelectorAll('img.gal-doitac'), page, 'partner logos');
  const partnerIds = logos.map((img) => {
    const id = `partner-${imageStem(img.getAttribute('src') ?? '')}`;
    if (!refs.partnerIds.has(id)) throw new Error(`Source drift: ${file}: ${id} is not a partner`);
    return id;
  });

  const seo = seoOf(page, registry, stats);
  const servicesSection = section(content.querySelector('.dich_vu'), 'services');
  const record: HomePageRecord = {
    ...identity(page, `home-${locale}`, seo, lineOf(heading[0].range[0])),
    translationKey: 'home',
    hero: {
      headingLines: heading.map((h) => plain(h, stats)),
      videoId: video
        ? registry.add(
            video.getAttribute('src'),
            { kind: 'video' },
            { file, line: lineOf(video.range[0]) },
          )?.id
        : undefined,
      cta: linkModel(content.querySelector('.link_banner a'), ctx),
    },
    seo,
    statIds: readStats(root, file, locale, stats).map((s) => s.id),
    sectionCopy: {
      achievements: copy(
        must(content.querySelector('.col-thanhtuu'), page, 'achievements'),
        'achievements',
      ),
      services: {
        eyebrow: plain(
          must(servicesSection.querySelector('.tt_dvu p'), page, 'services eyebrow'),
          stats,
        ),
        title: copy(servicesSection, 'services').title,
      },
      projects: copy(section(content.querySelector('.ss-decor'), 'projects'), 'projects'),
      partners: copy(section(logos[0], 'partners'), 'partners'),
      testimonials: copy(section(content.querySelector('.ss-kh'), 'testimonials'), 'testimonials'),
      // The news teaser is the last section (EN has no cards in it).
      posts: copy(
        must(root.querySelectorAll('#content > section.section').at(-1), page, 'posts section'),
        'posts',
      ),
    },
    serviceIds,
    marqueeText,
    projectPlacements: placements(projectIds),
    partnerPlacements: placements(partnerIds),
    testimonialPlacements: placements(readSlides(root, file).map((s) => s.id)),
    postPlacements: placements(postIds),
  };
  return record;
}

function about(page: Page, registry: AssetRegistry, stats: Stats) {
  const { root, file, lineOf, route } = page;
  const { locale } = route;
  const content = must(root.querySelector('#content'), page, '#content');
  const heading = must(content.querySelectorAll('.banner .page_text_go h1'), page, 'hero heading');
  const textCol = must(heading[0].closest('.col'), page, 'hero column');
  const texts = textCol.querySelectorAll('.text');
  const after = texts
    .slice(texts.findIndex((t) => t.querySelector('h1')) + 1)
    .filter((t) => !t.querySelector('a.but-lh'));
  const heroLine = lineOf(heading[0].range[0]);
  const h = (line: number) => hooks(page, line, stats);
  const id = `about-${locale}`;
  const block = (el: HTMLElement, line: number) => trimBreaks(sanitize(el, h(line)));

  const goals = count(
    content
      .querySelectorAll('.row_muctieu.hide-for-small > .col')
      .filter((col) => col.querySelector('.icon-box')),
    EXPECTED.goals,
    page,
    'goals',
  ).map((col): Feature => {
    const line = lineOf(col.range[0]);
    const title = plain(must(col.querySelector('h3'), page, 'goal title'), stats);
    return {
      id: `${id}-goal-${slug(title)}`,
      title,
      body: rich(
        col
          .querySelectorAll('.mota_mt')
          .map((t) => block(t, line))
          .join(''),
        [{ file, line }],
      ),
      iconId: registry.image(col.querySelector('.icon-inner img'), file, lineOf),
    };
  });

  const panel =
    (kind: string) =>
    (col: HTMLElement): OfferingPanel => {
      const line = lineOf(col.range[0]);
      const titleEl = must(col.querySelector('h3'), page, `${kind} title`);
      const title = plain(titleEl, stats);
      const bullets = col.querySelectorAll('.icon-box-text p');
      const html = bullets.length
        ? `<ul>${bullets.map((p) => `<li>${sanitize(p, h(line))}</li>`).join('')}</ul>`
        : col
            .querySelectorAll('p')
            .map((p) => `<p>${sanitize(p, h(line))}</p>`)
            .join('');
      return {
        id: `${id}-${kind}-${slug(title)}`,
        title,
        content: rich(trimBreaks(html), [{ file, line }]),
      };
    };
  const purposePanels = count(
    content.querySelectorAll('.row_cacsp .col-line-top'),
    EXPECTED.purpose,
    page,
    'purpose panels',
  ).map(panel('purpose'));
  const capabilities = count(
    content.querySelectorAll('.hover_gra.hide-for-small .col-logo'),
    EXPECTED.capabilities,
    page,
    'capability panels',
  ).map(panel('capability'));

  // Timeline rows: year h3, title h3, body paragraphs (VI copy-paste bodies kept as-is).
  const timeline = count(
    content.querySelectorAll('section.hinhthanh-phattrien .row-full-width'),
    EXPECTED.timeline,
    page,
    'timeline rows',
  ).map((row) => {
    const text = must(
      row.querySelectorAll('.text').find((t) => t.querySelectorAll('h3').length === 2),
      page,
      'timeline text',
    );
    const line = lineOf(text.range[0]);
    const [year, title] = text.querySelectorAll('h3').map((el) => plain(el, stats));
    return {
      id: `${id}-timeline-${year}`,
      year,
      title,
      body: rich(
        trimBreaks(
          text
            .querySelectorAll('p')
            .map((p) => `<p>${sanitize(p, h(line))}</p>`)
            .join(''),
        ),
        [{ file, line }],
      ),
    };
  });

  const seo = seoOf(page, registry, stats);
  const description = trimBreaks(after.map((t) => sanitize(t, h(heroLine))).join(''));
  const record: AboutPageRecord = {
    ...identity(page, id, seo, heroLine),
    translationKey: 'about',
    hero: {
      headingLines: heading.map((el) => plain(el, stats)),
      description: description
        ? rich(description, [{ file, line: lineOf(after[0].range[0]) }])
        : undefined,
      imageId: registry.image(content.querySelector('.banner .banner-bg img'), file, lineOf),
      cta: linkModel(textCol.querySelector('a.but-lh'), { file, lineOf, stats }),
    },
    seo,
    statIds: readStats(root, file, locale, stats).map((s) => s.id),
    goals,
    purposePanels,
    timeline,
    capabilities,
    partnerIds: [],
    testimonialIds: readSlides(root, file).map((s) => s.id),
  };
  return record;
}

function contact(page: Page, registry: AssetRegistry, stats: Stats): ContactPageContent {
  const { root, file, lineOf, route } = page;
  const h1 = must(root.querySelector('#content h1'), page, 'h1');
  const company = must(root.querySelectorAll('#content h2')[1], page, 'company h2');
  const intro = must(
    root
      .querySelectorAll('#content p')
      .find((p) => p.range[0] > company.range[0] && plain(p, stats)),
    page,
    'introduction',
  );
  const line = lineOf(intro.range[0]);
  const seo = seoOf(page, registry, stats);
  return {
    ...identity(page, `contact-${route.locale}`, seo, lineOf(h1.range[0]), plain(h1, stats)),
    translationKey: 'contact',
    heading: plain(company, stats),
    introduction: rich(`<p>${sanitize(intro, hooks(page, line, stats))}</p>`, [{ file, line }]),
    seo,
  };
}

const bannerTitle = (page: Page, stats: Stats) =>
  plain(must(page.root.querySelector('.banner .text-box h2'), page, 'banner h2'), stats);

function legal(
  page: Page,
  registry: AssetRegistry,
  stats: Stats,
  translationKey: string,
): LegalPage {
  const { root, file, lineOf, route } = page;
  const banner = must(root.querySelector('#content > .banner'), page, 'banner');
  const siblings = banner.parentNode!.childNodes;
  const body = siblings.slice(siblings.indexOf(banner) + 1);
  const first = must(
    body.find((n) => n instanceof HTMLElement),
    page,
    'body',
  ) as HTMLElement;
  const line = lineOf(first.range[0]);
  const seo = seoOf(page, registry, stats);
  return {
    ...identity(
      page,
      `legal-${route.path.split('/').at(-2)}`,
      seo,
      lineOf(banner.range[0]),
      bannerTitle(page, stats),
    ),
    translationKey,
    body: rich(trimBreaks(sanitize(body, hooks(page, line, stats), RICH_ALLOWED)), [
      { file, line },
    ]),
    seo,
  };
}

function payment(
  page: Page,
  registry: AssetRegistry,
  stats: Stats,
  translationKey: string,
): PaymentGuideContent {
  const { root, file, lineOf, route } = page;
  const inner = must(
    root.querySelector('#content > .row > .col > .col-inner'),
    page,
    'guide column',
  );
  const accountRows = must(inner.querySelectorAll('.row-collapse.align-middle'), page, 'accounts');
  const children = inner.childNodes;
  const split = children.findIndex(
    (n) => n instanceof HTMLElement && n.querySelector('.row-collapse.align-middle'),
  );
  // Real accounts and QR images are not imported (Q1): drop each account card.
  for (const row of accountRows) row.parentNode?.closest('.col')?.remove();
  const introLine = lineOf(inner.range[0]);
  const restLine = lineOf((children[split] as HTMLElement).range[0]);
  const html = (nodes: Node[], line: number) =>
    trimBreaks(sanitize(nodes, hooks(page, line, stats), RICH_ALLOWED));
  const seo = seoOf(page, registry, stats);
  const id = `legal-${route.path.split('/').at(-2)}`;
  return {
    ...identity(page, id, seo, introLine, bannerTitle(page, stats)),
    translationKey,
    introduction: rich(html(children.slice(0, split), introLine), [{ file, line: introLine }]),
    seo,
    accounts: accountRows.map((_, i) => ({
      id: `${id}-account-${i + 1}`,
      ...DEMO_ACCOUNT[route.locale],
    })),
    instructions: rich(html(children.slice(split), restLine), [{ file, line: restLine }]),
  };
}

function profile(page: Page, registry: AssetRegistry, stats: Stats): CompanyProfileContent {
  const { root, file, lineOf, source, route } = page as Page & { source: string };
  const match = /window\.option_df_\d+ = (\{.*?\});/.exec(source);
  const pdf = match ? (JSON.parse(match[1]) as { source?: string }).source : undefined;
  const script = must(root.querySelector('script.df-shortcode-script'), page, 'flipbook script');
  // The PDF is remote (not in the mirror); its brand-named filename is mapped like text.
  const pdfAssetId = must(
    registry.add(
      pdf && applyBrandTerms(pdf).text,
      { kind: 'pdf' },
      { file, line: lineOf(script.range[0]) },
    )?.id,
    page,
    'profile PDF',
  );
  const seo = seoOf(page, registry, stats);
  const banner = must(root.querySelector('#content > .banner'), page, 'banner');
  return {
    ...identity(
      page,
      `profile-${route.locale}`,
      seo,
      lineOf(banner.range[0]),
      bannerTitle(page, stats),
    ),
    translationKey: 'profile',
    coverId: registry.image(banner.querySelector('.banner-bg img'), file, lineOf),
    pdfAssetId,
    seo,
  };
}

function listing(page: Page, stats: Stats): ListingSettings {
  const headingLines = must(
    page.root
      .querySelectorAll('h1')
      .filter((h) => !h.classList.contains('entry-title') && !h.closest('footer')),
    page,
    'listing h1',
  ).map((h) => plain(h, stats));
  const category = page.root.querySelector('h2.category-title');
  return {
    routeId: page.route.id,
    heading: { title: category ? plain(category, stats) : headingLines.join(' ') },
    hero: { headingLines },
  };
}

function thankYou(page: Page, stats: Stats) {
  const inner = must(page.root.querySelector('#content .form_tke .col-inner'), page, 'message');
  const line = page.lineOf(inner.range[0]);
  return {
    id: `thank-you-${page.route.locale}`,
    body: rich(
      trimBreaks(sanitize(inner, hooks(page, line, stats), new Set([...RICH_ALLOWED, 'h1']))),
      [{ file: page.file, line }],
    ),
  };
}

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
    stats: statRecords,
    listingSettings: [...pages('post-list'), ...pages('project-list')].map((p) =>
      listing(p, stats),
    ),
    thankYou: pages('thank-you').map((p) => thankYou(p, stats)),
    wordmark,
  };
}
