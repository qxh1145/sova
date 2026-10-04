import { expect, test } from 'vitest';
import { applyBrandTerms, BRAND_LEAK_RE, decodeEscapes, rewriteEraLinks } from './brand';

test.each([
  ['Eras Việt Nam hoạt động', 'Sova hoạt động', 1],
  ['ERAS', 'ERAS', 0],
  ['SEO tại ERAS Việt Nam, ERAS VietNam và Eras VietNam', 'SEO tại Sova, Sova và Sova', 3],
  ['Erasmus', 'Erasmus', 0],
  ['Eras Việt Nam', 'Sova', 1],
  [
    'Eras Vietnam’s SEO, ErasVietnam, Eras Viet Nam and Eras.',
    'Sova’s SEO, Sova, Sova and Sova.',
    4,
  ],
  [
    'ERAS VIET NAM, ERAS VIETNAM, ERAS VIỆT NAM, ERAS Vietnam, ERAS Viet Nam',
    'Sova, Sova, Sova, Sova, Sova',
    5,
  ],
])('applyBrandTerms(%j)', (input, text, count) => {
  expect(applyBrandTerms(input)).toEqual({ text, count });
});

test('decodeEscapes decodes \\u escapes and HTML entities before matching', () => {
  const decoded = decodeEscapes(
    'Eras Vi\\u1ec7t Nam&#8217;s &amp; Eras&nbsp;&#x27;x&#x27; &unknown;',
  );
  expect(decoded).toBe("Eras Việt Nam’s & Eras 'x' &unknown;");
  expect(applyBrandTerms(decoded).text).toBe("Sova’s & Sova 'x' &unknown;");
});

test('decodeEscapes NFC-normalizes decomposed Vietnamese', () => {
  expect(applyBrandTerms(decodeEscapes('Eras Việt Nam'.normalize('NFD'))).text).toBe('Sova');
});

test.each([
  ['https://erasvietnam.vn/thiet-ke-website/', '/thiet-ke-website/'],
  ['https://www.erasvietnam.vn/en/faq/?a=1#x', '/en/faq/?a=1#x'],
  ['../website-development/index.html', '/en/website-development/'],
  ['../../ui-ux-branding-design/index.mirror-20261002-173609.html', '/ui-ux-branding-design/'],
  ['https://eras.erasvietnam.com/x', null],
  ['https://erasmus.eu/', 'https://erasmus.eu/'],
  ['https://helpdesk.inet.vn/kb', 'https://helpdesk.inet.vn/kb'],
  ['mailto:{{site.email}}', 'mailto:{{site.email}}'],
  ['{{site.phoneHref}}', '{{site.phoneHref}}'],
])('rewriteEraLinks(%j)', (href, expected) => {
  expect(rewriteEraLinks(href, 'https://erasvietnam.vn/en/faq/index.html')).toBe(expected);
});

test.each([
  ['ERASkhuyến', 'ERAS'],
  ['ERAS VIET NAM', 'ERAS'],
  ['ERASx', 'ERAS'],
  ['/login-eras/', 'eras/'],
  ['porfolio-eras-vietnam', 'eras-'],
  ['route-login-eras', 'eras'],
  ['Eras', 'Eras'],
  ['erasvietnam.vn', 'erasvietnam'],
])('BRAND_LEAK_RE flags %j as %j', (text, match) => {
  expect(text.match(BRAND_LEAK_RE)?.[0]).toBe(match);
});

test.each(['/assets/ERAS-THUMB-1.jpg', 'cameras', 'Sova', 'erasmus'])(
  'BRAND_LEAK_RE passes %j',
  (text) => {
    expect(text.match(BRAND_LEAK_RE)).toBeNull();
  },
);
