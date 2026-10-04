// Post-build guard (CI, after `next build`): no Eras string or scrubbed Eras contact value in the
// built output. Matches listed in scripts/brand-exceptions.json ({file?, match, within?, reason})
// pass; `within` limits an exception to a match inside that string (e.g. a kept source slug).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { BRAND_LEAK_RE } from '../src/lib/content/brand.ts';
import { SCRUB_RULES } from '../src/lib/content/scrub.ts';

const here = import.meta.dirname;
const NEXT_DIR = path.resolve(process.env.NEXT_DIR ?? path.join(here, '../.next'));
const TEXT_EXT = /\.(html|js|mjs|cjs|json|txt|rsc|css|map|body|meta|svg|xml)$/;
const PATTERNS = [BRAND_LEAK_RE, ...SCRUB_RULES.map(([pattern]) => pattern)];

type Exception = { file?: string; match: string; within?: string; reason: string };
const exceptions = JSON.parse(
  readFileSync(process.env.BRAND_EXCEPTIONS ?? path.join(here, 'brand-exceptions.json'), 'utf8'),
) as Exception[];
const allowed = (file: string, match: string, text: string, index: number) =>
  exceptions.some(
    (e) =>
      e.match === match &&
      (!e.file || e.file === file) &&
      (!e.within ||
        text
          .slice(Math.max(0, index - e.within.length), index + match.length + e.within.length)
          .includes(e.within)),
  );

const roots = ['server', 'static'].map((dir) => path.join(NEXT_DIR, dir));
if (!roots.every(existsSync)) {
  console.error(`No build output under ${NEXT_DIR} (run next build first)`);
  process.exit(1);
}

const leaks: string[] = [];
let scanned = 0;
for (const root of roots) {
  for (const rel of readdirSync(root, { recursive: true, encoding: 'utf8' })) {
    if (!TEXT_EXT.test(rel)) continue;
    const file = path.relative(NEXT_DIR, path.join(root, rel)).split(path.sep).join('/');
    const text = readFileSync(path.join(root, rel), 'utf8');
    scanned++;
    for (const pattern of PATTERNS) {
      for (const { 0: match, index } of text.matchAll(pattern)) {
        if (allowed(file, match, text, index)) continue;
        const context = text.slice(Math.max(0, index - 40), index + match.length + 40);
        leaks.push(`${file}: ${JSON.stringify(match)} in …${context.replace(/\s+/g, ' ')}…`);
      }
    }
  }
}

if (leaks.length) {
  console.error(`check:brand found ${leaks.length} match(es):\n${leaks.join('\n')}`);
  process.exit(1);
}
console.log(`check:brand: ${scanned} files clean`);
