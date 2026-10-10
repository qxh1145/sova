import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { legalPages } from '@/data/pages/legal';
import { siteSettings } from '@/data/site';
import { createMockRepository } from '@/lib/repositories/mock';
import type { ContentData, ContentRepository } from '@/lib/repositories/contracts';
import { getLegalPreset } from './legalIds';
import { LegalView } from './LegalView';
import ChinhSachBaoHanhPage from '@/app/(site)/(vi)/chinh-sach-bao-hanh/page';
import EnWarrantyPolicyPage from '@/app/(site)/en/warranty-policy/page';

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
    legalPages,
    paymentGuides: [],
    ...data,
  } as unknown as ContentData);

let repository: ContentRepository = repoWith();
vi.mock('@/lib/repositories', () => ({
  getRepository: () => repository,
}));

describe('LegalView component and routes', () => {
  beforeEach(() => {
    repository = repoWith();
    notFoundMock.mockClear();
  });

  it('renders all 8 legal pages matching their source id and heading presets', () => {
    expect(legalPages).toHaveLength(8);
    for (const page of legalPages) {
      const preset = getLegalPreset(page.path);
      const html = renderToStaticMarkup(<LegalView page={page} />);
      const root = parse(html);

      // Wrapper div#content[role="main"]
      const content = root.querySelector('#content[role="main"]');
      expect(content).not.toBeNull();

      // Banner and text box
      const banner = root.querySelector(`#${preset.heroIds.banner}`);
      expect(banner).not.toBeNull();
      const textBox = root.querySelector(`#${preset.heroIds.textBox}`);
      expect(textBox).not.toBeNull();

      // Heading inside banner
      const headings = banner?.querySelectorAll('h2') ?? [];
      expect(headings).toHaveLength(1);
      const h2 = headings[0];
      expect(h2.text).toBe(page.title);

      for (const cls of preset.headingClass.split(' ')) {
        expect(h2.classList.contains(cls)).toBe(true);
      }

      if (preset.emphasis === 'strong') {
        expect(h2.querySelector('strong')?.text).toBe(page.title);
      } else {
        expect(h2.querySelector('b')?.text).toBe(page.title);
      }

      // Heading wrapper for terms
      if (preset.headingWrap) {
        const wrapRow = root.querySelector(`#${preset.headingWrap.row}`);
        expect(wrapRow).not.toBeNull();
        const wrapCol = wrapRow?.querySelector(`#${preset.headingWrap.col}`);
        expect(wrapCol).not.toBeNull();
        expect(wrapCol?.querySelector('.col-inner > h2')).not.toBeNull();
      }

      // Body row and col
      const bodyRow = root.querySelector(`#${preset.bodyIds.row}`);
      expect(bodyRow).not.toBeNull();
      const bodyCol = bodyRow?.querySelector(`#${preset.bodyIds.col}`);
      expect(bodyCol).not.toBeNull();
      const colInner = bodyCol?.querySelector('.col-inner');
      expect(colInner).not.toBeNull();
      expect(colInner?.innerHTML).toBe(page.body.html);

      // No duplicate ids
      const allIds = root.querySelectorAll('[id]').map((el) => el.getAttribute('id')!);
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    }
  });

  it('repoWith edited legal record: querying and rendering shows updated title and body', async () => {
    const original = legalPages[0];
    const editedTitle = 'TIÊU ĐỀ BẢO HÀNH ĐÃ CẬP NHẬT';
    const editedHtml = '<p>Nội dung chính sách bảo hành mới nhất của Sova.</p>';

    const repo = repoWith({
      legalPages: [
        {
          ...original,
          title: editedTitle,
          body: {
            ...original.body,
            html: editedHtml,
          },
        },
      ],
    });

    const page = await repo.getLegalPage(original.path, original.locale);
    expect(page).not.toBeNull();
    expect(page?.title).toBe(editedTitle);

    const html = renderToStaticMarkup(<LegalView page={page!} />);
    const root = parse(html);

    expect(root.querySelector('h2 b')?.text).toBe(editedTitle);
    expect(root.querySelector('.col-inner')?.innerHTML).toContain(editedHtml);
  });

  it('repoWith missing path: repository returns null', async () => {
    const repo = repoWith({
      legalPages: [],
    });

    const page = await repo.getLegalPage('/non-existent-legal-page/', 'vi');
    expect(page).toBeNull();
  });

  it('invokes notFound() when legal page record is null or missing in route', async () => {
    repository = repoWith({ legalPages: [] });

    await expect(ChinhSachBaoHanhPage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);

    notFoundMock.mockClear();
    await expect(EnWarrantyPolicyPage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('renders route successfully without calling notFound() when record is present', async () => {
    repository = repoWith();
    const result = await ChinhSachBaoHanhPage();
    expect(result).toBeDefined();
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('throws error when rendering a path with no legal preset', () => {
    const dummyPage = {
      ...legalPages[0],
      path: '/unknown-path/' as `/${string}`,
    };
    expect(() => renderToStaticMarkup(<LegalView page={dummyPage} />)).toThrow(
      'Missing legal preset for path: /unknown-path/',
    );
  });
});
