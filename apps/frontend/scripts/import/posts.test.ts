import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from 'vitest';
import { parseHtml, sanitize } from './html';
import { classifyAsset, createAssetRegistry } from './assets';
import { importPosts, POST_ALLOWED } from './posts';

const mirror = mkdtempSync(path.join(tmpdir(), 'posts-mirror-'));
mkdirSync(path.join(mirror, 'wp-content/uploads'), { recursive: true });
writeFileSync(path.join(mirror, 'wp-content/uploads/a.webp'), '');
const FILE = 'some-post/index.html';

test('asset classification: local file, Eras host, other host', () => {
  expect(classifyAsset('../wp-content/uploads/a.webp', FILE, mirror)).toEqual({
    src: '/wp-content/uploads/a.webp',
    status: 'local',
  });
  expect(classifyAsset('../wp-content/uploads/gone.webp', FILE, mirror)).toEqual({
    src: '/wp-content/uploads/gone.webp',
    status: 'missing',
  });
  expect(
    classifyAsset('https://eras.erasvietnam.com/wp-content/uploads/b.jpg?_=1', FILE, mirror),
  ).toEqual({ src: '/wp-content/uploads/b.jpg', status: 'missing' });
  expect(classifyAsset('https://erasvietnam.vn/wp-content/uploads/a.webp', FILE, mirror)).toEqual({
    src: '/wp-content/uploads/a.webp',
    status: 'local',
  });
  expect(classifyAsset('https://mona.media/c.png', FILE, mirror)).toEqual({
    src: 'https://mona.media/c.png',
    status: 'missing',
  });
  expect(classifyAsset('data:image/png;base64,AAAA', FILE, mirror)).toBeNull();
});

const hooks = {
  text: (raw: string) => raw,
  href: (raw: string) => raw,
  asset: (el: { getAttribute(name: string): string | undefined }) => {
    const src = el.getAttribute('src');
    return src === 'drop.png' ? null : { src: `/x/${src}`, id: `asset-${src}` };
  },
};

const fixture = parseHtml(
  '<div class="x"><h2 id="h">T</h2><hr class="s"><p style="c">a <span>b</span></p>' +
    '<img class="c" src="i.png" srcset="i-2x.png 2x" alt="A" width="10" height="20" loading="lazy">' +
    '<img src="drop.png"><table><tbody><tr><td colspan="2">c</td></tr></tbody></table>' +
    '<video class="v" width="5" height="6" autoplay><source type="video/mp4" src="v.mp4">' +
    '<a href="https://example.com/v.mp4">fallback</a></video><script>x()</script></div>',
);

test('post allowlist keeps structure and media, drops attributes and fallback', () => {
  expect(sanitize(fixture, hooks, POST_ALLOWED)).toBe(
    '<h2>T</h2><hr><p>a b</p><img src="/x/i.png" alt="A" width="10" height="20">' +
      '<table><tbody><tr><td>c</td></tr></tbody></table>' +
      '<video controls width="5" height="6"><source src="/x/v.mp4" type="video/mp4"></video>',
  );
});

test('default (FAQ) allowlist is unchanged: media and headings unwrapped', () => {
  expect(sanitize(fixture, hooks)).toBe(
    'T<p>a b</p>c<a href="https://example.com/v.mp4">fallback</a>',
  );
});

test('source drift: a listing without the 27 posts exits naming the count', () => {
  const pages = [
    'goc-nhin/',
    ...[2, 3, 4, 5].map((n) => `goc-nhin/page/${n}/`),
    'creative-branding/',
    'goc-nhin-website/',
    'social-marketing/',
    'social-marketing/page/2/',
    'thu-thuat/',
    'thu-thuat/page/2/',
    'tin-tuc/',
    'ux-ui/',
  ];
  for (const dir of pages) {
    mkdirSync(path.join(mirror, dir), { recursive: true });
    writeFileSync(path.join(mirror, dir, 'index.html'), '<html><body></body></html>');
  }
  const stats = { brand: 0, scrub: 0 };
  expect(() => importPosts(mirror, createAssetRegistry(mirror, stats), stats)).toThrow(
    /Source drift: \/goc-nhin\/ has 0 cards, expected 27/,
  );
});
