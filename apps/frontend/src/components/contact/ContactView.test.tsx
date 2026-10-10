import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { contactPages } from '@/data/pages/contact';
import { siteSettings } from '@/data/site';
import { shellContent } from '@/data/shell';
import { assets as allAssets } from '@/data/assets';
import { createMockRepository } from '@/lib/repositories/mock';
import type { ContentData, ContentRepository } from '@/lib/repositories/contracts';
import { getContactAssets, type ContactAssets } from '@/lib/queries/pages';
import { getContactPreset } from './contactIds';
import { ContactView } from './ContactView';
import LienHePage, {
  generateMetadata as generateLienHeMetadata,
} from '@/app/(site)/(vi)/lien-he/page';
import ContactUsPage, {
  generateMetadata as generateContactUsMetadata,
} from '@/app/(site)/en/contact-us/page';

const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

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
    assets: allAssets,
    homePages: [],
    aboutPages: [],
    contactPages,
    legalPages: [],
    paymentGuides: [],
    ...data,
  } as unknown as ContentData);

let repository: ContentRepository = repoWith();
vi.mock('@/lib/repositories', () => ({
  getRepository: () => repository,
}));

describe('ContactView and contact routes', () => {
  // Resolved from the committed import data so a broken asset mapping fails here too.
  let mockAssets: ContactAssets;
  const cardLabels = shellContent[0].floatingContacts;
  beforeAll(async () => {
    mockAssets = await getContactAssets(contactPages[0], repoWith());
  });

  beforeEach(() => {
    repository = repoWith();
    notFoundMock.mockClear();
  });

  it('renders both VI and EN contact pages with matching presets, hero, heading, cards, and map', () => {
    expect(contactPages).toHaveLength(2);
    for (const page of contactPages) {
      const settings = siteSettings.find((s) => s.locale === page.locale)!;
      const preset = getContactPreset(page.locale);
      const html = renderToStaticMarkup(
        <ContactView page={page} settings={settings} assets={mockAssets} cardLabels={cardLabels} />,
      );
      const root = parse(html);

      // Hero
      const hero = root.querySelector(`section#${preset.hero.sectionId}`);
      expect(hero).not.toBeNull();
      expect(hero?.querySelector(`div#${preset.hero.titleId} h1`)?.text).toBe(page.title);
      expect(hero?.querySelector(`div#${preset.hero.breadcrumbId}`)?.text).toContain(
        page.breadcrumb.homeLabel,
      );
      expect(hero?.querySelector(`div#${preset.hero.breadcrumbId}`)?.text).toContain(
        page.breadcrumb.current,
      );

      // Section heading
      const headingEl = root.querySelector(`div#${preset.main.headingTextId} h2 strong`);
      expect(headingEl?.text).toBe(page.sectionHeading);

      // 3 Image cards
      expect(root.querySelector(`div#${preset.main.imageCards.zalo.colId}`)).not.toBeNull();
      expect(root.querySelector(`div#${preset.main.imageCards.hotline.colId}`)).not.toBeNull();
      expect(root.querySelector(`div#${preset.main.imageCards.messenger.colId}`)).not.toBeNull();

      // Info row
      expect(root.querySelector(`div#${preset.main.infoColId} h2 span`)?.text).toBe(page.heading);

      // Empty form column
      const formCol = root.querySelector(`div#${preset.main.formColId}`);
      expect(formCol).not.toBeNull();
      expect(formCol?.querySelector('.col-inner')?.childNodes.length).toBe(0);

      // 3 info cards
      expect(root.text).toContain(settings.address);
      expect(root.text).toContain(settings.phones[0].label);
      expect(root.text).toContain(settings.email);

      // Map iframe
      const iframe = root.querySelector('div.if-black iframe');
      expect(iframe).not.toBeNull();
      expect(iframe?.getAttribute('src')).toBe(settings.mapEmbedUrl);
      expect(iframe?.getAttribute('loading')).toBe('lazy');
      expect(iframe?.getAttribute('height')).toBe('500');
      expect(iframe?.getAttribute('title')).toBe(settings.address);
    }
  });

  it('reflects edited settings in info cards and map iframe', () => {
    const page = contactPages.find((p) => p.locale === 'vi')!;
    const editedSettings = {
      ...siteSettings.find((s) => s.locale === 'vi')!,
      address: '99 Bach Dang, Da Nang',
      phones: [{ label: '0123 456 789', href: 'tel:0123456789' }],
      email: 'custom@sova.vn',
      mapEmbedUrl: 'https://maps.google.com/maps?q=custom&output=embed',
    };

    const html = renderToStaticMarkup(
      <ContactView
        page={page}
        settings={editedSettings}
        assets={mockAssets}
        cardLabels={cardLabels}
      />,
    );
    const root = parse(html);

    expect(root.text).toContain('99 Bach Dang, Da Nang');
    expect(root.text).toContain('0123 456 789');
    expect(root.text).toContain('custom@sova.vn');
    expect(root.querySelector('div.if-black iframe')?.getAttribute('src')).toBe(
      'https://maps.google.com/maps?q=custom&output=embed',
    );
  });

  it('joins every phone label in the phone card and links the first number', () => {
    const page = contactPages.find((p) => p.locale === 'vi')!;
    const twoPhones = {
      ...siteSettings.find((s) => s.locale === 'vi')!,
      phones: [
        { label: '0111 111 111', href: 'tel:0111111111' },
        { label: '0222 222 222', href: 'tel:0222222222' },
      ],
    };

    const root = parse(
      renderToStaticMarkup(
        <ContactView
          page={page}
          settings={twoPhones}
          assets={mockAssets}
          cardLabels={cardLabels}
        />,
      ),
    );
    const phoneCard = root.querySelector(
      `div#${getContactPreset('vi').main.infoColId} a[href^="tel:"]`,
    );
    expect(phoneCard?.getAttribute('href')).toBe('tel:0111111111');
    expect(phoneCard?.text).toContain('0111 111 111 - 0222 222 222');
  });

  it('omits phone card when phones is empty but renders address and email cards', () => {
    const page = contactPages.find((p) => p.locale === 'vi')!;
    const noPhonesSettings = {
      ...siteSettings.find((s) => s.locale === 'vi')!,
      phones: [],
    };

    const html = renderToStaticMarkup(
      <ContactView
        page={page}
        settings={noPhonesSettings}
        assets={mockAssets}
        cardLabels={cardLabels}
      />,
    );
    const root = parse(html);

    expect(root.text).toContain(noPhonesSettings.address);
    expect(root.text).toContain(noPhonesSettings.email);
    expect(root.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it('omits iframe when mapEmbedUrl is empty', () => {
    const page = contactPages.find((p) => p.locale === 'vi')!;
    const noMapSettings = {
      ...siteSettings.find((s) => s.locale === 'vi')!,
      mapEmbedUrl: '',
    };

    const html = renderToStaticMarkup(
      <ContactView
        page={page}
        settings={noMapSettings}
        assets={mockAssets}
        cardLabels={cardLabels}
      />,
    );
    const root = parse(html);

    expect(root.querySelector('div.if-black iframe')).toBeNull();
  });

  it('invokes notFound() when contact page is missing in repository', async () => {
    repository = repoWith({ contactPages: [] });

    await expect(LienHePage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);

    notFoundMock.mockClear();
    await expect(ContactUsPage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('renders route pages successfully when record is present', async () => {
    repository = repoWith();

    for (const Page of [LienHePage, ContactUsPage]) {
      const root = parse(renderToStaticMarkup(await Page()));
      expect(root.querySelector('section .section-bg img')?.getAttribute('src')).toBe(
        '/wp-content/uploads/2024/03/contact_hero_bg.jpg',
      );
      expect(
        root.querySelectorAll('.icon-box .icon-inner img').map((img) => img.getAttribute('src')),
      ).toEqual([
        '/wp-content/uploads/2024/02/Mask-group.svg',
        '/wp-content/uploads/2024/02/Mask-group-1.svg',
        '/wp-content/uploads/2024/02/Mask-group.png',
      ]);
      expect(
        root.querySelectorAll('.img_contact a').map((a) => a.getAttribute('aria-label')),
      ).toEqual(['Chat Zalo', 'Hotline', 'Messenger']);
    }
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('generates metadata from page.seo or returns empty object when page missing', async () => {
    const viMeta = await generateLienHeMetadata();
    expect(viMeta.title).toBe(contactPages.find((p) => p.locale === 'vi')?.seo.title);
    expect(viMeta.description).toBe(contactPages.find((p) => p.locale === 'vi')?.seo.description);

    const enMeta = await generateContactUsMetadata();
    expect(enMeta.title).toBe(contactPages.find((p) => p.locale === 'en')?.seo.title);
    expect(enMeta.description).toBe(contactPages.find((p) => p.locale === 'en')?.seo.description);

    repository = repoWith({ contactPages: [] });
    expect(await generateLienHeMetadata()).toEqual({});
    expect(await generateContactUsMetadata()).toEqual({});
  });
});
