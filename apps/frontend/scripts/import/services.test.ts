import { expect, test } from 'vitest';
import { lineLookup, parseHtml } from './html';
import { featuredProjects, parseCards, parsePricing, parseTable, sectionCopy } from './services';

const page = (html: string) => {
  const source = `<html><body><div id="content">${html}</div></body></html>`;
  return {
    root: parseHtml(source),
    ctx: { file: 'page/index.html', lineOf: lineLookup(source), stats: { brand: 0, scrub: 0 } },
  };
};

const card = (name: string, extra: string, features = 9, cls = '') =>
  `<div class="col ${cls}"><div class="icon-box icon-tke"><div class="text"><h3>${name}</h3>${extra}</div></div>` +
  Array.from(
    { length: features },
    (_, i) =>
      `<div class="icon-box icon-center"><div class="icon-box-text"><div class="text"><p>${i === 1 ? `${name} hosting` : `Feature ${i}`}<br></p></div></div></div>`,
  ).join('') +
  `<div class="text"><p><a class="but-lh" href="zalo://conversation?phone=0988606539">Tư vấn ngay →</a></p></div></div>`;

const cards = (cols: string[]) =>
  `<div class="row eras-table-price hide-for-small">${cols.join('')}</div>`;

test('cards: VI discount label, EN price + original price, shared features, middle card recommended', () => {
  const vi = page(
    cards([
      card('CƠ BẢN', '<div class="text_sale"><h3>Giảm 50%</h3></div>'),
      card('NÂNG CAO', '<div class="text_sale"><h3>Giảm 45%</h3></div>', 9, 'col-blur-blue'),
    ]),
  );
  const { plans, features } = parseCards(vi.root.querySelector('.row')!, 'pricing-website', vi.ctx);
  expect(plans.map((p) => [p.id, p.discountLabel, p.price, p.recommended])).toEqual([
    ['pricing-website-co-ban', 'Giảm 50%', undefined, undefined],
    ['pricing-website-nang-cao', 'Giảm 45%', undefined, true],
  ]);
  expect(plans[0].cta).toEqual({
    label: 'Tư vấn ngay →',
    href: '{{site.zaloHref}}',
    external: true,
  });
  // 8 shared labels + one per plan.
  expect(features).toHaveLength(10);
  expect(plans[1].featureIds[1]).toBe('pricing-website-feature-10');

  const en = page(
    cards([card('PRO', '<p class="gia_giam">18.000.000 VNĐ</p><h3>+15.000.000 VNĐ</h3>')]),
  );
  const [pro] = parseCards(en.root.querySelector('.row')!, 'pricing-website', en.ctx).plans;
  expect([pro.price, pro.originalPrice?.amount, pro.discountLabel]).toEqual([
    { amount: 15000000, currency: 'VND', period: 'once', displayText: '+15.000.000 VNĐ' },
    18000000,
    undefined,
  ]);
});

const table = (rows: number, price = '165.000 VNĐ') =>
  `<section class="section"><p><strong>Dịch vụ</strong></p><div class="text"><h2>Bảng giá dịch vụ</h2></div>` +
  `<div class="vps-table-wrapper"><table class="vps-table"><thead><tr><th>Tên gói</th><th>Dung lượng</th>` +
  `<th>Giá (VND / tháng)</th><th>Đăng ký</th></tr></thead><tbody>` +
  Array.from(
    { length: rows },
    (_, i) =>
      `<tr><td><strong>Plan ${'ABCDEFGH'[i]}</strong></td><td>${i + 1} GB</td><td class="vps-price">${price}</td>` +
      `<td><div class="vps-actions"><a class="vps-btn vps-btn-config" href="#popup">Cấu hình</a>` +
      `<a class="vps-btn" href="https://zalo.me/84988606539"><span>Đăng ký</span></a></div></td></tr>`,
  ).join('') +
  `</tbody></table></div></section>`;

test('table: header cells are columns, one row per plan with a monthly VND price', () => {
  const { root, ctx } = page(table(2));
  const { columns, rows, plans } = parseTable(root.querySelector('table')!, 'pricing-email', ctx);
  expect(columns.map((c) => c.label)).toEqual([
    'Tên gói',
    'Dung lượng',
    'Giá (VND / tháng)',
    'Đăng ký',
  ]);
  expect(rows.map((r) => r.id)).toEqual(plans.map((p) => p.id));
  expect(rows[0]).toEqual({
    id: 'pricing-email-plan-a',
    label: 'Plan A',
    cells: {
      'pricing-email-col-1': { kind: 'text', value: 'Plan A' },
      'pricing-email-col-2': { kind: 'text', value: '1 GB' },
      'pricing-email-col-3': {
        kind: 'money',
        value: { amount: 165000, currency: 'VND', period: 'month', displayText: '165.000 VNĐ' },
      },
      'pricing-email-col-4': { kind: 'text', value: 'Đăng ký' },
    },
  });
  expect(plans[0].cta).toEqual({ label: 'Đăng ký', href: '{{site.zaloHref}}', external: true });
  expect(sectionCopy(root.querySelector('section')!, ctx.stats)).toEqual({
    eyebrow: 'Dịch vụ',
    title: 'Bảng giá dịch vụ',
  });
});

test('sectionCopy keeps h2 <br> breaks as titleLines only for multi-line headings', () => {
  const { root, ctx } = page(
    '<section><h2>Khách hàng nhận xét<br>về chúng tôi</h2></section><section><h2>Một dòng</h2></section>',
  );
  const [multi, single] = root.querySelectorAll('section');
  expect(sectionCopy(multi, ctx.stats)).toEqual({
    title: 'Khách hàng nhận xét về chúng tôi',
    titleLines: ['Khách hàng nhận xét', 'về chúng tôi'],
  });
  expect(sectionCopy(single, ctx.stats)).toEqual({ title: 'Một dòng' });
});

test('source drift: plan count, card features, price format and unknown projects throw', () => {
  const short = page(table(2));
  expect(() => parsePricing(short.root, 'hosting', 'vi', 'Heading', short.ctx)).toThrow(
    /Source drift: page\/index.html has 2 plans, expected 8/,
  );
  const usd = page(table(1, '$5'));
  expect(() => parseTable(usd.root.querySelector('table')!, 'pricing-vps', usd.ctx)).toThrow(
    /Source drift: page\/index.html:\d+: price "\$5" is not VND/,
  );
  const few = page(cards([card('X', '', 8)]));
  expect(() => parsePricing(few.root, 'website', 'en', 'Heading', few.ctx)).toThrow(
    /card X has 8 features, expected 9/,
  );
  const decor = page(
    `<section class="section ss-decor"><a class="item-link" href="../featured_item/known/index.html"></a>` +
      `<a class="item-link" href="../featured_item/gone/index.html"></a></section>`,
  );
  expect(() =>
    featuredProjects(decor.root, 'page/index.html', new Map([['known', 'project-1']])),
  ).toThrow(
    /Source drift: page\/index.html: ..\/featured_item\/gone\/index.html is not an imported project/,
  );
});
