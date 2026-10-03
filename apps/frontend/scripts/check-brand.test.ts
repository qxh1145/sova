import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from 'vitest';

const SCRIPT = path.join(__dirname, 'check-brand.ts');

function run(page: string, exceptions: unknown[] = []) {
  const dir = mkdtempSync(path.join(tmpdir(), 'check-brand-'));
  mkdirSync(path.join(dir, 'server/app'), { recursive: true });
  mkdirSync(path.join(dir, 'static'));
  writeFileSync(path.join(dir, 'server/app/index.html'), page);
  writeFileSync(path.join(dir, 'exceptions.json'), JSON.stringify(exceptions));
  return spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', SCRIPT], {
    env: { ...process.env, NEXT_DIR: dir, BRAND_EXCEPTIONS: path.join(dir, 'exceptions.json') },
    encoding: 'utf8',
  });
}

test('clean output passes', () => {
  expect(run('<p>Sova 0000 000 000</p>').status).toBe(0);
});

test.each(['<p>Eras</p>', '<p>Gọi 0988.606.539</p>'])(
  'planted %j fails with file and match',
  (page) => {
    const { status, stderr } = run(page);
    expect(status).toBe(1);
    expect(stderr).toContain('server/app/index.html');
  },
);

test('a listed exception passes', () => {
  const exception = { file: 'server/app/index.html', match: 'Eras', reason: 'test' };
  expect(run('<p>Eras</p>', [exception]).status).toBe(0);
  expect(run('<p>Eras</p>', [{ ...exception, file: 'other.html' }]).status).toBe(1);
});
