import { expect, test } from 'vitest';
import type { RouteEntry } from '../../src/types/content';
import { lineLookup, parseHtml, processHref } from './html';
import { readHeader, type NavCtx } from './navigation';
import { faqPage, matchServiceByTitle, readStats, resolveServiceCard } from './pages';
import type { AssetRegistry } from './assets';

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

test('services: title matching resolves cards across case and diacritics', () => {
  const services = [
    { id: 'service-website-vi', title: 'Thiết kế website' },
    { id: 'service-mobile-vi', title: 'Thiết kế App Mobile' },
    { id: 'service-seo-vi', title: 'SEO từ khoá website' },
    { id: 'service-mobile-en', title: 'App Mobile Development' },
    { id: 'service-website-en', title: 'Website Development' },
  ];

  expect(matchServiceByTitle('Thiết kế website', services)?.id).toBe('service-website-vi');
  expect(matchServiceByTitle('Thiết kế App mobile', services)?.id).toBe('service-mobile-vi');
  expect(matchServiceByTitle('SEO từ khóa website ', services)?.id).toBe('service-seo-vi');
  expect(matchServiceByTitle('App Mobile Development', services)?.id).toBe('service-mobile-en');
  expect(matchServiceByTitle('Unknown Service', services)).toBeUndefined();
});

test('services: unmatched card title throws Source drift error in home card resolution', () => {
  const { root } = parsed(
    `<div id="content"><div class="hide-for-small"><div class="text dich_vu"><p class="name_dv">Dịch vụ lạ lẫm<br></p></div></div></div>`,
  );
  const localeServices = [{ id: 'service-website-vi', title: 'Thiết kế website' }];
  const card = root.querySelector('.dich_vu')!;
  const nameEl = card.querySelector('.name_dv')!;
  const rawTitle = nameEl.childNodes[0]?.rawText.trim() ?? '';
  expect(() => resolveServiceCard(rawTitle, localeServices, 'index.html')).toThrow(
    /Source drift: index.html: service card "Dịch vụ lạ lẫm" does not match any service/,
  );
});

test('services: EN card 2 resolves to mobile service while keeping website arrow href', () => {
  const enServices = [
    { id: 'service-website-en', title: 'Website Development', path: '/en/website-development/' },
    { id: 'service-mobile-en', title: 'App Mobile Development', path: '/en/app-mobile-development/' },
  ];

  const { root, lineOf } = parsed(
    `<div class="text dich_vu">
       <p class="name_dv">App Mobile Development<br></p>
       <p class="mta_dv">Our mobile solutions...</p>
       <p class="nut_xthem"><a href="../website-development/index.html">→</a></p>
     </div>`,
  );

  const card = root.querySelector('.dich_vu')!;
  const rawTitle = card.querySelector('.name_dv')!.childNodes[0]?.rawText.trim() ?? '';
  const service = matchServiceByTitle(rawTitle, enServices);
  expect(service?.id).toBe('service-mobile-en');

  const arrowEl = card.querySelector('.nut_xthem a')!;
  const arrowHref = processHref(arrowEl.getAttribute('href') ?? '', 'en/home/index.html', lineOf(arrowEl.range[0]), stats());
  expect(arrowHref).toBe('/en/website-development/');
});

test('faqPage imports banner title, breadcrumb home label, current text, and seo', () => {
  const { root, lineOf } = parsed(
    `<div id="content">
       <div class="banner">
         <div class="text-box">
           <h2><b>CÂU HỎI THƯỜNG GẶP</b></h2>
           <p><a href="index.html">Trang chủ</a> <span> Câu hỏi thường gặp</span></p>
         </div>
       </div>
     </div>`,
  );
  const route: RouteEntry = {
    id: 'route-cau-hoi-thuong-gap',
    locale: 'vi',
    path: '/cau-hoi-thuong-gap/',
    kind: 'faq',
    aliases: [],
    source: { file: 'cau-hoi-thuong-gap/index.html', line: 1 },
  };
  const mockRegistry = {
    add: () => undefined,
    image: () => undefined,
  } as unknown as AssetRegistry;
  const page = faqPage(
    {
      root,
      lineOf,
      route,
      file: 'cau-hoi-thuong-gap/index.html',
    } as Parameters<typeof faqPage>[0],
    mockRegistry,
    stats(),
  );

  expect(page.id).toBe('faq-vi');
  expect(page.locale).toBe('vi');
  expect(page.path).toBe('/cau-hoi-thuong-gap/');
  expect(page.title).toBe('CÂU HỎI THƯỜNG GẶP');
  expect(page.translationKey).toBe('faq');
  expect(page.breadcrumb).toEqual({
    homeLabel: 'Trang chủ',
    current: 'Câu hỏi thường gặp',
  });
});

