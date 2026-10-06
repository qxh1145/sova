import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from 'vitest';

const SCRIPT = path.join(__dirname, 'check-components.ts');

/** `source` null: no components dir at all. */
function run(source: string | null) {
  const dir = mkdtempSync(path.join(tmpdir(), 'check-components-'));
  if (source !== null) writeFileSync(path.join(dir, 'x.tsx'), source);
  return spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', SCRIPT], {
    env: { ...process.env, COMPONENTS_DIR: source === null ? path.join(dir, 'none') : dir },
    encoding: 'utf8',
  });
}

const clean = `export function Card({ title, onClick }: { title: string; onClick: () => void }) {
  const items = [1, 2].map((n) => <li key={n}>{n}</li>);
  return (
    <div className="card" aria-label={title} onClick={() => onClick()}>
      <h2>{title}</h2>
      <ul>{items}</ul>
    </div>
  );
}
`;

test('a clean tree passes, as does a missing components dir', () => {
  expect(run(clean).status).toBe(0);
  expect(run(null).status).toBe(0);
});

test.each([
  ['JSX text', '<p>Liên hệ ngay</p>'],
  ['multi-line JSX text', '<p>\n  Liên hệ ngay\n</p>'],
  ['attribute text', '<img alt="Logo công ty" src={src} />'],
  ['brand', '<p>{"Eras"}</p>'],
  ['contact value', '<a href={"tel:0988606539"}>{label}</a>'],
])('a planted %s fails naming file:line', (_, jsx) => {
  const { status, stderr } = run(`${clean}\nexport const X = () => (\n  ${jsx}\n);\n`);
  expect(status).toBe(1);
  expect(stderr).toMatch(/x\.tsx:1[23]: /);
});

test('a line marked business-text-ok passes', () => {
  const source = `export const X = () => <p>Sova</p>; // business-text-ok: wordmark fallback\n`;
  expect(run(source).status).toBe(0);
});

test('every listed dir is scanned (components and app by default)', () => {
  const components = mkdtempSync(path.join(tmpdir(), 'check-components-'));
  const app = mkdtempSync(path.join(tmpdir(), 'check-components-'));
  writeFileSync(path.join(components, 'ok.tsx'), clean);
  writeFileSync(path.join(app, 'page.tsx'), 'export default () => <p>Liên hệ</p>;\n');
  const { status, stderr } = spawnSync(
    process.execPath,
    ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', SCRIPT],
    {
      env: { ...process.env, COMPONENTS_DIR: [components, app].join(path.delimiter) },
      encoding: 'utf8',
    },
  );
  expect(status).toBe(1);
  expect(stderr).toMatch(/page\.tsx:1: JSX text/);
});

test('by default src/components and src/app are both scanned', () => {
  const env = { ...process.env };
  delete env.COMPONENTS_DIR;
  const count = ['../src/components', '../src/app']
    .map((dir) => path.join(__dirname, dir))
    .filter((dir) => existsSync(dir))
    .flatMap((dir) => readdirSync(dir, { recursive: true, encoding: 'utf8' }))
    .filter((f) => f.endsWith('.tsx')).length;
  expect(count).toBeGreaterThan(0);
  const { stdout } = spawnSync(
    process.execPath,
    ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', SCRIPT],
    { env, encoding: 'utf8' },
  );
  expect(stdout).toContain(`check:components: ${count} files clean`);
});

test('forbidden import of @/data or @/dev fails in component subdirs', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'check-components-'));
  const uiDir = path.join(dir, 'ui');
  mkdirSync(uiDir, { recursive: true });
  writeFileSync(
    path.join(uiDir, 'Button.tsx'),
    `import { routes } from '@/data/routes';\nexport const Button = () => <button>Click</button>; // business-text-ok: test\n`,
  );
  const { status, stderr } = spawnSync(
    process.execPath,
    ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', SCRIPT],
    {
      env: { ...process.env, COMPONENTS_DIR: dir },
      encoding: 'utf8',
    },
  );
  expect(status).toBe(1);
  expect(stderr).toMatch(/Button\.tsx:1: forbidden import "@\/data\/routes"/);
});

test('unanchored imports like @/database or @/devices do not trigger false positive', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'check-components-'));
  const uiDir = path.join(dir, 'ui');
  mkdirSync(uiDir, { recursive: true });
  writeFileSync(
    path.join(uiDir, 'Card.tsx'),
    `import { db } from '@/database';\nimport { dev } from '@/devices';\nexport const Card = () => <div />;\n`,
  );
  const { status } = spawnSync(
    process.execPath,
    ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', SCRIPT],
    {
      env: { ...process.env, COMPONENTS_DIR: dir },
      encoding: 'utf8',
    },
  );
  expect(status).toBe(0);
});

test('COMPONENTS_DIR pointing directly to a component subdir is scanned for forbidden imports', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'check-components-'));
  const formsDir = path.join(dir, 'forms');
  mkdirSync(formsDir, { recursive: true });
  writeFileSync(
    path.join(formsDir, 'MyForm.tsx'),
    `import { fixtures } from '@/dev/fixtures';\nexport const MyForm = () => <form />;\n`,
  );
  const { status, stderr } = spawnSync(
    process.execPath,
    ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', SCRIPT],
    {
      env: { ...process.env, COMPONENTS_DIR: formsDir },
      encoding: 'utf8',
    },
  );
  expect(status).toBe(1);
  expect(stderr).toMatch(/MyForm\.tsx:1: forbidden import "@\/dev\/fixtures"/);
});

test.each([
  ['export from', `export { x } from '@/data/x';`, /forbidden export from "@\/data\/x"/],
  [
    'dynamic import()',
    `export const load = () => import('@/dev/x');`,
    /forbidden dynamic import "@\/dev\/x"/,
  ],
  ['require()', `export const d = require('@/data');`, /forbidden dynamic import "@\/data"/],
  [
    'relative path',
    `import r from '../../data/routes';`,
    /forbidden import "\.\.\/\.\.\/data\/routes"/,
  ],
  ['src/ specifier', `import f from 'src/dev/x';`, /forbidden import "src\/dev\/x"/],
])('forbidden %s is reported', (_name, line, message) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'check-components-'));
  mkdirSync(path.join(dir, 'ui'));
  writeFileSync(path.join(dir, 'ui', 'Mod.ts'), `${line}\n`);
  const { status, stderr } = spawnSync(
    process.execPath,
    ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', SCRIPT],
    { env: { ...process.env, COMPONENTS_DIR: dir }, encoding: 'utf8' },
  );
  expect(status).toBe(1);
  expect(stderr).toMatch(message);
});

test('a relative import outside data/dev passes', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'check-components-'));
  mkdirSync(path.join(dir, 'ui'));
  writeFileSync(path.join(dir, 'ui', 'Mod.ts'), `import u from '../../lib/utils';\n`);
  const { status } = spawnSync(
    process.execPath,
    ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', SCRIPT],
    { env: { ...process.env, COMPONENTS_DIR: dir }, encoding: 'utf8' },
  );
  expect(status).toBe(0);
});
