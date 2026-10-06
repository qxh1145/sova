// Guard (CI, after lint): business text belongs in src/data, not in src/components or src/app. Flags
// JSX text with a letter, alt/title/aria-label/placeholder string literals with a letter, and Eras
// strings or contact values. A line carrying `// business-text-ok: <reason>` is skipped. A missing
// dir passes. COMPONENTS_DIR (path-delimiter separated) overrides the scanned dirs.
// Second guard: .ts/.tsx files under ui/, forms/, layout/ and faq/ must not import, re-export,
// import() or require() business data or dev fixtures (@/data, @/dev, src/data, src/dev, ../data).
// Prints "<n> files clean, <m> files checked for imports" on success.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { BRAND_LEAK_RE } from '../src/lib/content/brand.ts';
import { SCRUB_RULES } from '../src/lib/content/scrub.ts';

const here = import.meta.dirname;
const DIRS = (
  process.env.COMPONENTS_DIR?.split(path.delimiter) ?? [
    path.join(here, '../src/components'),
    path.join(here, '../src/app'),
  ]
).map((dir) => path.resolve(dir));
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

const files = DIRS.flatMap((dir) =>
  existsSync(dir)
    ? readdirSync(dir, { recursive: true, encoding: 'utf8' })
        .filter((f) => f.endsWith('.tsx'))
        .sort()
        .map((f) => path.join(dir, f))
    : [],
);
const report: string[] = [];
for (const abs of files) {
  const text = readFileSync(abs, 'utf8');
  const lines = text.split('\n');
  const file = path.relative(process.cwd(), abs).split(path.sep).join('/');
  for (const [offset, kind, value] of scan(text)) {
    const line = text.slice(0, offset).split('\n').length;
    if (!ALLOW.test(lines[line - 1]))
      report.push(`${file}:${line}: ${kind} ${JSON.stringify(value.trim())}`);
  }
}

// Guard: primitives and shell components must never import business data or dev fixtures.
const SUBDIRS = ['ui', 'forms', 'layout', 'faq'];
const forbiddenScopeFiles = DIRS.flatMap((dir) => {
  if (SUBDIRS.includes(path.basename(dir))) {
    return existsSync(dir)
      ? readdirSync(dir, { recursive: true, encoding: 'utf8' })
          .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
          .sort()
          .map((f) => path.join(dir, f))
      : [];
  }
  return SUBDIRS.flatMap((sub) => {
    const subPath = path.join(dir, sub);
    return existsSync(subPath)
      ? readdirSync(subPath, { recursive: true, encoding: 'utf8' })
          .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
          .sort()
          .map((f) => path.join(subPath, f))
      : [];
  });
});

const isForbiddenSpecifier = (spec: string) =>
  spec === '@/data' ||
  spec.startsWith('@/data/') ||
  spec === '@/dev' ||
  spec.startsWith('@/dev/') ||
  spec === 'src/data' ||
  spec.startsWith('src/data/') ||
  spec === 'src/dev' ||
  spec.startsWith('src/dev/') ||
  /^(?:\.\.\/)+(?:src\/)?(?:data|dev)(?:\/|$)/.test(spec);

const importReport: string[] = [];
for (const abs of forbiddenScopeFiles) {
  const text = readFileSync(abs, 'utf8');
  const file = path.relative(process.cwd(), abs).split(path.sep).join('/');
  const source = ts.createSourceFile(
    abs,
    text,
    ts.ScriptTarget.Latest,
    true,
    abs.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
      if (
        ts.isStringLiteral(node.moduleSpecifier) &&
        isForbiddenSpecifier(node.moduleSpecifier.text)
      ) {
        const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        importReport.push(
          `${file}:${line}: forbidden import ${JSON.stringify(node.moduleSpecifier.text)}`,
        );
      }
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      if (
        ts.isStringLiteral(node.moduleSpecifier) &&
        isForbiddenSpecifier(node.moduleSpecifier.text)
      ) {
        const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        importReport.push(
          `${file}:${line}: forbidden export from ${JSON.stringify(node.moduleSpecifier.text)}`,
        );
      }
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0]) &&
      isForbiddenSpecifier(node.arguments[0].text)
    ) {
      const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      importReport.push(
        `${file}:${line}: forbidden dynamic import ${JSON.stringify(node.arguments[0].text)}`,
      );
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

if (report.length || importReport.length) {
  if (report.length) {
    console.error(
      `check:components found ${report.length} business string(s):\n${report.join('\n')}`,
    );
  }
  if (importReport.length) {
    console.error(
      `check:components found ${importReport.length} forbidden data/dev import(s):\n${importReport.join('\n')}`,
    );
  }
  process.exit(1);
}
console.log(
  `check:components: ${files.length} files clean, ${forbiddenScopeFiles.length} files checked for imports`,
);
