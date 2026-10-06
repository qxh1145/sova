import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { ServicesAccordion, toggleAccordionIndex } from './ServicesAccordion';
import type { Service } from '@/types/content';

describe('ServicesAccordion state transitions', () => {
  it('toggleAccordionIndex transitions sequentially across items', () => {
    let current: number | null = 0;
    current = toggleAccordionIndex(current, 1);
    expect(current).toBe(1);
    current = toggleAccordionIndex(current, 1);
    expect(current).toBeNull();
    current = toggleAccordionIndex(current, 0);
    expect(current).toBe(0);
  });

  it('single-open: toggling item 1 closes item 0 and opens item 1', () => {
    const next = toggleAccordionIndex(0, 1);
    expect(next).toBe(1);
  });

  it('self-close: toggling currently open item closes it (null)', () => {
    const closed = toggleAccordionIndex(1, 1);
    expect(closed).toBeNull();
  });

  it('opening an item when all are closed opens that item', () => {
    const opened = toggleAccordionIndex(null, 2);
    expect(opened).toBe(2);
  });
});

describe('ServicesAccordion markup and initial render', () => {
  const mockServices: Service[] = [
    {
      id: 'serv-1',
      locale: 'vi',
      path: '/serv-1/',
      title: 'Dịch vụ 1',
      key: 'website',
      summary: 'Summary 1',
      homeSummary: 'Home Summary 1',
      subServices: [],
      arrowHref: '/serv-1/',
      hero: { headingLines: ['Title 1'] },
      benefits: [],
      faqs: [],
      testimonialIds: [],
      featuredProjectIds: [],
      seo: { title: 'SEO 1', canonicalPath: '/serv-1/' },
      offerings: [],
      sectionCopy: {},
      sources: [],
    },
    {
      id: 'serv-2',
      locale: 'vi',
      path: '/serv-2/',
      title: 'Dịch vụ 2',
      key: 'storage',
      summary: 'Summary 2',
      homeSummary: 'Home Summary 2',
      subServices: [
        { label: 'Sub A', href: '/sub-a/' },
        { label: 'Sub B', href: '/sub-b/' },
      ],
      arrowHref: '/serv-2/',
      hero: { headingLines: ['Title 2'] },
      benefits: [],
      faqs: [],
      testimonialIds: [],
      featuredProjectIds: [],
      seo: { title: 'SEO 2', canonicalPath: '/serv-2/' },
      offerings: [],
      sectionCopy: {},
      sources: [],
    },
  ];

  it('renders initial markup: first item active with aria-expanded="true", second closed with aria-expanded="false"', () => {
    const html = renderToStaticMarkup(<ServicesAccordion services={mockServices} id="acc-test" />);
    const root = parse(html);

    const items = root.querySelectorAll('.accordion-item');
    expect(items).toHaveLength(2);

    // Item 0 is open
    expect(items[0].classList.contains('is-active')).toBe(true);
    const btn0 = items[0].querySelector('button.accordion-title');
    expect(btn0).toBeDefined();
    expect(btn0!.classList.contains('active')).toBe(true);
    expect(btn0!.getAttribute('aria-expanded')).toBe('true');
    expect(btn0!.getAttribute('aria-controls')).toBe('acc-panel-0');
    expect(items[0].querySelector('.acc-num')?.text).toBe('01/');
    expect(items[0].querySelector('.acc-title')?.text).toBe('Dịch vụ 1');

    const panel0 = items[0].querySelector('.accordion-inner');
    expect(panel0).toBeDefined();
    expect(panel0!.getAttribute('id')).toBe('acc-panel-0');
    expect(panel0!.getAttribute('style')).toContain('display:block');
    expect(panel0!.querySelector('.mta_dv')?.text).toBe('Home Summary 1');
    expect(panel0!.querySelector('.nut_xthem a')?.getAttribute('href')).toBe('/serv-1/');

    // Item 1 is closed
    expect(items[1].classList.contains('is-active')).toBe(false);
    expect(items[1].classList.contains('dich_vu_last')).toBe(true);
    const btn1 = items[1].querySelector('button.accordion-title');
    expect(btn1!.classList.contains('active')).toBe(false);
    expect(btn1!.getAttribute('aria-expanded')).toBe('false');

    const panel1 = items[1].querySelector('.accordion-inner');
    expect(panel1!.getAttribute('style')).toContain('display:none');

    // Sub-services in item 1
    const subLinks = items[1].querySelectorAll('.dv-con a');
    expect(subLinks).toHaveLength(2);
    expect(subLinks[0].text).toBe('Sub A');
    expect(subLinks[0].getAttribute('href')).toBe('/sub-a/');
    expect(subLinks[1].text).toBe('Sub B');
    expect(subLinks[1].getAttribute('href')).toBe('/sub-b/');
  });

  it('renders null when services array is empty', () => {
    const html = renderToStaticMarkup(<ServicesAccordion services={[]} />);
    expect(html).toBe('');
  });
});
