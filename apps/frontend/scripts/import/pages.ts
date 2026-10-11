import { HTMLElement, TextNode, type Node } from 'node-html-parser';
import type {
  AboutPageRecord,
  AssetRef,
  CollectionPlacement,
  CompanyProfileContent,
  ContactPageContent,
  EntityId,
  FAQPageContent,
  Feature,
  HeroContent,
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
import { linkModel, matchServiceByTitle, plain, sectionCopy, trimBreaks } from './services.ts';
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
  services: { id: EntityId; path: PublicPath; title: string; locale: Locale }[];
  partnerIds: Set<EntityId>;
}

export { matchServiceByTitle } from './services.ts';

export function resolveServiceCard<T extends { title: string }>(
  rawTitle: string,
  localeServices: T[],
  file: string,
): T {
  const service = matchServiceByTitle(rawTitle, localeServices);
  if (!service)
    throw new Error(`Source drift: ${file}: service card "${rawTitle}" does not match any service`);
  return service;
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

  // Services in card order (desktop cards), each resolved by title.
  const serviceCards = must(
    content.querySelectorAll('.hide-for-small .dich_vu'),
    page,
    'service cards',
  );
  const localeServices = refs.services.filter((s) => s.locale === locale);
  const serviceIds = serviceCards.map((card) => {
    const nameEl = must(card.querySelector('.name_dv'), page, 'card name');
    const rawTitle = nameEl.childNodes[0]?.rawText.trim() ?? '';
    const service = resolveServiceCard(rawTitle, localeServices, file);
    return service.id;
  });

  const marquee = must(content.querySelector('.cs-moving_text'), page, 'marquee');
  const marqueeText = marquee.childNodes
    .filter((n): n is TextNode => n instanceof TextNode)
    .map((n) => processText(n.rawText, stats).trim())
    .filter(Boolean);
  const separatorImg = must(marquee.querySelector('img'), page, 'marquee separator image');
  const marqueeSeparatorId = must(
    registry.image(separatorImg, file, lineOf),
    page,
    'marquee separator asset',
  );

  const ssKh = must(content.querySelector('.ss-kh'), page, 'testimonials section');
  const photoImg = must(
    ssKh.querySelector('[id^="image_"] img, .img img'),
    page,
    'testimonials photo image',
  );
  const photoId = must(
    registry.image(photoImg, file, lineOf),
    page,
    'testimonial side photo asset',
  );
  const quoteIconImg = must(
    ssKh.querySelector('img[src*="Group.svg"]'),
    page,
    'testimonials quote icon image',
  );
  const quoteIconId = must(
    registry.image(quoteIconImg, file, lineOf),
    page,
    'testimonial quote icon asset',
  );
  const lineImg = must(
    ssKh.querySelector('img[src*="Vector-268.svg"]'),
    page,
    'testimonials line image',
  );
  const lineId = must(registry.image(lineImg, file, lineOf), page, 'testimonial line asset');

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

  const footerBar = root.querySelector('#azt-contact-footer');
  if (footerBar) {
    for (const img of footerBar.querySelectorAll('img')) {
      registry.image(img, file, lineOf);
    }
  }

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
      testimonials: copy(section(ssKh, 'testimonials'), 'testimonials'),
      // The news teaser is the last section (EN has no cards in it).
      posts: copy(
        must(root.querySelectorAll('#content > section.section').at(-1), page, 'posts section'),
        'posts',
      ),
    },
    serviceIds,
    marqueeText,
    marqueeSeparatorId,
    testimonialArtIds: {
      photoId,
      quoteIconId,
      lineId,
    },
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

  const timelineDotId = must(
    registry.image(
      content.querySelector('section.hinhthanh-phattrien .text-border img'),
      file,
      lineOf,
    ),
    page,
    'timeline dot asset',
  );

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
    sectionCopy: {
      achievements: {
        title: locale === 'vi' ? 'Thành tựu chúng tôi đạt được' : 'Our Achievements',
        description:
          locale === 'vi'
            ? 'Đối với Sova xem mỗi dự án không chỉ là cơ hội tạo ra giá trị cho doanh nghiệp mà còn là sự đồng hành cùng doanh nghiệp, mang lại giá trị cộng hưởng cho khách hàng thông qua từng sản phẩm trải nghiệm số.'
            : 'Sova see every project as more than just a task — it’s a chance to co-create value with our clients, delivering meaningful digital experiences that drive impact and foster lasting partnerships.',
      },
      goals: {
        eyebrow: 'Target',
        title: locale === 'vi' ? 'Mục tiêu của chúng tôi' : 'Our Mission',
        description:
          locale === 'vi'
            ? 'Sova luôn nỗ lực không ngừng để nâng cao chất lượng dịch vụ,\nvới mục tiêu trở thành sự lựa chọn hàng đầu của khách hàng.\nMỗi dự án là một trải nghiệm và thử thách đối với chúng tôi.'
            : 'Sova are committed to continuously improving our service quality\nwith the goal of becoming the top choice for our clients.\nEvery project is both a new experience and a meaningful challenge for us.',
        descriptionLines:
          locale === 'vi'
            ? [
                'Sova luôn nỗ lực không ngừng để nâng cao chất lượng dịch vụ,',
                'với mục tiêu trở thành sự lựa chọn hàng đầu của khách hàng.',
                'Mỗi dự án là một trải nghiệm và thử thách đối với chúng tôi.',
              ]
            : [
                'Sova are committed to continuously improving our service quality',
                'with the goal of becoming the top choice for our clients.',
                'Every project is both a new experience and a meaningful challenge for us.',
              ],
      },
      purpose: {
        title: locale === 'vi' ? 'Các sản phẩm của Sova' : 'Our Products',
        ...(locale === 'vi' ? { titleLines: ['Các sản phẩm của', 'Sova'] } : {}),
        description:
          locale === 'vi'
            ? 'Tất cả đều đang đáp ứng chính xác nhu cầu của thị trường, đã được cấp chứng chỉ sở hữu trí tuệ từ Nhà nước, và sẵn sàng đồng hành cùng các tổ chức doanh nghiệp lớn, vừa và nhỏ để phát triển một cách toàn diện và bền vững.'
            : 'All of Sova’s products are precisely aligned with market demands, officially certified by the State for intellectual property rights, and ready to partner with financial institutions of all sizes — enabling comprehensive and sustainable growth.',
      },
      timeline: {
        title: locale === 'vi' ? 'Hình thành và phát triển' : 'Our Journey of Growth',
      },
      pillars: {
        eyebrow: locale === 'vi' ? 'Những dịch vụ' : 'Services',
        title: locale === 'vi' ? 'Có thể tìm thấy tại Sova' : 'What You Can Find at Sova',
        ...(locale === 'vi' ? { titleLines: ['Có thể tìm thấy tại', 'Sova'] } : {}),
        description:
          locale === 'vi'
            ? 'Khi trở thành khách hàng của Sova, bạn có thể sử dụng những dịch vụ do công ty cung cấp như sau'
            : 'As a client of Sova, you can take advantage of the following services provided by our company:',
      },
      testimonials: {
        eyebrow: 'Sova',
        title: locale === 'vi' ? 'Khách hàng nhận xét về chúng tôi' : 'Customer Reviews',
        ...(locale === 'vi' ? { titleLines: ['Khách hàng nhận xét', 'về chúng tôi'] } : {}),
      },
    },
    marqueeText: ['Development', 'UI/UX', 'Sova', 'Branding', 'Writer', 'Mobile'],
    marqueeSeparatorId: 'asset-400b882328',
    testimonialArtIds: {
      photoId: 'asset-941f38ec1d',
      quoteIconId: 'asset-1d227d7c9b',
      lineId: 'asset-5763f42849',
    },
    purposeImageId: 'asset-e0d6652ff9',
    timelineDotId,
  };
  return record;
}

function contact(page: Page, registry: AssetRegistry, stats: Stats): ContactPageContent {
  const { root, file, lineOf, route } = page;
  const h1 = must(root.querySelector('#content h1'), page, 'h1');
  const heroImg = must(root.querySelector('#content section .section-bg img'), page, 'hero image');
  const heroImageId = must(registry.image(heroImg, file, lineOf), page, 'hero image asset');

  const heroSection = must(root.querySelector('#content > section'), page, 'hero section');
  const breadcrumb = must(heroSection.querySelector('p'), page, 'breadcrumb');
  const homeLink = must(breadcrumb.querySelector('a'), page, 'breadcrumb home link');
  const currentSpan = must(breadcrumb.querySelector('span'), page, 'breadcrumb current span');

  const h2s = root.querySelectorAll('#content h2');
  const sectionHeading = plain(must(h2s[0], page, 'section heading h2'), stats);
  const company = must(h2s[1], page, 'company h2');
  const intro = must(
    root
      .querySelectorAll('#content p')
      .find((p) => p.range[0] > company.range[0] && plain(p, stats)),
    page,
    'introduction',
  );
  const line = lineOf(intro.range[0]);
  const seo = seoOf(page, registry, stats);

  const icons = root.querySelectorAll('#content .icon-box .icon-inner img');
  if (icons.length !== 3) throw new Error(`Source drift: ${file} expected exactly 3 icon-box images`);
  const addressIconId = must(registry.image(icons[0], file, lineOf), page, 'address icon');
  const phoneIconId = must(registry.image(icons[1], file, lineOf), page, 'phone icon');
  const emailIconId = must(registry.image(icons[2], file, lineOf), page, 'email icon');

  return {
    ...identity(page, `contact-${route.locale}`, seo, lineOf(h1.range[0]), plain(h1, stats)),
    translationKey: 'contact',
    heroImageId,
    sectionHeading,
    heading: plain(company, stats),
    breadcrumb: {
      homeLabel: plain(homeLink, stats),
      current: plain(currentSpan, stats),
    },
    infoIconIds: {
      address: addressIconId,
      phone: phoneIconId,
      email: emailIconId,
    },
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

export function faqPage(page: Page, registry: AssetRegistry, stats: Stats): FAQPageContent {
  const { root, lineOf, route } = page;
  const banner = must(root.querySelector('#content > .banner'), page, 'banner');
  const breadcrumb = must(banner.querySelector('p'), page, 'breadcrumb');
  const homeLink = must(breadcrumb.querySelector('a'), page, 'breadcrumb home link');
  const currentSpan = must(breadcrumb.querySelector('span'), page, 'breadcrumb current span');
  const seo = seoOf(page, registry, stats);

  return {
    ...identity(
      page,
      `faq-${route.locale}`,
      seo,
      lineOf(banner.range[0]),
      bannerTitle(page, stats),
    ),
    translationKey: 'faq',
    breadcrumb: {
      homeLabel: plain(homeLink, stats),
      current: plain(currentSpan, stats),
    },
    seo,
  };
}

function listing(page: Page, registry: AssetRegistry, stats: Stats): ListingSettings {
  const headingLines = must(
    page.root
      .querySelectorAll('h1')
      .filter((h) => !h.classList.contains('entry-title') && !h.closest('footer')),
    page,
    'listing h1',
  ).map((h) => plain(h, stats));
  // Featured archives title the page with `h1.entry-title` (category label, or the THP title on
  // /featured_item/, A12).
  const category =
    page.root.querySelector('h2.category-title') ?? page.root.querySelector('h1.entry-title');

  let hero: HeroContent = { headingLines };

  if (
    page.route.id === 'route-du-an' ||
    page.route.id === 'route-en--our-project' ||
    page.route.id === 'route-featured_item' ||
    page.route.id.startsWith('route-featured_item_category--')
  ) {
    const banner = page.root.querySelector('.banner');
    if (banner) {
      const lineOf = page.lineOf;
      const file = page.file;
      const ctx = { file, lineOf, stats };

      const bgImg = banner.querySelector('.banner-bg img');
      const bgImageId = registry.image(bgImg, file, lineOf);

      const rightColImg = banner.querySelector('.img img');
      const imageId = registry.image(rightColImg, file, lineOf);

      const descEl = banner.querySelector('.text.nd-kh');
      const descText = descEl ? descEl.childNodes[0]?.rawText.trim() : undefined;
      const description = descText
        ? rich(descText, [{ file, line: lineOf(descEl!.range[0]) }])
        : undefined;

      const ctaEl = banner.querySelector('a.but-lh');
      const cta = linkModel(ctaEl, ctx);

      const bcEl = banner.querySelector('.row .col:first-child .text:first-child');
      let breadcrumb: { label: string; href?: string }[] | undefined;
      if (bcEl) {
        const homeLink = bcEl.querySelector('a');
        const lastText = bcEl.childNodes
          .filter((n) => n.nodeType === 3)
          .map((n) => n.text.trim())
          .filter(Boolean)
          .pop();
        if (homeLink && lastText) {
          breadcrumb = [
            {
              label: plain(homeLink, stats),
              href: processHref(homeLink.getAttribute('href') ?? '', file, lineOf(homeLink.range[0]), stats) ?? '/',
            },
            {
              label: lastText,
            },
          ];
        }
      }

      hero = {
        headingLines,
        description,
        cta,
        imageId,
        bgImageId,
        breadcrumb,
      };
    }
  }

  return {
    routeId: page.route.id,
    heading: { title: category ? plain(category, stats) : headingLines.join(' ') },
    hero,
  };
}

function thankYou(page: Page, registry: AssetRegistry, stats: Stats) {
  const inner = must(page.root.querySelector('#content .form_tke .col-inner'), page, 'message');
  const line = page.lineOf(inner.range[0]);
  return {
    id: `thank-you-${page.route.locale}`,
    seo: seoOf(page, registry, stats),
    body: rich(
      trimBreaks(sanitize(inner, hooks(page, line, stats), new Set([...RICH_ALLOWED, 'h1']))),
      [{ file: page.file, line }],
    ),
  };
}

function sample(page: Page, registry: AssetRegistry, stats: Stats) {
  const content = must(page.root.querySelector('#content'), page, '#content');
  const line = page.lineOf(content.range[0]);
  return {
    id: `sample-${page.route.locale}`,
    seo: seoOf(page, registry, stats),
    body: rich(
      trimBreaks(
        sanitize(content, hooks(page, line, stats), new Set([...RICH_ALLOWED, 'blockquote'])),
      ),
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
    faqPages: pages('faq').map((p) => faqPage(p, registry, stats)),
    stats: statRecords,
    listingSettings: [...pages('post-list'), ...pages('project-list')].map((p) =>
      listing(p, registry, stats),
    ),
    thankYou: pages('thank-you').map((p) => thankYou(p, registry, stats)),
    sample: pages('sample').map((p) => sample(p, registry, stats)),
    wordmark,
  };
}
