import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
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
