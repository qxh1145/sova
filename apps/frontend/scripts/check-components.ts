// Guard (CI, after lint): business text belongs in src/data, not in src/components. Flags JSX text
// with a letter, alt/title/aria-label/placeholder string literals with a letter, and Eras strings or
// contact values. A line carrying `// business-text-ok: <reason>` is skipped. No components dir passes.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { BRAND_LEAK_RE } from '../src/lib/content/brand.ts';
import { SCRUB_RULES } from '../src/lib/content/scrub.ts';

const here = import.meta.dirname;
const DIR = path.resolve(process.env.COMPONENTS_DIR ?? path.join(here, '../src/components'));
const TEXT_ATTRIBUTES = new Set(['alt', 'title', 'aria-label', 'placeholder']);
const PATTERNS = [BRAND_LEAK_RE, ...SCRUB_RULES.map(([pattern]) => pattern)];
const LETTER = /\p{L}/u;
const ALLOW = /business-text-ok:\s*\S/;

/** [offset, kind, text] of every business string in a .tsx source. */
function scan(text: string): [number, string, string][] {
  const found: [number, string, string][] = [];
  const source = ts.createSourceFile(
    'x.tsx',
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node) && LETTER.test(node.text))
      found.push([node.pos + node.text.search(LETTER), 'JSX text', node.text]);
    if (ts.isJsxAttribute(node) && TEXT_ATTRIBUTES.has(node.name.getText())) {
      const init = node.initializer;
      const literal = init && ts.isJsxExpression(init) ? init.expression : init;
      if (literal && ts.isStringLiteralLike(literal) && LETTER.test(literal.text))
        found.push([literal.getStart(), 'attribute text', literal.text]);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  for (const pattern of PATTERNS)
    for (const match of text.matchAll(pattern))
      found.push([match.index, 'brand/contact', match[0]]);
  return found;
}

const files = existsSync(DIR)
  ? readdirSync(DIR, { recursive: true, encoding: 'utf8' })
      .filter((f) => f.endsWith('.tsx'))
      .sort()
  : [];
const report: string[] = [];
for (const rel of files) {
  const text = readFileSync(path.join(DIR, rel), 'utf8');
  const lines = text.split('\n');
  const file = path.relative(process.cwd(), path.join(DIR, rel)).split(path.sep).join('/');
  for (const [offset, kind, value] of scan(text)) {
    const line = text.slice(0, offset).split('\n').length;
    if (!ALLOW.test(lines[line - 1]))
      report.push(`${file}:${line}: ${kind} ${JSON.stringify(value.trim())}`);
  }
}

if (report.length) {
  console.error(
    `check:components found ${report.length} business string(s):\n${report.join('\n')}`,
  );
  process.exit(1);
}
console.log(`check:components: ${files.length} files clean`);
