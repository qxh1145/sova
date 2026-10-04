import { expect, test } from 'vitest';
import { assertNoLeak } from './html';

test.each([
  ['ERASx', 'ERAS'],
  ['ERAS VIET NAM', 'ERAS'],
  ['0988-606-539', '0988-606-539'],
  ['xem eras/', 'eras/'],
])('assertNoLeak throws on planted %j, naming file and match', (planted, match) => {
  const body = `export const x = ${JSON.stringify([{ id: 'a', text: planted }])};`;
  expect(() => assertNoLeak('pages/legal.ts', body)).toThrow(
    `pages/legal.ts: output contains ${JSON.stringify(match)}`,
  );
});

test('source files, route ids, public paths and asset names are not text', () => {
  const body = JSON.stringify({
    id: 'route-login-eras',
    path: '/login-eras/',
    src: '/assets/ERAS-THUMB-1.jpg',
    sources: [{ file: 'ho-so-nang-luc-eras-vietnam/index.html', line: 1 }],
    text: 'cameras and Sova',
  });
  expect(() => assertNoLeak('routes.ts', body)).not.toThrow();
});

test('an Eras slug inside body HTML is text, not a public path', () => {
  const body = JSON.stringify({ html: '<a href="/eras-portfolio/">x</a>' });
  expect(() => assertNoLeak('posts.ts', body)).toThrow('posts.ts: output contains "eras-"');
});
