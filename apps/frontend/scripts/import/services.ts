import { HTMLElement } from 'node-html-parser';
import type {
  EntityId,
  FAQPlacement,
  Feature,
  LinkModel,
  Locale,
  Money,
  OfferingPanel,
  Pricing,
  PricingCell,
  PricingFeature,
  PricingPlan,
  PublicPath,
  SectionCopy,
  Service,
  ServiceKey,
  ServiceSection,
} from '../../src/types/content.ts';
import { processHref, processText, sanitize, visibleText, type Stats } from './html.ts';
import type { AssetRegistry } from './assets.ts';
import { PAGES, slug } from './faq.ts';
import { load, projectSlug } from './projects.ts';
import { readSlides } from './social.ts';

const EXPECTED_SERVICES = 16;
const PARENT: Partial<Record<ServiceKey, ServiceKey>> = { hosting: 'storage', vps: 'storage' };
/** `{locale}:{key}` -> plan count of the priced services. */
const PLAN_COUNTS: Record<string, number> = {
  'vi:website': 3,
  'en:website': 3,
  'vi:email': 7,
  'en:email': 5,
  'vi:hosting': 8,
  'en:hosting': 8,
  'vi:vps': 6,
  'en:vps': 6,
};
const CARD_FEATURES = 9;
/** Pages with a filled `section.ss-decor` (6 cards each); every other page has none. */
const FEATURED: Record<Locale, ServiceKey[]> = {
  vi: ['website', 'mobile', 'seo', 'branding', 'storage'],
  en: [],
};
const FEATURED_COUNT = 6;
// Containers whose headings are not section headings (mobile copies, cards, tables, sliders...).
const NOT_COPY = [
  'show-for-small',
  'eras-table-price',
  'vps-table-wrapper',
  'accordion',
  'slider-wrapper',
  'row_ptien',
  'scrolling-wrapper',
  'form-lienhe',
];

interface Ctx {
  file: string;
  lineOf: (offset: number) => number;
  stats: Stats;
}

const unescape = (text: string) =>
  text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** Visible text of an element (br -> space) through the text pipeline. */
export const plain = (el: HTMLElement, stats: Stats) =>
  unescape(visibleText(sanitize(el, { text: (raw) => processText(raw, stats), href: () => null })));

/** Drops the `<br>` the source leaves at the end of paragraphs and list items. */
export const trimBreaks = (html: string) => html.replace(/(?:<br>)+(?=<\/(?:p|li)>)/g, '');

const hooks = (ctx: Ctx, line: number) => ({
  text: (raw: string) => processText(raw, ctx.stats),
  href: (raw: string) => processHref(raw, ctx.file, line, ctx.stats),
});

export function linkModel(a: HTMLElement | null, ctx: Ctx): LinkModel | undefined {
  const raw = a?.getAttribute('href');
  if (!a || raw === undefined) return undefined;
  const href = processHref(raw, ctx.file, ctx.lineOf(a.range[0]), ctx.stats);
  if (!href) return undefined;
  const model: LinkModel = { label: plain(a, ctx.stats), href };
  if (!href.startsWith('/')) model.external = true;
  return model;
}

const isCol = (n: unknown): n is HTMLElement =>
  n instanceof HTMLElement && n.classList.contains('col');

function skipped(el: HTMLElement, stop: HTMLElement) {
  for (let n: HTMLElement | null = el; n && n !== stop; n = n.parentNode)
    if (NOT_COPY.some((c) => n!.classList?.contains(c))) return true;
  return false;
}

/**
 * Eyebrow (h4 or a strong-only p) before the first desktop h2, plus paragraphs in its row. A section
 * without any h2 (EN SEO benefits) uses its first h3.
 */
export function sectionCopy(section: HTMLElement, stats: Stats): SectionCopy | undefined {
  let eyebrow: string | undefined;
  let copy: SectionCopy | undefined;
  let titleRow: HTMLElement | null = null;
  const description: string[] = [];
  const elements = section.querySelectorAll('h2, h3, h4, p').filter((el) => !skipped(el, section));
  const titleTag = elements.some((el) => el.rawTagName.toLowerCase() === 'h2') ? 'h2' : 'h3';
  for (const el of elements) {
    const tag = el.rawTagName.toLowerCase();
    const kids = el.childNodes.filter((n) => n instanceof HTMLElement && n.rawTagName !== 'br');
    const strongOnly =
      tag === 'p' &&
      kids.length === 1 &&
      (kids[0] as HTMLElement).rawTagName.toLowerCase() === 'strong' &&
      el.childNodes.every((n) => n instanceof HTMLElement || !n.rawText.trim());
    if (!copy) {
      if (tag === titleTag) {
        const title = plain(el, stats);
        if (!title) continue;
        copy = eyebrow ? { eyebrow, title } : { title };
        titleRow = el.closest('.row');
      } else if (!eyebrow && (tag === 'h4' || strongOnly)) {
        eyebrow = plain(el, stats) || undefined;
      }
    } else if (tag === 'p' && !strongOnly && el.closest('.row') === titleRow) {
      const text = plain(el, stats);
      if (text) description.push(text);
    }
  }
  if (copy && description.length) copy.description = description.join(' ');
  return copy;
}

function money(text: string, period: Money['period'], ctx: Ctx, line: number): Money {
  const amount = /^\+?(\d{1,3}(?:\.\d{3})*)\s*VN[DĐ]$/.exec(text)?.[1];
  if (!amount) throw new Error(`Source drift: ${ctx.file}:${line}: price "${text}" is not VND`);
  return { amount: Number(amount.replace(/\./g, '')), currency: 'VND', period, displayText: text };
}

/** Website pricing cards: plan name, VI discount label or EN price + original price, 9 features. */
export function parseCards(row: HTMLElement, pricingId: string, ctx: Ctx) {
  const features: PricingFeature[] = [];
  const plans = row.childNodes.filter(isCol).map((col): PricingPlan => {
    const line = ctx.lineOf(col.range[0]);
    const box = col.querySelector('.icon-tke');
    const nameEl = box?.querySelector('h3');
    if (!box || !nameEl) throw new Error(`${ctx.file}:${line}: unexpected pricing card markup`);
    const name = plain(nameEl, ctx.stats);
    const labels = col
      .querySelectorAll('.icon-box.icon-center .icon-box-text p')
      .map((p) => plain(p, ctx.stats));
    if (labels.length !== CARD_FEATURES)
      throw new Error(
        `Source drift: ${ctx.file}:${line}: card ${name} has ${labels.length} features, expected ${CARD_FEATURES}`,
      );
    const featureIds = labels.map((label) => {
      let feature = features.find((f) => f.label === label);
      if (!feature) {
        feature = { id: `${pricingId}-feature-${features.length + 1}`, label };
        features.push(feature);
      }
      return feature.id;
    });
    const cta = linkModel(col.querySelector('a.but-lh'), ctx);
    if (!cta) throw new Error(`${ctx.file}:${line}: card ${name} has no CTA`);
    const plan: PricingPlan = { id: `${pricingId}-${slug(name)}`, name, featureIds, cta };
    const original = col.querySelector('.gia_giam');
    if (original) {
      plan.price = money(plain(box.querySelectorAll('h3').at(-1)!, ctx.stats), 'once', ctx, line);
      plan.originalPrice = money(plain(original, ctx.stats), 'once', ctx, line);
    }
    const discount = col.querySelector('.text_sale h3');
    if (discount) plan.discountLabel = plain(discount, ctx.stats);
    if (col.classList.contains('col-blur-blue')) plan.recommended = true;
    return plan;
  });
  return { plans, features };
}

/** Plan-per-row price table: columns are the header cells, `row.id === plan.id`. */
export function parseTable(table: HTMLElement, pricingId: string, ctx: Ctx) {
  const columns = table
    .querySelectorAll('thead th')
    .map((th, i) => ({ id: `${pricingId}-col-${i + 1}`, label: plain(th, ctx.stats) }));
  const plans: PricingPlan[] = [];
  const rows = table.querySelectorAll('tbody tr').map((tr) => {
    const line = ctx.lineOf(tr.range[0]);
    const tds = tr.querySelectorAll('td');
    const register = tr
      .querySelectorAll('a.vps-btn')
      .find((a) => !a.classList.contains('vps-btn-config'));
    const cta = linkModel(register ?? null, ctx);
    if (tds.length !== columns.length || !cta)
      throw new Error(`Source drift: ${ctx.file}:${line}: unexpected price table row`);
    const name = plain(tds[0], ctx.stats);
    const id = `${pricingId}-${slug(name)}`;
    const cells: Record<EntityId, PricingCell> = {};
    let price: Money | undefined;
    tds.forEach((td, i) => {
      if (td.classList.contains('vps-price')) {
        price = money(plain(td, ctx.stats), 'month', ctx, line);
        cells[columns[i].id] = { kind: 'money', value: price };
      } else {
        cells[columns[i].id] = {
          kind: 'text',
          value: i === tds.length - 1 ? cta.label : plain(td, ctx.stats),
        };
      }
    });
    if (!price) throw new Error(`Source drift: ${ctx.file}:${line}: ${name} has no price`);
    plans.push({ id, name, price, featureIds: [], cta });
    return { id, label: name, cells };
  });
  return { columns, rows, plans };
}

/** Pricing of a priced page, checked against the expected plan count. */
export function parsePricing(
  root: HTMLElement,
  key: ServiceKey,
  locale: Locale,
  heading: string,
  ctx: Ctx,
): Pricing | undefined {
  const expected = PLAN_COUNTS[`${locale}:${key}`];
  if (!expected) return undefined;
  const id = `pricing-${key}`;
  const base = { id, locale, serviceKey: key, heading };
  let pricing: Pricing;
  if (key === 'website') {
    const row = root.querySelector('.row.eras-table-price.hide-for-small');
    if (!row) throw new Error(`Source drift: ${ctx.file} has no pricing cards`);
    const { plans, features } = parseCards(row, id, ctx);
    pricing = {
      ...base,
      plans,
      sources: [{ file: ctx.file, line: ctx.lineOf(row.range[0]) }],
      kind: 'cards',
      features,
    };
  } else {
    const table = root.querySelector('.vps-table-wrapper table.vps-table');
    if (!table) throw new Error(`Source drift: ${ctx.file} has no price table`);
    const { columns, rows, plans } = parseTable(table, id, ctx);
    pricing = {
      ...base,
      plans,
      sources: [{ file: ctx.file, line: ctx.lineOf(table.range[0]) }],
      kind: 'table',
      columns,
      rows,
    };
  }
  if (pricing.plans.length !== expected)
    throw new Error(
      `Source drift: ${ctx.file} has ${pricing.plans.length} plans, expected ${expected}`,
    );
  return pricing;
}

/** `section.ss-decor` card links -> project ids, in order; an unknown project throws. */
export function featuredProjects(root: HTMLElement, file: string, idBySlug: Map<string, EntityId>) {
  return root.querySelectorAll('section.ss-decor a.item-link[href]').map((a) => {
    const href = a.getAttribute('href');
    const id = idBySlug.get(projectSlug(href, file));
    if (!id) throw new Error(`Source drift: ${file}: ${href} is not an imported project`);
    return id;
  });
}

export function matchServiceByTitle<T extends { title: string }>(
  cardTitle: string,
  services: T[],
): T | undefined {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '');
  const target = norm(cardTitle);
  return services.find((s) => norm(s.title) === target);
}

interface HomeCardData {
  title: string;
  subServices: { label: string; href: string }[];
  arrowHref: string;
  homeSummary: string;
}

const HOME_PAGES: Record<Locale, string> = {
  vi: 'index.html',
  en: 'en/home/index.html',
};

function readHomeCards(erasDir: string, locale: Locale, stats: Stats): HomeCardData[] {
  const file = HOME_PAGES[locale];
  const { root, lineOf } = load(erasDir, file);
  const cardEls = root.querySelectorAll('.hide-for-small .dich_vu');
  return cardEls.map((card) => {
    const nameEl = card.querySelector('.name_dv');
    const title = nameEl?.childNodes[0]?.rawText.trim() ?? '';
    const subServices = card.querySelectorAll('.name_dv span a').map((a) => {
      const href = processHref(a.getAttribute('href') ?? '', file, lineOf(a.range[0]), stats) ?? '';
      return {
        label: processText(a.text.trim(), stats),
        href,
      };
    });
    const arrowEl = card.querySelector('.nut_xthem a');
    const arrowHref = arrowEl
      ? (processHref(arrowEl.getAttribute('href') ?? '', file, lineOf(arrowEl.range[0]), stats) ?? '')
      : '';
    const mtaEl = card.querySelector('.mta_dv');
    const homeSummary = mtaEl ? processText(mtaEl.text.trim(), stats) : '';
    return { title, subServices, arrowHref, homeSummary };
  });
}

export function importServices(
  erasDir: string,
  registry: AssetRegistry,
  stats: Stats,
  refs: { placements: Map<string, FAQPlacement[]>; projectIdBySlug: Map<string, EntityId> },
) {
  const services: Service[] = [];
  const pricing: Pricing[] = [];
  // Home pages are already counted by pages.ts home(); keep their text out of the import stats.
  const cardStats: Stats = { brand: 0, scrub: 0 };
  const homeCards: Record<Locale, HomeCardData[]> = {
    vi: readHomeCards(erasDir, 'vi', cardStats),
    en: readHomeCards(erasDir, 'en', cardStats),
  };

  for (const locale of ['vi', 'en'] as const) {
    for (const [key, file] of PAGES[locale].services) {
      const { source, root, lineOf } = load(erasDir, file);
      const ctx: Ctx = { file, lineOf, stats };
      const id = `service-${key}-${locale}`;
      const content = root.querySelector('#content');
      const banners = content?.querySelectorAll('.banner-service') ?? [];
      const heroRow = banners[0]?.querySelector('.row');
      const h1s = banners[0]?.querySelectorAll('h1.typewriter') ?? [];
      if (!content || banners.length !== 1 || !heroRow || !h1s.length)
        throw new Error(`${file}: unexpected service hero markup`);

      // Hero: heading lines, then the text after them (minus the CTA), 2nd column image.
      const [textCol, imageCol] = heroRow.childNodes.filter(isCol);
      const texts = textCol.querySelectorAll('.text');
      const afterHeading = texts
        .slice(texts.findIndex((t) => t.querySelector('h1')) + 1)
        .filter((t) => !t.querySelector('a.but-lh'));
      const heroLine = lineOf(h1s[0].range[0]);
      const descriptionHtml = trimBreaks(
        afterHeading.map((t) => sanitize(t, hooks(ctx, heroLine))).join(''),
      );
      const video = content.querySelector('.has-video video source');
      const hero: Service['hero'] = {
        headingLines: h1s.map((h) => plain(h, stats)),
        description: descriptionHtml
          ? {
              format: 'sanitized-html',
              html: descriptionHtml,
              assetIds: [],
              sources: [{ file, line: lineOf(afterHeading[0].range[0]) }],
            }
          : undefined,
        imageId: registry.image(imageCol?.querySelector('.img-inner img') ?? null, file, lineOf),
        videoId: video
          ? registry.add(
              video.getAttribute('src'),
              { kind: 'video' },
              { file, line: lineOf(video.range[0]) },
            )?.id
          : undefined,
        cta: linkModel(textCol.querySelector('a.but-lh'), ctx),
      };

      // Benefits: `.row_ptien`, or the first section on SEO/branding.
      const sections = content.querySelectorAll('section.section');
      const benefitScope =
        content.querySelector('.row_ptien') ??
        (key === 'seo' || key === 'branding' ? sections[0] : null);
      const benefitCols = [
        ...new Set(
          benefitScope?.querySelectorAll('.icon-box').map((b) => b.closest('.col')!) ?? [],
        ),
      ];
      const benefits = benefitCols.map((col): Feature => {
        const line = lineOf(col.range[0]);
        const heading = col.querySelector('h3')!;
        const title = plain(heading, stats);
        return {
          id: `${id}-benefit-${slug(title)}`,
          title,
          body: {
            format: 'sanitized-html',
            html: trimBreaks(
              col
                .querySelectorAll('.text')
                .filter((t) => heading.closest('.text') !== t)
                .map((t) => sanitize(t, hooks(ctx, line)))
                .join(''),
            ),
            assetIds: [],
            sources: [{ file, line }],
          },
          iconId: registry.image(col.querySelector('.icon-inner img'), file, lineOf),
        };
      });

      // Offerings: website why-choose-us row, else the desktop `.eras-table-price` panels.
      const offeringRow =
        key === 'website'
          ? content
              .querySelectorAll('.row.hover_gra.hide-for-small')
              .find((r) => !r.classList.contains('eras-table-price'))
          : content.querySelector('.row.eras-table-price.hide-for-small');
      const offerings = (offeringRow?.childNodes.filter(isCol) ?? []).map((col): OfferingPanel => {
        const line = lineOf(col.range[0]);
        const h = hooks(ctx, line);
        const title = plain(col.querySelector('h2, h3')!, stats);
        const intro = col
          .querySelectorAll('.text p')
          .filter((p) => !p.closest('.icon-box') && !p.querySelector('a'));
        const bullets = col
          .querySelectorAll('.icon-box')
          .map((b) => b.querySelector('h5') ?? b.querySelector('.icon-box-text p'))
          .filter((b): b is HTMLElement => !!b);
        const cta = col.querySelector('a.but-lh');
        const html =
          intro.map((p) => `<p>${sanitize(p, h)}</p>`).join('') +
          (bullets.length
            ? `<ul>${bullets.map((b) => `<li>${sanitize(b, h)}</li>`).join('')}</ul>`
            : '') +
          (cta ? `<p>${sanitize([cta], h)}</p>` : '');
        return {
          id: `${id}-offering-${slug(title)}`,
          title,
          content: {
            format: 'sanitized-html',
            html: trimBreaks(html),
            assetIds: [],
            sources: [{ file, line }],
          },
          mediaId: registry.image(col.querySelector('.img-inner img'), file, lineOf),
        };
      });

      // Section headings, keyed by what each section holds.
      const copy: Service['sectionCopy'] = {};
      const pricingEl =
        key === 'website'
          ? content.querySelector('.row.eras-table-price.hide-for-small')
          : content.querySelector('.vps-table-wrapper');
      const inSection = (el: HTMLElement | null | undefined, s: HTMLElement) =>
        !!el && (el === s || el.closest('section.section') === s);
      for (const section of sections) {
        const kind: ServiceSection | undefined = section.querySelector('.accordion-item')
          ? 'faq'
          : section.classList.contains('ss-kh')
            ? 'testimonials'
            : section.classList.contains('ss-decor')
              ? 'projects'
              : inSection(pricingEl, section)
                ? 'pricing'
                : inSection(offeringRow, section)
                  ? 'offerings'
                  : inSection(benefitScope, section)
                    ? 'benefits'
                    : undefined;
        const found = sectionCopy(section, stats);
        if (!kind || !found) {
          console.log(
            `section ${file}:${lineOf(section.range[0])} not imported (${kind ?? 'unknown'})`,
          );
          continue;
        }
        if (copy[kind]) throw new Error(`${file}: two ${kind} sections`);
        copy[kind] = found;
      }
      const form = content.querySelector('.row.hide-for-small .form-lienhe');
      if (form) {
        const [title, description] = form.querySelectorAll('h2').map((h) => plain(h, stats));
        const badge = form.querySelector('.row_gg h3');
        copy.contact = {
          ...(badge && { eyebrow: plain(badge, stats) }),
          title,
          ...(description && { description }),
        };
      }

      const faqs = refs.placements.get(`${locale}:${key}`);
      const accordion = content.querySelectorAll('.accordion-item').length;
      if (!faqs || faqs.length !== accordion)
        throw new Error(
          `${file}: ${accordion} FAQ items but ${faqs?.length ?? 'no'} imported placements`,
        );

      const featuredProjectIds = featuredProjects(root, file, refs.projectIdBySlug);
      const featured = FEATURED[locale].includes(key) ? FEATURED_COUNT : 0;
      if (featuredProjectIds.length !== featured)
        throw new Error(
          `Source drift: ${file} has ${featuredProjectIds.length} featured projects, expected ${featured}`,
        );

      const pagePricing = parsePricing(root, key, locale, copy.pricing?.title ?? '', ctx);
      if (pagePricing) pricing.push(pagePricing);

      const metaContent = (selector: string) =>
        root.querySelector(selector)?.getAttribute('content') ?? undefined;
      const og = root.querySelector('meta[property="og:image"]');
      const seoTitle = processText(root.querySelector('title')?.rawText ?? '', stats).trim();
      const description = metaContent('meta[name="description"]');
      const pagePath = `/${file.replace(/index\.html$/, '')}` as PublicPath;
      const wpId = /\bpage-id-(\d+)\b/.exec(
        /<body[^>]*\sclass="([^"]*)"/.exec(source)?.[1] ?? '',
      )?.[1];

      const serviceTitle = seoTitle.split(' - ')[0];
      const matchedCard = homeCards[locale].find((c) =>
        matchServiceByTitle(c.title, [{ title: serviceTitle }]),
      );

      // Undefined optional fields are dropped by JSON.stringify in the generated file.
      services.push({
        id,
        locale,
        path: pagePath,
        title: serviceTitle,
        translationKey: `service-${key}`,
        sources: [{ file, line: heroLine, sourceId: wpId }],
        key,
        summary: descriptionHtml ? unescape(visibleText(descriptionHtml)) : '',
        homeSummary: matchedCard ? matchedCard.homeSummary : '',
        subServices: matchedCard ? matchedCard.subServices : [],
        arrowHref: matchedCard ? matchedCard.arrowHref : '',
        parentKey: PARENT[key],
        hero,
        benefits,
        faqs,
        testimonialIds: readSlides(root, file).map((s) => s.id),
        featuredProjectIds,
        pricingId: pagePricing?.id,
        seo: {
          title: seoTitle,
          description: description ? processText(description, stats).trim() : undefined,
          canonicalPath: pagePath,
          imageId: og
            ? registry.add(
                og.getAttribute('content'),
                { kind: 'image' },
                { file, line: lineOf(og.range[0]) },
              )?.id
            : undefined,
        },
        offerings,
        sectionCopy: copy,
      });

      // Source oddities kept as-is (see the story's Design Notes).
      const odd = (what: string) => console.log(`source oddity ${file}: ${what} (kept)`);
      if (locale === 'en' && /Công ty/.test(seoTitle)) odd(`VI suffix in title "${seoTitle}"`);
      for (const [section, value] of Object.entries(copy))
        if (locale === 'en' && key !== 'email' && /\bEmail\b/.test(value.title))
          odd(`${section} heading "${value.title}"`);
      if (key === 'vps' && /Hosting/.test(copy.pricing?.title ?? ''))
        odd(`pricing heading "${copy.pricing!.title}"`);
      for (const a of content.querySelectorAll('.show-for-small a[href]')) {
        const href = a.getAttribute('href')!;
        if (href === 'index.html' || href.includes('cloud-vps'))
          odd(`mobile copy link ${href} (mobile copies are not imported)`);
      }
    }
  }
  for (const locale of ['vi', 'en'] as const) {
    const localeServices = services.filter((s) => s.locale === locale);
    for (const card of homeCards[locale]) {
      if (!matchServiceByTitle(card.title, localeServices)) {
        throw new Error(
          `Source drift: ${HOME_PAGES[locale]}: service card "${card.title}" does not match any service`,
        );
      }
    }
  }
  if (services.length !== EXPECTED_SERVICES)
    throw new Error(
      `Source drift: ${services.length} service pages, expected ${EXPECTED_SERVICES}`,
    );
  return { services, pricing };
}
