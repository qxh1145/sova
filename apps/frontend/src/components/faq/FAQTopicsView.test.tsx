import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import type { FAQ, FAQPageContent, FAQTopic } from '@/types/content';
import { FAQTopicsView } from './FAQTopicsView';
import { getFAQPreset, topicSlug } from './faqIds';

describe('topicSlug', () => {
  it('converts label to lowercase and spaces to hyphens matching source slugs', () => {
    expect(topicSlug('UI/UX, Branding Design')).toBe('ui/ux,-branding-design');
    expect(topicSlug('Thiết kế website')).toBe('thiết-kế-website');
    expect(topicSlug('Thiết kế App Mobile')).toBe('thiết-kế-app-mobile');
    expect(topicSlug('SEO từ khoá website')).toBe('seo-từ-khoá-website');
    expect(topicSlug('E-mail doanh nghiệp')).toBe('e-mail-doanh-nghiệp');
    expect(topicSlug('Business hosting')).toBe('business-hosting');
    expect(topicSlug('Business VPS')).toBe('business-vps');
  });
});

describe('FAQTopicsView component', () => {
  const dummyPageVi: FAQPageContent = {
    id: 'faq-vi',
    locale: 'vi',
    path: '/cau-hoi-thuong-gap/',
    title: 'CÂU HỎI THƯỜNG GẶP',
    sources: [{ file: 'cau-hoi-thuong-gap/index.html', line: 618 }],
    translationKey: 'faq',
    breadcrumb: { homeLabel: 'Trang chủ', current: 'Câu hỏi thường gặp' },
    seo: {
      title: 'Câu hỏi thường gặp - Công ty thiết kế website chuyên nghiệp | Sova',
      canonicalPath: '/cau-hoi-thuong-gap/',
    },
  };

  const dummyPageEn: FAQPageContent = {
    id: 'faq-en',
    locale: 'en',
    path: '/en/faq/',
    title: 'FAQ',
    sources: [{ file: 'en/faq/index.html', line: 618 }],
    translationKey: 'faq',
    breadcrumb: { homeLabel: 'Home', current: 'FAQ' },
    seo: {
      title: 'FAQ - Công ty thiết kế website chuyên nghiệp | Sova',
      canonicalPath: '/en/faq/',
    },
  };

  const dummyFaq: FAQ = {
    id: 'faq-vi-1',
    locale: 'vi',
    question: 'Website có chuẩn SEO không?',
    answer: {
      format: 'sanitized-html',
      html: '<p>Tất cả website đều chuẩn SEO.</p>',
      assetIds: [],
      sources: [{ file: 'test', line: 1 }],
    },
    topicIds: ['topic-1'],
    serviceKeys: ['website'],
    sources: [{ file: 'test', line: 1 }],
  };

  const dummyTopic: FAQTopic = {
    id: 'topic-1',
    locale: 'vi',
    label: 'Thiết kế website',
    items: [{ faqId: dummyFaq.id, order: 1 }],
  };

  it('renders VI FAQ structure with correct IDs, heading, breadcrumbs, and tabs', () => {
    const preset = getFAQPreset('vi');
    const html = renderToStaticMarkup(
      <FAQTopicsView page={dummyPageVi} topics={[{ topic: dummyTopic, faqs: [dummyFaq] }]} />,
    );
    const root = parse(html);

    const content = root.querySelector('#content');
    expect(content).not.toBeNull();
    expect(content?.getAttribute('role')).toBe('main');

    const banner = root.querySelector(`#${preset.heroIds.banner}`);
    expect(banner).not.toBeNull();
    expect(banner?.querySelector('h2')?.text.trim()).toBe('CÂU HỎI THƯỜNG GẶP');

    const breadcrumbP = banner?.querySelector('p');
    expect(breadcrumbP).not.toBeNull();
    const homeLink = breadcrumbP?.querySelector('a');
    expect(homeLink?.text.trim()).toBe('Trang chủ');
    expect(homeLink?.getAttribute('href')).toBe('/');
    const currentSpan = breadcrumbP?.querySelector('span');
    expect(currentSpan?.text.trim()).toBe('Câu hỏi thường gặp');

    const section = root.querySelector(`#${preset.sectionId}`);
    expect(section).not.toBeNull();
    const row = section?.querySelector(`#${preset.rowId}`);
    expect(row).not.toBeNull();
    const col = row?.querySelector(`#${preset.colId}`);
    expect(col).not.toBeNull();

    const tabbedContent = col?.querySelector('.tabbed-content.tab_cus_new');
    expect(tabbedContent).not.toBeNull();
    const tabLink = tabbedContent?.querySelector('a[role="tab"]');
    expect(tabLink?.getAttribute('id')).toBe('tab-thiết-kế-website');
    expect(tabLink?.getAttribute('href')).toBe('#tab_thiết-kế-website');
    expect(tabLink?.text.trim()).toBe('Thiết kế website');

    const panel = tabbedContent?.querySelector('#tab_thiết-kế-website');
    expect(panel).not.toBeNull();
    expect(panel?.text).toContain('Website có chuẩn SEO không?');
    expect(panel?.text).toContain('Tất cả website đều chuẩn SEO.');
  });

  it('renders EN FAQ structure with correct IDs and home link', () => {
    const preset = getFAQPreset('en');
    const topicEn: FAQTopic = {
      id: 'topic-en-1',
      locale: 'en',
      label: 'UI/UX, Branding Design',
      items: [],
    };
    const html = renderToStaticMarkup(
      <FAQTopicsView page={dummyPageEn} topics={[{ topic: topicEn, faqs: [] }]} />,
    );
    const root = parse(html);

    const banner = root.querySelector(`#${preset.heroIds.banner}`);
    expect(banner).not.toBeNull();
    expect(banner?.querySelector('h2')?.text.trim()).toBe('FAQ');

    const homeLink = banner?.querySelector('p a');
    expect(homeLink?.text.trim()).toBe('Home');
    expect(homeLink?.getAttribute('href')).toBe('/en/');

    const section = root.querySelector(`#${preset.sectionId}`);
    expect(section).not.toBeNull();
    const tabLink = section?.querySelector('a[role="tab"]');
    expect(tabLink?.getAttribute('id')).toBe('tab-ui/ux,-branding-design');
  });

  it('is data-driven: edited topic label and answer changes render', () => {
    const customTopic: FAQTopic = {
      id: 'custom-topic',
      locale: 'vi',
      label: 'Chủ đề tùy chỉnh mới',
      items: [{ faqId: 'custom-faq', order: 1 }],
    };
    const customFaq: FAQ = {
      ...dummyFaq,
      id: 'custom-faq',
      question: 'Câu hỏi mới tùy chỉnh?',
      answer: {
        ...dummyFaq.answer,
        html: '<p>Câu trả lời mới đã được cập nhật thành công.</p>',
      },
    };

    const html = renderToStaticMarkup(
      <FAQTopicsView page={dummyPageVi} topics={[{ topic: customTopic, faqs: [customFaq] }]} />,
    );
    const root = parse(html);

    expect(root.text).toContain('Chủ đề tùy chỉnh mới');
    expect(root.text).toContain('Câu hỏi mới tùy chỉnh?');
    expect(root.text).toContain('Câu trả lời mới đã được cập nhật thành công.');
  });

  it('handles empty topics gracefully', () => {
    const html = renderToStaticMarkup(<FAQTopicsView page={dummyPageVi} topics={[]} />);
    const root = parse(html);
    expect(root.querySelector('.tabbed-content.tab_cus_new')).not.toBeNull();
  });
});
