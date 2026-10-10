// Guards the committed importer output (the importer itself cannot run in CI).
import { expect, test } from 'vitest';
import { BRAND_LEAK_RE } from '@/lib/content/brand';
import { SCRUB_RULES } from '@/lib/content/scrub';
import type { ServiceKey } from '@/types/content';
import { faqs, faqTopics } from './faq';

const SERVICE_KEYS: ServiceKey[] = [
  'website',
  'mobile',
  'seo',
  'branding',
  'storage',
  'email',
  'hosting',
  'vps',
];

test.each([
  ['vi', 65],
  ['en', 66],
] as const)('%s has 7 topics with %i placements in order', (locale, placements) => {
  const topics = faqTopics.filter((t) => t.locale === locale);
  expect(topics).toHaveLength(7);
  expect(topics.flatMap((t) => t.items)).toHaveLength(placements);
  for (const topic of topics)
    expect(topic.items.map((i) => i.order)).toEqual(topic.items.map((_, i) => i + 1));
});

test('ids are unique and every placement resolves to a FAQ of the same locale and topic', () => {
  const ids = [...faqs.map((f) => f.id), ...faqTopics.map((t) => t.id)];
  expect(new Set(ids).size).toBe(ids.length);
  for (const topic of faqTopics) {
    for (const { faqId } of topic.items) {
      const faq = faqs.find((f) => f.id === faqId);
      expect(faq?.locale).toBe(topic.locale);
      expect(faq?.topicIds).toContain(topic.id);
    }
  }
});

test('every topic placement resolves to a same-locale FAQ placed on a service page unless allowlisted (decision 1)', () => {
  const allowlist = new Set(['faq-vi-3703276752', 'faq-vi-4220319995', 'faq-en-2947114095']);
  for (const topic of faqTopics) {
    for (const { faqId } of topic.items) {
      const faq = faqs.find((f) => f.id === faqId);
      expect(faq).toBeDefined();
      expect(faq?.locale).toBe(topic.locale);
      if (allowlist.has(faqId)) {
        expect(faq?.serviceKeys).toHaveLength(0);
      } else {
        expect(faq?.serviceKeys.length).toBeGreaterThan(0);
      }
    }
  }
});

test.each(['vi', 'en'] as const)('%s has service FAQs for all 8 keys', (locale) => {
  for (const key of SERVICE_KEYS)
    expect(faqs.some((f) => f.locale === locale && f.serviceKeys.includes(key))).toBe(true);
});

test('A13: storage FAQs are not in any topic', () => {
  const storage = faqs.filter((f) => f.serviceKeys.includes('storage') && f.topicIds.length === 0);
  expect(storage.map((f) => f.locale).sort()).toEqual([
    'en',
    'en',
    'en',
    'en',
    'vi',
    'vi',
    'vi',
    'vi',
  ]);
});

test('A05: exactly one source revision, on the SEO service', () => {
  const revisions = faqs.flatMap((f) => f.sourceRevisions ?? []);
  expect(revisions).toHaveLength(1);
  expect(revisions[0].sources[0].file).toBe('seo-tu-khoa-website/index.html');
  expect(revisions[0].answer.html).toContain('&lt;/p');
});

test('every record keeps its source', () => {
  for (const faq of faqs) {
    expect(faq.sources.length).toBeGreaterThan(0);
    expect(faq.answer.sources.length).toBeGreaterThan(0);
  }
});

test('no Eras word or raw Eras contact value anywhere', () => {
  const text = JSON.stringify({ faqs, faqTopics });
  expect([...text.matchAll(BRAND_LEAK_RE)].map((m) => m[0])).toEqual([]);
  for (const [pattern] of SCRUB_RULES) expect(text.match(pattern)).toBeNull();
});
