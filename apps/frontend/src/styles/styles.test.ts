// CI-safe guards on the committed CSS port (story 10). Reads src/styles/legacy/manifest.json and
// public/; the styles.json cross-check runs only where the git-ignored docs/ exist.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

type Entry = { file: string; source: string; line: number; htmlLine?: number; sha256: string };
type Manifest = {
  cascade: Entry[];
  sections: (Entry & { route: string })[];
  enOverrides: Entry[];
  assets: { source: string; target: string; sha256: string }[];
};

const APP = path.resolve(__dirname, '../..');
const LEGACY = path.join(__dirname, 'legacy');
const STYLES_JSON = path.resolve(
  process.env.DOCS_DIR ?? path.join(APP, '../../docs'),
  'evidence/styles.json',
);
const manifest = JSON.parse(readFileSync(path.join(LEGACY, 'manifest.json'), 'utf8')) as Manifest;
const legacyFiles = readdirSync(LEGACY, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.css'))
  .map((f) => path.join(LEGACY, f));

describe.skipIf(!existsSync(STYLES_JSON))('manifest vs docs/evidence/styles.json', () => {
  test('every cascade, section and EN override entry matches by source, line and sha256', () => {
    const evidence = new Set(
      (JSON.parse(readFileSync(STYLES_JSON, 'utf8')) as Entry[]).map(
        (e) => `${e.source}:${e.line}:${e.sha256}`,
      ),
    );
    const missing = [...manifest.cascade, ...manifest.sections, ...manifest.enOverrides]
      .map((e) => `${e.source}:${e.line}:${e.sha256}`)
      .filter((key) => !evidence.has(key));
    expect(missing).toEqual([]);
  });

  test('cascade follows index.html order; route head + section blocks ascend by html line', () => {
    const lines = manifest.cascade.map((e) => e.htmlLine!);
    expect(lines).toEqual([...lines].sort((a, b) => a - b));
    expect(new Set(lines).size + 1).toBe(lines.length); // custom-css + wp-custom-css share 157
    for (const route of new Set(manifest.sections.map((s) => s.route))) {
      const own = manifest.sections
        .filter((s) => s.route === route)
        .map((s) => s.htmlLine ?? s.line);
      expect(own, route).toEqual([...own].sort((a, b) => a - b));
    }
  });
});

test('globals.css imports tokens then the cascade in manifest order', () => {
  const imports = [
    ...readFileSync(path.join(__dirname, 'globals.css'), 'utf8').matchAll(/@import '([^']+)'/g),
  ].map((m) => m[1]);
  expect(imports).toEqual([
    './tokens.css',
    ...manifest.cascade.map((e) => `./legacy/${e.file}`),
    './carousel.css',
  ]);
});

test('no webfont loading anywhere under src/', () => {
  // This file names the hosts; the manifest only logs the skipped <link>s.
  const skip = [path.resolve(__filename), path.join(LEGACY, 'manifest.json')];
  const hits: string[] = [];
  for (const rel of readdirSync(path.join(APP, 'src'), { recursive: true, encoding: 'utf8' })) {
    const file = path.join(APP, 'src', rel);
    if (skip.includes(file) || !/\.(css|tsx?|json)$/.test(file)) continue;
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(
      /next\/font|fonts\.googleapis|fonts\.gstatic|cdnfonts|use\.fontawesome/g,
    ))
      hits.push(`${rel}: ${m[0]}`);
    for (const m of text.matchAll(/@font-face\s*\{[^}]*\}/g))
      if (!/font-family\s*:\s*["']?(fl-icons|dearflip)\b/.test(m[0]))
        hits.push(`${rel}: @font-face`);
  }
  expect(hits).toEqual([]);
});

test('public fl-icons files match the source hashes', () => {
  expect(manifest.assets).toHaveLength(6);
  for (const { target, sha256 } of manifest.assets) {
    const data = readFileSync(path.join(APP, target));
    expect(createHash('sha256').update(data).digest('hex'), target).toBe(sha256);
  }
});

test('every url() in legacy CSS is root-absolute or data:', () => {
  const bad: string[] = [];
  for (const file of legacyFiles) {
    const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const [, url] of css.matchAll(/url\(\s*["']?([^"')\s]*)/g))
      if (!/^(\/[^/]|data:)/.test(url)) bad.push(`${path.relative(LEGACY, file)}: ${url}`);
  }
  expect(bad).toEqual([]);
});
