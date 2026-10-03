import { expect, test } from 'vitest';
import type { RouteEntry } from '../../src/types/content';
import { lineLookup, parseHtml } from './html';
import { readHeader, type NavCtx } from './navigation';
import { readStats } from './pages';

const parsed = (body: string) => {
  const source = `<html><body>${body}</body></html>`;
  return { root: parseHtml(source), lineOf: lineLookup(source) };
};
const stats = () => ({ brand: 0, scrub: 0 });

const stat = (value: string, label: string) =>
  `<div class="row row-num"><div class="col"><div class="text count-num"><p><strong><span class="count-up">${value}</span></strong></p></div></div>` +
  `<div class="col"><div class="text"><p><strong><span>+</span></strong></p><p>${label}</p></div></div></div>`;

test('stats: 4 counters in order, "09" -> 9, suffix and label', () => {
  const { root } = parsed(
    `<div class="col col-thanhtuu">${stat('3500', 'Khách hàng')}${stat('1500', 'Dự án')}${stat('40', 'Thành viên')}${stat('09', 'Năm')}</div>`,
  );
  expect(readStats(root, 'index.html', 'vi', stats())).toEqual([
    { id: 'stat-clients-vi', value: 3500, suffix: '+', label: 'Khách hàng' },
    { id: 'stat-projects-vi', value: 1500, suffix: '+', label: 'Dự án' },
    { id: 'stat-members-vi', value: 40, suffix: '+', label: 'Thành viên' },
    { id: 'stat-years-vi', value: 9, suffix: '+', label: 'Năm' },
  ]);
});

test('stats: a missing counter is source drift', () => {
  const { root } = parsed(`<div class="col col-thanhtuu">${stat('1', 'A')}</div>`);
  expect(() => readStats(root, 'index.html', 'vi', stats())).toThrow(/1 stats, expected 4/);
});

const route = (id: string, path: `/${string}`): RouteEntry => ({
  id,
  locale: 'vi',
  path,
  kind: 'home',
  aliases: [],
  source: { file: 'x', line: 1 },
});
const routes = [route('route-root', '/'), route('route-du-an', '/du-an/')];
const menu = (items: string) =>
  `<header id="masthead"><ul class="header-nav-main">${items}</ul></header>`;
const li = (href: string, label: string, extra = '') =>
  `<li class="menu-item ${extra}"><a href="${href}">${label}</a></li>`;

function header(body: string) {
  const { root, lineOf } = parsed(menu(body));
  const ctx: NavCtx = {
    file: 'index.html',
    locale: 'vi',
    lineOf,
    routes,
    stats: stats(),
    dropped: [],
  };
  return { items: () => readHeader(root, ctx), ctx };
}

test('nav: excluded paths and other Eras hosts are dropped and logged; a custom parent has no destination', () => {
  const { items, ctx } = header(
    li('index.html', 'Trang chủ') +
      `<li class="menu-item menu-item-type-custom"><a href="index.html">Dịch vụ</a><ul class="sub-menu">` +
      li('du-an/index.html', 'Dự án') +
      li('giai-phap-truyen-thong-so/index.html', 'Truyền thông') +
      `</ul></li>` +
      li('https://themes.erasvietnam.vn/', 'Kho giao diện') +
      li('tuyen-dung/index.html', 'Tuyển dụng'),
  );
  expect(items()).toEqual([
    {
      id: 'nav-header-vi-root',
      label: 'Trang chủ',
      destination: { kind: 'internal', routeId: 'route-root' },
    },
    {
      id: 'nav-header-vi-dich-vu',
      label: 'Dịch vụ',
      children: [
        {
          id: 'nav-header-vi-du-an',
          label: 'Dự án',
          destination: { kind: 'internal', routeId: 'route-du-an' },
        },
      ],
    },
  ]);
  expect(ctx.dropped.map((d) => d.split(' ')[1])).toEqual([
    'giai-phap-truyen-thong-so/index.html',
    'https://themes.erasvietnam.vn/',
    'tuyen-dung/index.html',
  ]);
});

test('nav: an internal href that resolves to no route throws naming it', () => {
  const { items } = header(li('khong-ton-tai/index.html', 'Lạc'));
  expect(items).toThrow(/khong-ton-tai\/index\.html/);
});
