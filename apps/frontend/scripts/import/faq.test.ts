import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from 'vitest';
import { crossCheck } from './faq';

const evidence = (rows: { source: string; line: number }[]) => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'faq-evidence-')), 'faq.json');
  writeFileSync(file, JSON.stringify(rows));
  return file;
};

const rows = [
  { source: 'cau-hoi-thuong-gap/index.html', line: 10 },
  { source: 'cau-hoi-thuong-gap/index.mirror-20261002.html', line: 10 },
  { source: 'index.html', line: 5 },
  { source: 'en/home/index.html', line: 5 },
];

test('mirror copies and home pages are excluded; matching occurrences pass', () => {
  expect(crossCheck(evidence(rows), [{ file: 'cau-hoi-thuong-gap/index.html', line: 10 }])).toBe(1);
});

test('source drift exits with the counts', () => {
  expect(() => crossCheck(evidence(rows), [])).toThrow(
    /parsed 0 FAQ occurrences, evidence has 1 \(1 missing, 0 unexpected\)/,
  );
});
