import { expect, test, vi } from 'vitest';
import type { ContentData, ContentRepository } from '@/lib/repositories/contracts';
import { createMockRepository } from '@/lib/repositories/mock';
import type { FAQ, FAQPlacement, FAQTopic, SiteSettings } from '@/types/content';
import { applyFAQPlacements, getFAQs, getFAQTopics, getPlacedFAQs } from './faq';

let repository: ContentRepository;
vi.mock('@/lib/repositories', () => ({ getRepository: () => repository }));

const sources = [{ file: 'test', line: 1 }];
const faq: FAQ = {
  id: 'faq-1',
  locale: 'vi',
  question: 'Gọi {{site.phone}}?',
  answer: {
    format: 'sanitized-html',
    html: '<p><a href="{{site.phoneHref}}">{{site.phone}}</a>, <a href="mailto:{{site.email}}">{{site.email}}</a> {{site.unknown}}</p>',
    assetIds: [],
    sources,
  },
  topicIds: [],
  serviceKeys: [],
  sources,
};
const settings = (phone: string): SiteSettings => ({
  locale: 'vi',
  companyName: 'Test',
  wordmark: 'Test',
  address: 'A & B',
  phones: [{ label: phone, href: `tel:${phone.replace(/\s/g, '')}` }],
  email: 'hi@example.com',
  socialLinks: [],
  messengerHref: '',
  zaloHref: '',
  mapEmbedUrl: '',
  logoIds: [],
});
// Only faqs and siteSettings are read by these queries.
const repoWith = (phone: string) =>
  createMockRepository({ faqs: [faq], siteSettings: [settings(phone)] } as unknown as ContentData);

test('getFAQs resolves contact tokens from SiteSettings; unknown tokens stay', async () => {
  repository = repoWith('0000 000 000');
  const [resolved] = await getFAQs(['faq-1'], 'vi');
  expect(resolved.question).toBe('Gọi 0000 000 000?');
  expect(resolved.answer.html).toBe(
    '<p><a href="tel:0000000000">0000 000 000</a>, <a href="mailto:hi@example.com">hi@example.com</a> {{site.unknown}}</p>',
  );
});

test('a token-free FAQ resolves without SiteSettings for its locale', async () => {
  const plain: FAQ = {
    ...faq,
    locale: 'en',
    question: 'Plain?',
    answer: { ...faq.answer, html: '<p>Plain</p>' },
  };
  repository = createMockRepository({ faqs: [plain], siteSettings: [] } as unknown as ContentData);
  expect(await getFAQs(['faq-1'], 'en')).toEqual([plain]);
});

test('a changed phone changes the result', async () => {
  repository = repoWith('1111 222 333');
  const [resolved] = await getFAQs(['faq-1'], 'vi');
  expect(resolved.question).toBe('Gọi 1111 222 333?');
  expect(resolved.answer.html).toContain('<a href="tel:1111222333">1111 222 333</a>');
});

test('applyFAQPlacements applies source revision answer when specified', () => {
  const originalAnswer = {
    format: 'sanitized-html' as const,
    html: '<p>Base answer</p>',
    assetIds: [],
    sources,
  };
  const revisionAnswer = {
    format: 'sanitized-html' as const,
    html: '<p>Revision answer</p>',
    assetIds: [],
    sources,
  };
  const testFaq: FAQ = {
    id: 'faq-rev',
    locale: 'vi',
    question: 'Question?',
    answer: originalAnswer,
    topicIds: [],
    serviceKeys: [],
    sources,
    sourceRevisions: [
      {
        id: 'rev-1',
        answer: revisionAnswer,
        sources,
      },
    ],
  };

  const placements: FAQPlacement[] = [{ faqId: 'faq-rev', order: 1, sourceRevisionId: 'rev-1' }];
  const [result] = applyFAQPlacements([testFaq], placements);

  expect(result.answer).toEqual(revisionAnswer);
  expect(result.answer.html).toBe('<p>Revision answer</p>');
});

test('applyFAQPlacements falls back to base answer when revision id is unknown', () => {
  const baseAnswer = {
    format: 'sanitized-html' as const,
    html: '<p>Base answer</p>',
    assetIds: [],
    sources,
  };
  const testFaq: FAQ = {
    id: 'faq-unknown-rev',
    locale: 'vi',
    question: 'Question?',
    answer: baseAnswer,
    topicIds: [],
    serviceKeys: [],
    sources,
    sourceRevisions: [
      {
        id: 'rev-existing',
        answer: {
          format: 'sanitized-html' as const,
          html: '<p>Other revision</p>',
          assetIds: [],
          sources,
        },
        sources,
      },
    ],
  };

  const placements: FAQPlacement[] = [
    { faqId: 'faq-unknown-rev', order: 1, sourceRevisionId: 'rev-does-not-exist' },
  ];
  const [result] = applyFAQPlacements([testFaq], placements);

  expect(result.answer).toEqual(baseAnswer);
  expect(result.answer.html).toBe('<p>Base answer</p>');
});

test('applyFAQPlacements does not mutate source FAQ answer object', () => {
  const baseAnswer = {
    format: 'sanitized-html' as const,
    html: '<p>Original untouched answer</p>',
    assetIds: [],
    sources,
  };
  const testFaq: FAQ = {
    id: 'faq-immutability',
    locale: 'vi',
    question: 'Question?',
    answer: baseAnswer,
    topicIds: [],
    serviceKeys: [],
    sources,
    sourceRevisions: [
      {
        id: 'rev-mod',
        answer: {
          format: 'sanitized-html' as const,
          html: '<p>Modified answer</p>',
          assetIds: [],
          sources,
        },
        sources,
      },
    ],
  };

  const placements: FAQPlacement[] = [
    { faqId: 'faq-immutability', order: 1, sourceRevisionId: 'rev-mod' },
  ];
  applyFAQPlacements([testFaq], placements);

  expect(testFaq.answer).toBe(baseAnswer);
  expect(testFaq.answer.html).toBe('<p>Original untouched answer</p>');
});

test('getPlacedFAQs respects placement order and applies revisions', async () => {
  const faqA: FAQ = {
    id: 'faq-a',
    locale: 'vi',
    question: 'A?',
    answer: { format: 'sanitized-html', html: '<p>Answer A</p>', assetIds: [], sources },
    topicIds: [],
    serviceKeys: [],
    sources,
    sourceRevisions: [
      {
        id: 'rev-a',
        answer: { format: 'sanitized-html', html: '<p>Answer A Rev</p>', assetIds: [], sources },
        sources,
      },
    ],
  };
  const faqB: FAQ = {
    id: 'faq-b',
    locale: 'vi',
    question: 'B?',
    answer: { format: 'sanitized-html', html: '<p>Answer B</p>', assetIds: [], sources },
    topicIds: [],
    serviceKeys: [],
    sources,
  };
  const faqC: FAQ = {
    id: 'faq-c',
    locale: 'vi',
    question: 'C?',
    answer: { format: 'sanitized-html', html: '<p>Answer C</p>', assetIds: [], sources },
    topicIds: [],
    serviceKeys: [],
    sources,
  };

  const customRepo = createMockRepository({
    faqs: [faqA, faqB, faqC],
    siteSettings: [],
  } as unknown as ContentData);

  // Placements given out of order: B (order 2), C (order 1), A (order 3, with revision)
  const placements: FAQPlacement[] = [
    { faqId: 'faq-b', order: 2 },
    { faqId: 'faq-c', order: 1 },
    { faqId: 'faq-a', order: 3, sourceRevisionId: 'rev-a' },
  ];

  const results = await getPlacedFAQs(placements, 'vi', customRepo);

  expect(results.map((r) => r.id)).toEqual(['faq-c', 'faq-b', 'faq-a']);
  expect(results[2].answer.html).toBe('<p>Answer A Rev</p>');
  expect(results[0].answer.html).toBe('<p>Answer C</p>');
  expect(results[1].answer.html).toBe('<p>Answer B</p>');
});

test('injected repo is used by getFAQs, getFAQTopics, and getPlacedFAQs', async () => {
  const defaultFaq: FAQ = {
    id: 'faq-def',
    locale: 'vi',
    question: 'Default?',
    answer: { format: 'sanitized-html', html: '<p>Default</p>', assetIds: [], sources },
    topicIds: [],
    serviceKeys: [],
    sources,
  };
  const customFaq: FAQ = {
    id: 'faq-custom',
    locale: 'vi',
    question: 'Custom?',
    answer: { format: 'sanitized-html', html: '<p>Custom</p>', assetIds: [], sources },
    topicIds: [],
    serviceKeys: [],
    sources,
  };
  const customTopic: FAQTopic = {
    id: 'topic-custom',
    locale: 'vi',
    label: 'Custom Topic',
    items: [{ faqId: 'faq-custom', order: 1 }],
  };

  repository = createMockRepository({
    faqs: [defaultFaq],
    faqTopics: [],
    siteSettings: [],
  } as unknown as ContentData);

  const customRepo = createMockRepository({
    faqs: [customFaq],
    faqTopics: [customTopic],
    siteSettings: [],
  } as unknown as ContentData);

  // Calls without injected repo use the default repository
  const fromDefault = await getFAQs(['faq-def'], 'vi');
  expect(fromDefault[0].id).toBe('faq-def');

  // Calls with injected repo use customRepo
  const fromCustom = await getFAQs(['faq-custom'], 'vi', customRepo);
  expect(fromCustom[0].id).toBe('faq-custom');

  const topicsFromCustom = await getFAQTopics('vi', customRepo);
  expect(topicsFromCustom).toEqual([customTopic]);

  const placedFromCustom = await getPlacedFAQs(
    [{ faqId: 'faq-custom', order: 1 }],
    'vi',
    customRepo,
  );
  expect(placedFromCustom[0].id).toBe('faq-custom');
});
