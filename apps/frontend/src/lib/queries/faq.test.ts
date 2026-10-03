import { expect, test, vi } from 'vitest';
import type { ContentData, ContentRepository } from '@/lib/repositories/contracts';
import { createMockRepository } from '@/lib/repositories/mock';
import type { FAQ, SiteSettings } from '@/types/content';
import { getFAQs } from './faq';

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
