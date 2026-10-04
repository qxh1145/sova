import { expect, test } from 'vitest';
import { buildAllowlist } from './assets.ts';

const ICON = 'wp-content/themes/flatsome/assets/css/icons/fl-icons__q_924b4500d740.svg';
const local = (src: string) => ({ src, status: 'local' as const });

test('strips fragments and queries, excludes fl-icons, dedupes data and CSS', () => {
  const css =
    `a{background:url("/${ICON}#fl-icons")}` +
    `b{background:url(/wp-content/uploads/2025/04/x.png?v=2)}` +
    `c{background:url('/wp-content/themes/flatsome/assets/img/underline.png')}` +
    `d{background:url("data:image/png;base64,AA==")}`;
  expect(buildAllowlist([local('/wp-content/uploads/2025/04/x.png')], [css], [ICON])).toEqual([
    'wp-content/themes/flatsome/assets/img/underline.png',
    'wp-content/uploads/2025/04/x.png',
  ]);
});

test('ignores missing, remote and non-wp-content AssetRefs; decodes % escapes', () => {
  const assets = [
    local('/wp-content/uploads/2023/06/a%20b__q_1.webp'),
    { src: '/wp-content/uploads/2023/06/gone.webp', status: 'missing' as const },
    { src: 'https://mona.media/x.png', status: 'remote' as const },
    local('/sova-wordmark.svg'),
  ];
  expect(buildAllowlist(assets, [], [])).toEqual(['wp-content/uploads/2023/06/a b__q_1.webp']);
});

test.each([
  '/wp-content/uploads/2025/08/logo-eras-White-1.svg',
  '/wp-content/plugins/x/script.js',
  '/wp-content/dist/a.png',
  '/wp-content/uploads/Trang_files/a.png',
  '/wp-content/../index.html',
])('throws on forbidden path %s', (src) => {
  expect(() => buildAllowlist([local(src)], [], [])).toThrow(/Forbidden/);
});
