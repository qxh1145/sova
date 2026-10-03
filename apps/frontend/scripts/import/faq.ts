import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { HTMLElement } from 'node-html-parser';
import type {
  FAQ,
  FAQPlacement,
  FAQTopic,
  Locale,
  RichContent,
  ServiceKey,
  SourceRef,
} from '../../src/types/content.ts';
import {
  lineLookup,
  parseHtml,
  processHref,
  processText,
  sanitize,
  visibleText,
  type Stats,
} from './html.ts';

// Global FAQ page first, then service pages in this fixed order.
export const PAGES: Record<Locale, { global: string; services: [ServiceKey, string][] }> = {
  vi: {
    global: 'cau-hoi-thuong-gap/index.html',
    services: [
      ['website', 'thiet-ke-website/index.html'],
      ['mobile', 'thiet-ke-app-mobile/index.html'],
      ['seo', 'seo-tu-khoa-website/index.html'],
      ['branding', 'ui-ux-branding-design/index.html'],
      ['email', 'e-mail-doanh-nghiep/index.html'],
      ['storage', 'giai-phap-luu-tru/index.html'],
      ['hosting', 'hosting-doanh-nghiep/index.html'],
      ['vps', 'vps-doanh-nghiep/index.html'],
    ],
  },
  en: {
    global: 'en/faq/index.html',
    services: [
      ['website', 'en/website-development/index.html'],
      ['mobile', 'en/app-mobile-development/index.html'],
      ['seo', 'en/website-keyword-seo/index.html'],
      ['branding', 'en/ui-ux-branding-design-2/index.html'],
      ['email', 'en/business-e-mail/index.html'],
      ['storage', 'en/storage-solution/index.html'],
      ['hosting', 'en/business-hosting/index.html'],
      ['vps', 'en/business-vps/index.html'],
    ],
  },
};

interface Occurrence {
  id: string;
  question: string;
  answerHtml: string;
  source: SourceRef;
}

function readOccurrences(
  erasDir: string,
  file: string,
  locale: Locale,
  stats: Stats,
): { root: HTMLElement; items: Map<HTMLElement, Occurrence> } {
  const source = readFileSync(path.join(erasDir, file), 'utf8');
  const lineOf = lineLookup(source);
  const root = parseHtml(source);
  const items = new Map<HTMLElement, Occurrence>();
  for (const item of root.querySelectorAll('.accordion-item')) {
    const line = lineOf(item.range[0]);
    const digits = /^accordion-(\d+)$/.exec(item.id)?.[1];
    const title = item.querySelector('.accordion-title > span');
    const inner = item.querySelector('.accordion-inner');
    if (!digits || !title || !inner)
      throw new Error(`${file}:${line}: unexpected accordion markup`);
    const answerRoot = item.querySelector('.accordion-inner > .text') ?? inner;
    items.set(item, {
      id: `faq-${locale}-${digits}`,
      question: processText(title.rawText, stats).replace(/\s+/g, ' ').trim(),
      answerHtml: sanitize(answerRoot, {
        text: (raw) => processText(raw, stats),
        href: (raw) => processHref(raw, file, line, stats),
      }),
      source: { file, line, sourceId: item.id },
    });
  }
  return { root, items };
}

/** Dedupe key: number prefix stripped, trimmed, whitespace collapsed, lowercased. */
export const normalizeQuestion = (question: string) =>
  question
    .replace(/^\s*\d+\s*[.)]\s*/, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

export const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const rich = (html: string, sources: SourceRef[]): RichContent => ({
  format: 'sanitized-html',
  html,
  assetIds: [],
  sources,
});

export function importFAQs(erasDir: string, stats: Stats) {
  const faqs: FAQ[] = [];
  const topics: FAQTopic[] = [];
  const occurrences: SourceRef[] = [];
  /** `{locale}:{serviceKey}` -> the page's accordion, in order. */
  const servicePlacements = new Map<string, FAQPlacement[]>();

  for (const locale of ['vi', 'en'] as const) {
    const byQuestion = new Map<string, FAQ>();
    const usedIds = new Set<string>();

    const add = (occ: Occurrence, serviceKey?: ServiceKey): FAQ => {
      occurrences.push(occ.source);
      const key = normalizeQuestion(occ.question);
      const existing = byQuestion.get(key);
      if (!existing) {
        if (usedIds.has(occ.id)) throw new Error(`Duplicate FAQ id ${occ.id} (${occ.source.file})`);
        usedIds.add(occ.id);
        const sources = [occ.source];
        const faq: FAQ = {
          id: occ.id,
          locale,
          question: occ.question,
          answer: rich(occ.answerHtml, sources),
          topicIds: [],
          serviceKeys: serviceKey ? [serviceKey] : [],
          sources,
        };
        byQuestion.set(key, faq);
        faqs.push(faq);
        return faq;
      }
      if (serviceKey && !existing.serviceKeys.includes(serviceKey))
        existing.serviceKeys.push(serviceKey);
      if (visibleText(occ.answerHtml) === visibleText(existing.answer.html)) {
        existing.sources.push(occ.source);
      } else {
        // A05: the first (global) answer stays canonical; a differing service answer is kept
        // verbatim (e.g. the literal "</p") as a source revision of the same FAQ, not fixed.
        existing.sourceRevisions ??= [];
        existing.sourceRevisions.push({
          id: `${existing.id}-${serviceKey ?? 'global'}`,
          answer: rich(occ.answerHtml, [occ.source]),
          sources: [occ.source],
        });
        console.log(`revision ${occ.source.file}:${occ.source.line} -> ${existing.id}`);
      }
      return existing;
    };

    const { global, services } = PAGES[locale];
    const page = readOccurrences(erasDir, global, locale, stats);
    for (const tab of page.root.querySelectorAll('ul.nav li.tab')) {
      const label = tab.querySelector('a > span')?.text.trim();
      const panel = page.root.getElementById(tab.id.replace(/^tab-/, 'tab_'));
      if (!label || !panel) throw new Error(`${global}: tab ${tab.id} has no label or panel`);
      const topic: FAQTopic = {
        id: `faq-topic-${locale}-${slug(tab.id.replace(/^tab-/, ''))}`,
        locale,
        label: processText(label, stats),
        items: [],
      };
      for (const item of panel.querySelectorAll('.accordion-item')) {
        const faq = add(page.items.get(item)!);
        faq.topicIds.push(topic.id);
        topic.items.push({ faqId: faq.id, order: topic.items.length + 1 });
      }
      topics.push(topic);
    }
    const placed = topics.reduce((n, t) => n + (t.locale === locale ? t.items.length : 0), 0);
    if (placed !== page.items.size)
      throw new Error(`${global}: ${page.items.size} items but ${placed} placed in topics`);

    // A13: the 4 storage FAQs are SEO content copied onto the storage page. They are kept as in
    // the source, merged by question like any other, and tagged serviceKeys ['storage'] only;
    // they are not a topic (the global FAQ has no storage tab).
    for (const [serviceKey, file] of services) {
      const items: FAQPlacement[] = [];
      for (const occ of readOccurrences(erasDir, file, locale, stats).items.values()) {
        const faq = add(occ, serviceKey);
        const revision = faq.sourceRevisions?.find((r) => r.sources[0] === occ.source);
        items.push({
          faqId: faq.id,
          order: items.length + 1,
          ...(revision && { sourceRevisionId: revision.id }),
        });
      }
      servicePlacements.set(`${locale}:${serviceKey}`, items);
    }
  }
  return { faqs, topics, occurrences, servicePlacements };
}

/** Compare parsed occurrences with docs/evidence/faq-occurrences.json (minus mirror copies and home). */
export function crossCheck(evidenceFile: string, parsed: SourceRef[]) {
  const rows = JSON.parse(readFileSync(evidenceFile, 'utf8')) as { source: string; line: number }[];
  const expected = rows
    .filter(
      (r) =>
        !/mirror-[^/]*\.html$/.test(r.source) &&
        !['index.html', 'en/home/index.html'].includes(r.source),
    )
    .map((r) => `${r.source}:${r.line}`)
    .sort();
  const actual = parsed.map((s) => `${s.file}:${s.line}`).sort();
  const missing = expected.filter((k) => !actual.includes(k));
  const extra = actual.filter((k) => !expected.includes(k));
  if (missing.length || extra.length) {
    throw new Error(
      `Source drift: parsed ${actual.length} FAQ occurrences, evidence has ${expected.length} ` +
        `(${missing.length} missing, ${extra.length} unexpected): ${[...missing, ...extra].slice(0, 5).join(', ')}`,
    );
  }
  return expected.length;
}
