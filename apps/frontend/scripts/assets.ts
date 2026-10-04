// Media allowlist: `npm run copy:assets` copies every local AssetRef (src/data/assets.ts) and every
// root-absolute url() in src/styles/legacy/**/*.css from ../eras-clone (read-only) to the same
// path under public/; fl-icons are port:css's. `npm run verify:assets` (CI-safe, no mirror needed)
// checks each copied file and fl-icon's sha256 against tests/baseline/source-hash.json (and the
// mirror when present), that every local AssetRef is in the source, that no /wp-includes/ url()
// remains, and that public/wp-content/ holds nothing else. CSS comments are not refs.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AssetRef } from '../src/types/content.ts';

const FORBIDDEN =
  /(?:^|\/)logo-eras-|\.(?:js|mjs|cjs|php|html?|css|map|json)$|(?:^|\/)wp-includes\/|(?:^|\/)dist\/|_files\/|(?:^|\/)\.\.(?:\/|$)/i;

/** Root-absolute `/wp-content/...` ref -> decoded mirror-relative path, else null. */
function toRel(ref: string): string | null {
  const clean = ref.split(/[?#]/)[0];
  return clean.startsWith('/wp-content/') ? decodeURIComponent(clean.slice(1)) : null;
}

/** Sorted mirror-relative paths to copy; throws if any is forbidden. `iconPaths` are excluded. */
export function buildAllowlist(
  assets: Pick<AssetRef, 'src' | 'status'>[],
  cssTexts: string[],
  iconPaths: string[],
): string[] {
  const refs = assets.filter((a) => a.status === 'local').map((a) => a.src);
  for (const css of cssTexts)
    for (const m of css
      .replace(/\/\*[\s\S]*?(?:\*\/|$)/g, '')
      .matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi))
      refs.push(m[2].trim());
  // port:css blanks /wp-includes/ url()s; one left would 404 (it is never copied).
  const wpIncludes = refs.filter((ref) => ref.split(/[?#]/)[0].startsWith('/wp-includes/'));
  if (wpIncludes.length)
    throw new Error(`Forbidden /wp-includes/ refs in asset allowlist:\n${wpIncludes.join('\n')}`);
  const icons = new Set(iconPaths);
  const list = [
    ...new Set(refs.map(toRel).filter((rel): rel is string => rel !== null && !icons.has(rel))),
  ].sort();
  const bad = list.filter((rel) => FORBIDDEN.test(rel));
  if (bad.length) throw new Error(`Forbidden paths in asset allowlist:\n${bad.join('\n')}`);
  return list;
}

// ---------------------------------------------------------------------------------------------

const here = import.meta.dirname;
const ERAS_CLONE_DIR = path.resolve(
  process.env.ERAS_CLONE_DIR ?? path.join(here, '../../../../eras-clone'),
);
const APP = path.resolve(here, '..');
const PUBLIC = path.join(APP, 'public');
const LEGACY = path.join(APP, 'src/styles/legacy');
const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');
const files = (dir: string) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => path.join(e.parentPath, e.name));

async function main() {
  const { assets } = (await import('../src/data/assets.ts')) as { assets: AssetRef[] };
  const css = files(LEGACY)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(f, 'utf8'));
  const manifest = JSON.parse(readFileSync(path.join(LEGACY, 'manifest.json'), 'utf8')) as {
    assets: { source: string }[];
  };
  const icons = manifest.assets.map((a) => a.source);
  const allowlist = buildAllowlist(assets, css, icons);
  const hasMirror = existsSync(ERAS_CLONE_DIR);

  if (!process.argv.includes('--verify')) {
    if (!hasMirror)
      throw new Error(`Source mirror not found at ${ERAS_CLONE_DIR} (set ERAS_CLONE_DIR)`);
    let written = 0;
    let skipped = 0;
    for (const rel of allowlist) {
      const source = path.join(ERAS_CLONE_DIR, rel);
      if (!existsSync(source)) {
        console.log(`missing in mirror, skipped: ${rel}`);
        skipped++;
        continue;
      }
      const target = path.join(PUBLIC, rel);
      if (existsSync(target) && readFileSync(target).equals(readFileSync(source))) continue;
      mkdirSync(path.dirname(target), { recursive: true });
      copyFileSync(source, target);
      console.log(`copied public/${rel}`);
      written++;
    }
    console.log(
      `copy:assets: ${allowlist.length} allowlisted, ${written} written, ${skipped} missing in mirror`,
    );
    return;
  }

  const expected = JSON.parse(
    readFileSync(path.join(APP, 'tests/baseline/source-hash.json'), 'utf8'),
  ) as Record<string, string>;
  const failures: string[] = [];
  let checked = 0;
  const localRels = new Set(
    assets
      .filter((a) => a.status === 'local')
      .map((a) => toRel(a.src))
      .filter((rel) => rel !== null),
  );
  for (const rel of [...allowlist, ...icons]) {
    const target = path.join(PUBLIC, rel);
    // Not in the source hash = not in the mirror: a CSS url() the source never shipped; nothing to
    // copy. A `local` AssetRef must be in the source (a `missing` one is never allowlisted).
    if (!expected[rel]) {
      if (localRels.has(rel))
        failures.push(`local AssetRef not in source-hash.json: public/${rel}`);
      else if (existsSync(target)) failures.push(`not in source-hash.json: public/${rel}`);
      continue;
    }
    if (!existsSync(target)) {
      failures.push(`missing: public/${rel}`);
      continue;
    }
    const actual = sha256(readFileSync(target));
    if (actual !== expected[rel]) failures.push(`hash mismatch vs source-hash.json: public/${rel}`);
    const source = path.join(ERAS_CLONE_DIR, rel);
    if (hasMirror && existsSync(source) && sha256(readFileSync(source)) !== actual)
      failures.push(`hash mismatch vs mirror: public/${rel}`);
    checked++;
  }
  const known = new Set([...allowlist, ...icons]);
  for (const file of files(path.join(PUBLIC, 'wp-content'))) {
    const rel = path.relative(PUBLIC, file).split(path.sep).join('/');
    if (path.basename(file) === '.DS_Store') continue;
    if (/(?:^|\/)logo-eras-/i.test(rel)) failures.push(`Eras logo: public/${rel}`);
    else if (!known.has(rel)) failures.push(`not allowlisted: public/${rel}`);
  }
  if (failures.length) {
    console.error(`verify:assets: ${failures.length} failure(s):\n${failures.join('\n')}`);
    process.exit(1);
  }
  console.log(
    `verify:assets: ${checked} files (${icons.length} fl-icons) match source-hash.json` +
      `${hasMirror ? ' and the mirror' : ''}, ` +
      `${allowlist.length + icons.length - checked} CSS refs absent from source, no stray files`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
