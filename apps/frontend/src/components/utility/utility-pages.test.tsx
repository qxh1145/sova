import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { utilityContent } from '@/data/content';
import { siteSettings } from '@/data/site';
import { shellContent } from '@/data/shell';
import { createMockRepository } from '@/lib/repositories/mock';
import type { ContentData, ContentRepository } from '@/lib/repositories/contracts';
import { ThankYouView } from './ThankYouView';
import ThankYouPage from '@/app/(site)/(vi)/eras-xin-chan-thanh-cam-on-quy-khach/page'; // business-text-ok: route import
import HoSoNangLucPage from '@/app/(site)/(vi)/ho-so-nang-luc-eras-vietnam/page'; // business-text-ok: route import
import EnPortfolioPage from '@/app/(site)/en/porfolio-eras-vietnam/page'; // business-text-ok: route import
import SamplePage from '@/app/(site)/(vi)/sample-page/page';

const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

const thankYouRecord = utilityContent.find((c) => c.id === 'thank-you-vi')!;

const repoWith = (data: Partial<ContentData> = {}) =>
  createMockRepository({
    siteSettings,
    shellContent,
    navigation: [],
    services: [],
    faqs: [],
    testimonials: [],
    partners: [],
    projects: [],
    projectCategories: [],
    posts: [],
    postCategories: [],
    stats: [],
    pricing: [],
    assets: [],
    homePages: [],
    aboutPages: [],
    contactPages: [],
    legalPages: [],
    paymentGuides: [],
    utilityContent,
    ...data,
  } as unknown as ContentData);

let repository: ContentRepository = repoWith();
vi.mock('@/lib/repositories', () => ({
  getRepository: () => repository,
}));

describe('ThankYouView component', () => {
  beforeEach(() => {
    repository = repoWith();
    notFoundMock.mockClear();
  });

  it('renders heading text from record and success svg', () => {
    const html = renderToStaticMarkup(<ThankYouView content={thankYouRecord} />);
    const root = parse(html);

    // Section, col, and frame
    expect(root.querySelector('#section_430522107')).not.toBeNull();
    expect(root.querySelector('#row-884857160')).not.toBeNull();
    expect(root.querySelector('#col-1741565368.col.form_tke')).not.toBeNull();

    // Heading from record
    const h1 = root.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.text).toBe('Gửi thông tin thành công!');

    // Success svg
    const svg = root.querySelector('.success-animate svg');
    expect(svg).not.toBeNull();
    expect(svg?.querySelector('.circle')).not.toBeNull();
    expect(svg?.querySelector('.check')).not.toBeNull();

    // No demo badge when demoLabel is not provided
    expect(root.querySelector('.wpcf7-demo-badge')).toBeNull();

    // No duplicate ids
    const allIds = root.querySelectorAll('[id]').map((el) => el.getAttribute('id')!);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('renders demo badge only when demoLabel is provided', () => {
    const demoLabel = 'Bản demo — chưa gửi thông tin';
    const html = renderToStaticMarkup(
      <ThankYouView content={thankYouRecord} demoLabel={demoLabel} />,
    );
    const root = parse(html);

    const badge = root.querySelector('.wpcf7-demo-badge');
    expect(badge).not.toBeNull();
    expect(badge?.text).toBe(demoLabel);

    // Heading still intact
    const h1 = root.querySelector('h1');
    expect(h1?.text).toBe('Gửi thông tin thành công!');
  });

  it('handles route with demo=1 showing badge', async () => {
    const element = await ThankYouPage({
      searchParams: Promise.resolve({ demo: '1' }),
    });
    const html = renderToStaticMarkup(element);
    const root = parse(html);

    const badge = root.querySelector('.wpcf7-demo-badge');
    expect(badge).not.toBeNull();
    expect(badge?.text).toBe('Bản demo — chưa gửi thông tin');
  });

  it('handles route without demo or demo=0 hiding badge', async () => {
    const elPlain = await ThankYouPage({
      searchParams: Promise.resolve({}),
    });
    const rootPlain = parse(renderToStaticMarkup(elPlain));
    expect(rootPlain.querySelector('.wpcf7-demo-badge')).toBeNull();

    const elZero = await ThankYouPage({
      searchParams: Promise.resolve({ demo: '0' }),
    });
    const rootZero = parse(renderToStaticMarkup(elZero));
    expect(rootZero.querySelector('.wpcf7-demo-badge')).toBeNull();
  });

  it('invokes notFound() when thank-you record is missing', async () => {
    repository = repoWith({ utilityContent: [] });

    await expect(
      ThankYouPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('invokes notFound() when profile VI record is missing', async () => {
    repository = repoWith({ profiles: [] });

    await expect(HoSoNangLucPage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('invokes notFound() when profile EN record is missing', async () => {
    repository = repoWith({ profiles: [] });

    await expect(EnPortfolioPage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('invokes notFound() when sample-page record is missing', async () => {
    repository = repoWith({ utilityContent: [] });

    await expect(SamplePage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});

