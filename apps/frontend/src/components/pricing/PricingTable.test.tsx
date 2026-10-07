import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { hostingPricing } from '@/data/pricing/hosting';
import { vpsPricing } from '@/data/pricing/vps';
import { PricingTable, PRICING_TABLE_IDS_HOSTING_VI, type TablePricing } from './PricingTable';

const asTable = (p: (typeof hostingPricing)[number]) => {
  if (p.kind !== 'table') throw new Error('expected table pricing');
  return p;
};

const render = (pricing: TablePricing) =>
  parse(
    renderToStaticMarkup(
      <PricingTable
        pricing={pricing}
        copy={{ eyebrow: 'Eyebrow', title: 'Title' }}
        ids={PRICING_TABLE_IDS_HOSTING_VI}
      />,
    ),
  );

describe('PricingTable', () => {
  it('renders one row per plan and one cell per column', () => {
    for (const [pricing, rows] of [
      [asTable(hostingPricing[0]), 8],
      [asTable(vpsPricing[0]), 6],
    ] as const) {
      const root = render(pricing);
      expect(root.querySelectorAll('.vps-table-wrapper > table.vps-table')).toHaveLength(1);
      expect(root.querySelectorAll('thead th').map((th) => th.text)).toEqual(
        pricing.columns.map((c) => c.label),
      );
      const trs = root.querySelectorAll('tbody tr');
      expect(trs).toHaveLength(rows);
      for (const tr of trs) expect(tr.querySelectorAll('td')).toHaveLength(8);
    }
  });

  it('renders money as td.vps-price and the plan name in bold', () => {
    const pricing = asTable(hostingPricing[0]);
    const root = render(pricing);
    expect(root.querySelectorAll('td.vps-price').map((td) => td.text)).toEqual(
      pricing.plans.map((p) => p.price?.displayText),
    );
    expect(root.querySelector('tbody tr td strong')?.text).toBe('Business hosting A');
  });

  it('renders the plan CTA in the last column with target only when external', () => {
    const pricing = asTable(hostingPricing[0]);
    const external = render({
      ...pricing,
      plans: pricing.plans.map((p) => ({
        ...p,
        cta: { label: 'Đăng ký', href: 'https://example.com/chat', external: true },
      })),
    });
    const links = external.querySelectorAll('tbody tr td:last-child a.vps-btn');
    expect(links).toHaveLength(8);
    expect(links[0].getAttribute('href')).toBe('https://example.com/chat');
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[0].querySelector('span')?.text).toBe('Đăng ký');

    const internal = render({
      ...pricing,
      plans: pricing.plans.map((p) => ({ ...p, cta: { label: 'Go', href: '/lien-he/' } })),
    });
    expect(internal.querySelector('a.vps-btn')?.getAttribute('target')).toBeUndefined();
  });

  it('renders included cells as a check or cross', () => {
    const pricing = asTable(hostingPricing[0]);
    const [first, second] = pricing.rows;
    const root = render({
      ...pricing,
      rows: [
        {
          ...first,
          cells: { ...first.cells, 'pricing-hosting-col-5': { kind: 'included', value: true } },
        },
        {
          ...second,
          cells: { ...second.cells, 'pricing-hosting-col-5': { kind: 'included', value: false } },
        },
      ],
    });
    const cells = root.querySelectorAll('tbody tr').map((tr) => tr.querySelectorAll('td')[4].text);
    expect(cells).toEqual(['✓', '✕']);
  });
});
