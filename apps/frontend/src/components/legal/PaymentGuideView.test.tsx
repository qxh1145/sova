import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { paymentGuides } from '@/data/pages/legal';
import { siteSettings } from '@/data/site';
import { createMockRepository } from '@/lib/repositories/mock';
import type { ContentData, ContentRepository } from '@/lib/repositories/contracts';
import { PaymentGuideView } from './PaymentGuideView';
import { getPaymentPreset } from './paymentIds';
import HuongDanThanhToanPage from '@/app/(site)/(vi)/huong-dan-thanh-toan/page';
import PaymentGuidePage from '@/app/(site)/en/payment-guide/page';

const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

const repoWith = (data: Partial<ContentData> = {}) =>
  createMockRepository({
    siteSettings,
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
    paymentGuides,
    ...data,
  } as unknown as ContentData);

let repository: ContentRepository = repoWith();
vi.mock('@/lib/repositories', () => ({
  getRepository: () => repository,
}));

describe('PaymentGuideView component and routes', () => {
  beforeEach(() => {
    repository = repoWith();
    notFoundMock.mockClear();
  });

  it('renders both payment guide pages matching source preset IDs and account counts', () => {
    expect(paymentGuides).toHaveLength(2);
    for (const guide of paymentGuides) {
      const preset = getPaymentPreset(guide.path);
      const html = renderToStaticMarkup(<PaymentGuideView guide={guide} />);
      const root = parse(html);

      // Hero banner
      const banner = root.querySelector(`#${preset.heroIds.banner}`);
      expect(banner).not.toBeNull();
      const h2 = banner?.querySelector('h2');
      expect(h2).not.toBeNull();
      expect(h2?.text).toBe(guide.title);
      expect(h2?.querySelector('b')?.text).toBe(guide.title);

      // Main column
      const guideRow = root.querySelector(`#${preset.guideIds.row}`);
      expect(guideRow).not.toBeNull();
      const guideCol = root.querySelector(`#${preset.guideIds.col}`);
      expect(guideCol).not.toBeNull();

      // Cards row
      const cardsRow = root.querySelector(`#${preset.guideIds.cardsRow}`);
      expect(cardsRow).not.toBeNull();

      // Card count and accounts order
      const cards = cardsRow?.querySelectorAll(':scope > .col') ?? [];
      expect(cards.length).toBe(guide.accounts.length);

      // Literal per-locale labels from the source copy
      expect(guide.labels).toEqual(
        guide.locale === 'vi'
          ? { accountNumber: 'Số tài khoản:', holder: 'Chủ tài khoản:' }
          : { accountNumber: 'Account Number:', holder: 'Account Holder:' },
      );

      // Intro before the cards row; step 2 after it; e-wallet row last
      const text = (html: string) => parse(html).text.trim().slice(0, 40);
      const guideText = guideCol?.text ?? '';
      const introAt = guideText.indexOf(text(guide.introduction.html));
      const cardsAt = guideText.indexOf(cardsRow?.text ?? '');
      const instructionsAt = guideText.indexOf(text(guide.instructions.html));
      const walletAt = guideText.indexOf(text(guide.wallet.intro.html));
      expect(introAt).toBeGreaterThanOrEqual(0);
      expect(cardsAt).toBeGreaterThan(introAt);
      expect(instructionsAt).toBeGreaterThan(cardsAt);
      expect(walletAt).toBeGreaterThan(instructionsAt);

      // E-wallet row: intro, missing MoMo QR slot, steps
      const walletRow = guideCol?.querySelector(`#${preset.walletIds.row}`);
      expect(walletRow?.querySelector(`#${preset.walletIds.introCol}`)?.text).toContain(
        text(guide.wallet.intro.html),
      );
      expect(
        walletRow?.querySelector(
          `#${preset.walletIds.qrCol} #${preset.walletIds.imageId} .img-inner [data-media-status="missing"]`,
        ),
      ).not.toBeNull();
      expect(walletRow?.querySelector(`#${preset.walletIds.stepsCol}`)?.text).toContain(
        text(guide.wallet.steps.html),
      );
      expect(guideCol?.querySelectorAll('img')).toHaveLength(0);

      guide.accounts.forEach((account, idx) => {
        const cardCol = root.querySelector(`#${preset.cards[idx].cardCol}`);
        expect(cardCol).not.toBeNull();
        expect(cardCol?.text).toContain(account.bank);
        expect(cardCol?.text).toContain(account.accountNumber);
        expect(cardCol?.text).toContain(account.holder);
        expect(cardCol?.text).toContain(guide.labels.accountNumber);
        expect(cardCol?.text).toContain(guide.labels.holder);

        // QR slot has missing marker and no <img>
        const imgInner = cardCol?.querySelector('.img-inner');
        expect(imgInner).not.toBeNull();
        const missingSlot = imgInner?.querySelector('[data-media-status="missing"]');
        expect(missingSlot).not.toBeNull();
        expect(cardCol?.querySelectorAll('img')).toHaveLength(0);
      });
    }
  });

  it('renders edited account values when mock record is modified', () => {
    const viGuide = paymentGuides.find((g) => g.locale === 'vi')!;
    const editedGuide = {
      ...viGuide,
      accounts: [
        {
          id: 'custom-account-1',
          bank: 'Custom Vietcombank',
          holder: 'CONG TY SOVA VIETNAM',
          accountNumber: '999888777666',
        },
      ],
    };

    const html = renderToStaticMarkup(<PaymentGuideView guide={editedGuide} />);
    const root = parse(html);

    expect(root.text).toContain('Custom Vietcombank');
    expect(root.text).toContain('CONG TY SOVA VIETNAM');
    expect(root.text).toContain('999888777666');
    const cardsRowId = getPaymentPreset(viGuide.path).guideIds.cardsRow;
    expect(root.querySelectorAll(`#${cardsRowId} > .col`)).toHaveLength(1);
  });

  it('throws error when account count exceeds card presets', () => {
    const enGuide = paymentGuides.find((g) => g.locale === 'en')!;
    const expandedGuide = {
      ...enGuide,
      accounts: [
        ...enGuide.accounts,
        {
          id: 'custom-account-3',
          bank: 'Third Test Bank',
          holder: 'THIRD HOLDER',
          accountNumber: '111222333',
        },
      ],
    };

    expect(() => renderToStaticMarkup(<PaymentGuideView guide={expandedGuide} />)).toThrow(
      'Missing payment card preset for account index: 2',
    );
  });

  it('invokes notFound() when payment guide record is missing in route', async () => {
    repository = repoWith({ paymentGuides: [] });

    await expect(HuongDanThanhToanPage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);

    notFoundMock.mockClear();
    await expect(PaymentGuidePage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('renders routes successfully without calling notFound() when record is present', async () => {
    repository = repoWith();

    const viResult = await HuongDanThanhToanPage();
    expect(viResult).toBeDefined();
    expect(notFoundMock).not.toHaveBeenCalled();

    const enResult = await PaymentGuidePage();
    expect(enResult).toBeDefined();
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('throws error when rendering a path with no payment preset', () => {
    const dummyGuide = {
      ...paymentGuides[0],
      path: '/unknown-payment-guide/' as `/${string}`,
    };
    expect(() => renderToStaticMarkup(<PaymentGuideView guide={dummyGuide} />)).toThrow(
      'Missing payment preset for path: /unknown-payment-guide/',
    );
  });
});
