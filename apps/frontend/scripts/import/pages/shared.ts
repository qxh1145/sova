import { HTMLElement, TextNode, type Node } from 'node-html-parser';
import type {
  AssetRegistry,
} from '../assets.ts';
import type {
  CollectionPlacement,
  EntityId,
  Locale,
  PublicPath,
  RichContent,
  RouteEntry,
  SEO,
  SourceRef,
  Stat,
} from '../../../src/types/content.ts';
import { applyBrandTerms, BRAND_LEAK_RE } from '../../../src/lib/content/brand.ts';
import { ALLOWED, processHref, processText, sanitize, type Stats } from '../html.ts';
import { ERAS_URL_TEXT } from '../posts.ts';
import { matchServiceByTitle, plain, trimBreaks } from '../services.ts';

export const STAT_KEYS = ['clients', 'projects', 'members', 'years'];
export const EXPECTED = { goals: 6, purpose: 4, timeline: 9, capabilities: 3, legalRoutes: 10 };
export const RICH_ALLOWED: ReadonlySet<string> = new Set([...ALLOWED, 'h2', 'h3', 'h4', 'h5', 'h6']);

/** Q1: real payment accounts and QR codes are not imported; these placeholders stand in. */
export const DEMO_ACCOUNT: Record<Locale, { bank: string; holder: string; accountNumber: string }> = {
  vi: { bank: 'Ngân hàng Demo', holder: 'SOVA DEMO', accountNumber: '0000000000' },
  en: { bank: 'Demo Bank', holder: 'SOVA DEMO', accountNumber: '0000000000' },
};
export const PAYMENT_LABELS: Record<Locale, { accountNumber: string; holder: string }> = {
  vi: { accountNumber: 'Số tài khoản:', holder: 'Chủ tài khoản:' },
  en: { accountNumber: 'Account Number:', holder: 'Account Holder:' },
};
/** The account holder named in the e-wallet steps: replaced by the demo holder (Q1). */
export const HOLDER_NAME = /V[ŨU] H[ỒO]NG D[ŨU]NG/gi;
/** Bare uppercase ERAS naming the company in legal copy (the shared brand map keeps it for asset names). */
export const BARE_ERAS = /(?<![\p{L}\p{N}_-])ERAS(?![\p{L}\p{N}_-])/gu;
/** Source typo with no space after the brand ("yêu cầu ERASkhuyến nghị"). */
export const ERAS_TYPO = /ERASkhuyến/gu;

export interface PageRefs {
  routes: RouteEntry[];
  projectIdBySlug: Map<string, EntityId>;
  postIdBySlug: Map<string, EntityId>;
  services: { id: EntityId; path: PublicPath; title: string; locale: Locale }[];
  partnerIds: Set<EntityId>;
}

export { matchServiceByTitle } from '../services.ts';

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

export interface Page {
  route: RouteEntry;
  file: string;
  root: HTMLElement;
  lineOf: (offset: number) => number;
  wpId?: string;
  source?: string;
}

export const placements = (ids: EntityId[]): CollectionPlacement[] =>
  ids.map((entityId, i) => ({ entityId, order: i + 1 }));

export const rich = (html: string, sources: SourceRef[], assetIds: EntityId[] = []): RichContent => ({
  format: 'sanitized-html',
  html,
  assetIds,
  sources,
});

/** Text and href hooks of the shared pipeline; Eras URLs written as text keep their path. */
export function hooks(page: Page, line: number, stats: Stats) {
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

export function seoOf(page: Page, registry: AssetRegistry, stats: Stats): SEO {
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
export function identity(page: Page, id: string, seo: SEO, line: number, title?: string) {
  return {
    id,
    locale: page.route.locale,
    path: page.route.path,
    title: title ?? seo.title.split(' - ')[0],
    sources: [{ file: page.file, line, sourceId: page.wpId }],
  };
}

export const must = <T>(value: T | null | undefined, page: Page, what: string): T => {
  if (value === null || value === undefined || (Array.isArray(value) && !value.length))
    throw new Error(`Source drift: ${page.file} has no ${what}`);
  return value;
};

export const count = <T>(list: T[], expected: number, page: Page, what: string) => {
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

export const bannerTitle = (page: Page, stats: Stats) =>
  plain(must(page.root.querySelector('.banner .text-box h2'), page, 'banner h2'), stats);
