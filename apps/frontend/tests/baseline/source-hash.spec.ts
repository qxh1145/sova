import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { ERAS_CLONE_DIR, hashSource, hasSource, missingSourceMessage } from './source';

const HASH_FILE = path.join(__dirname, 'source-hash.json');

test.skip(!hasSource, missingSourceMessage);

test('eras-clone matches the committed source hash', () => {
  const actual = hashSource();
  if (process.env.UPDATE_SOURCE_HASH === '1') {
    writeFileSync(HASH_FILE, JSON.stringify(actual, null, 2) + '\n');
    return;
  }
  const expected: Record<string, string> = JSON.parse(readFileSync(HASH_FILE, 'utf8'));
  const changed = [...new Set([...Object.keys(expected), ...Object.keys(actual)])]
    .filter((rel) => expected[rel] !== actual[rel])
    .sort();
  expect(changed, `Source drift in ${ERAS_CLONE_DIR}:\n${changed.join('\n')}`).toEqual([]);
});
