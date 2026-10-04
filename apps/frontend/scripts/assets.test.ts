import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import { buildAllowlist } from './assets.ts';

const APP = path.resolve(import.meta.dirname, '..');
const SCRIPT = path.join(APP, 'scripts/assets.ts');

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
  '/wp-content/plugins/x/style.css',
  '/wp-content/dist/a.png',
  '/wp-content/uploads/Trang_files/a.png',
  '/wp-content/../index.html',
])('throws on forbidden path %s', (src) => {
  expect(() => buildAllowlist([local(src)], [], [])).toThrow(/Forbidden/);
});

// CLI rows of the plan's matrix: run the real script against the committed public/ files.
const run = (args: string[], env: Record<string, string> = {}) =>
  spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', SCRIPT, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });

test('copy fails fast without the mirror', () => {
  const r = run([], { ERAS_CLONE_DIR: '/nonexistent-eras-clone' });
  expect(r.status).toBe(1);
  expect(r.stderr).toContain('/nonexistent-eras-clone');
});

test('verify passes without the mirror and fails on a stray file', () => {
  const env = { ERAS_CLONE_DIR: '/nonexistent-eras-clone' };
  expect(run(['--verify'], env).status).toBe(0);
  const stray = path.join(APP, 'public/wp-content/uploads/__stray-test.png');
  writeFileSync(stray, 'x');
  try {
    const r = run(['--verify'], env);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('not allowlisted: public/wp-content/uploads/__stray-test.png');
  } finally {
    rmSync(stray);
  }
}, 60_000);

test('verify fails on a changed public byte', () => {
  const file = path.join(APP, 'public/wp-content/uploads/2025/04/tiktok.png');
  const original = readFileSync(file);
  appendFileSync(file, 'x');
  try {
    const r = run(['--verify'], { ERAS_CLONE_DIR: '/nonexistent-eras-clone' });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('hash mismatch vs source-hash.json');
  } finally {
    writeFileSync(file, original);
  }
}, 60_000);

test('verify fails on a dropped Eras logo', () => {
  const logo = path.join(APP, 'public/wp-content/uploads/logo-eras-x.svg');
  writeFileSync(logo, '<svg/>');
  try {
    const r = run(['--verify'], { ERAS_CLONE_DIR: '/nonexistent-eras-clone' });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('Eras logo:');
  } finally {
    rmSync(logo);
  }
}, 60_000);

const MIRROR = path.resolve(
  process.env.ERAS_CLONE_DIR ?? path.join(import.meta.dirname, '../../../../eras-clone'),
);

test.skipIf(!existsSync(MIRROR))(
  'copy re-run against the mirror writes nothing',
  () => {
    const r = run([]);
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/, 0 written,/);
  },
  60_000,
);
