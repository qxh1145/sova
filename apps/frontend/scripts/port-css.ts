// Dev-only CSS port: `npm run port:css`. Reads ../eras-clone (read-only) and writes the index.html
// head cascade to src/styles/legacy/NN-<id>.css, each route's body <style> blocks to
// src/styles/legacy/sections/<route-id>.css, src/styles/legacy/manifest.json, the import block in
// src/styles/globals.css, and the fl-icons files under public/. Rules are verbatim except for the
// transforms in transformCss. Not run in CI (no source mirror there); tests read the manifest.
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { routes } from '../src/data/routes.ts';

export type Transforms = Record<string, number>;

const FONT_HOSTS =
  /^(?:https?:)?\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com|fonts\.cdnfonts\.com|use\.fontawesome\.com)\//i;
const ERAS_HOST = /^(?:[\w-]+\.)*erasvietnam\.(?:vn|com)$/i;
const ICON_FAMILY = /font-family\s*:\s*["']?(?:fl-icons|dearflip)\b/i;
const FACE_TOKENS: [RegExp, string][] = [
  [/\bKanit\b/i, 'var(--font-display)'],
  [/\bMoul\b/i, 'var(--font-alt)'],
  [/\b(?:SF Pro Display|Lato|FZ-?Poppins|Roboto)\b/i, 'var(--font-body)'],
];

/** One url() target -> rebased root-absolute path, `none`, or unchanged. */
function rebaseUrl(url: string, sourceUrlPath: string): string | null {
  if (/^(?:data:|#)/i.test(url)) return url;
  let target: URL;
  if (/^(?:https?:)?\/\//i.test(url)) {
    target = new URL(url, 'https://source.invalid/');
    if (!ERAS_HOST.test(target.hostname)) return null;
  } else {
    target = new URL(url, `https://source.invalid${sourceUrlPath}`);
  }
  if (/^logo-eras-/i.test(target.pathname.split('/').pop() ?? '')) return null;
  // WordPress core files are never copied (verify:assets fails on a /wp-includes/ ref).
  if (target.pathname.startsWith('/wp-includes/')) return null;
  return target.pathname + target.search + target.hash;
}

/** Comment out each stray top-level `}` plus the rule a browser swallows after it (transform 5). */
function dropStrayBraces(css: string, count: (name: string) => void): string {
  let out = '';
  let depth = 0;
  let from = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end < 0 ? css.length : end + 1;
    } else if (c === '"' || c === "'") {
      for (i++; i < css.length && css[i] !== c && css[i] !== '\n'; i++) if (css[i] === '\\') i++;
    } else if (c === '{') depth++;
    else if (c === '}' && depth > 0) depth--;
    else if (c === '}') {
      // Browsers read `} <prelude> { … }` as one invalid qualified rule and drop all of it.
      let end = css.indexOf('{', i);
      if (end >= 0)
        for (let d = 0; end < css.length; end++) {
          if (css[end] === '{') d++;
          else if (css[end] === '}' && --d === 0) break;
        }
      end = end < 0 ? css.length : Math.min(end + 1, css.length);
      const dropped = css.slice(i, end).replaceAll('*/', '* /');
      out += `${css.slice(from, i)}/* port:css dropped (browsers drop it too): ${dropped} */`;
      count('parse-error-dropped');
      from = end;
      i = end - 1;
    }
  }
  return out + css.slice(from);
}

/**
 * The complete list of edits applied to source CSS (plan Design Notes 1-5). `sourceUrlPath` is the
 * source file's public path (e.g. `/wp-content/themes/flatsome-child/style.css`, `/index.html`).
 */
export function transformCss(
  css: string,
  sourceUrlPath: string,
): { css: string; transforms: Transforms } {
  const transforms: Transforms = {};
  const count = (name: string) => (transforms[name] = (transforms[name] ?? 0) + 1);

  // Comments are masked so the rule edits never touch them.
  const comments: string[] = [];
  let text = css.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, (m) => `\u0000${comments.push(m) - 1}\u0000`);

  text = text.replace(/@font-face\s*\{[^}]*\}/gi, (block) => {
    if (ICON_FAMILY.test(block)) return block;
    count('font-face-removed');
    return '';
  });
  text = text.replace(
    /@import\s+(?:url\(\s*(["']?)([^"')]*)\1\s*\)|(["'])([^"']*)\3)[^;]*;/gi,
    (rule, _q, a: string | undefined, _q2, b: string | undefined) => {
      if (!FONT_HOSTS.test((a ?? b ?? '').trim())) return rule;
      count('font-import-removed');
      return '';
    },
  );
  text = text.replace(/url\(\s*(["']?)(.*?)\1\s*\)/gi, (match, quote: string, url: string) => {
    const rebased = rebaseUrl(url.trim(), sourceUrlPath);
    if (rebased === null) {
      count('url-none');
      return 'none';
    }
    if (rebased === url) return match;
    count('url-rebase');
    return `url(${quote}${rebased}${quote})`;
  });
  text = text.replace(
    /(?<![\w-])(font-family\s*:\s*)([^;}]*?)(\s*!\s*important)?(\s*)(?=[;}]|$)/gi,
    (match, prop: string, value: string, important = '', tail: string) => {
      const token = FACE_TOKENS.find(([face]) => face.test(value))?.[1];
      if (!token) return match;
      count('font-family-token');
      return `${prop}${token}${important}${tail}`;
    },
  );

  text = text.replace(/\u0000(\d+)\u0000/g, (_, i: string) => comments[Number(i)]);
  return { css: dropStrayBraces(text, count), transforms };
}

// ---------------------------------------------------------------------------------------------

const here = import.meta.dirname;
const ERAS_CLONE_DIR = path.resolve(
  process.env.ERAS_CLONE_DIR ?? path.join(here, '../../../../eras-clone'),
);
const APP = path.resolve(here, '..');
const LEGACY = path.join(APP, 'src/styles/legacy');
const GLOBALS = path.join(APP, 'src/styles/globals.css');
const ICONS = 'wp-content/themes/flatsome/assets/css/icons';
const HEADER = '/* Generated by scripts/port-css.ts (npm run port:css) — do not edit. */';
const BEGIN = '/* port:css begin — generated, do not edit */';
const END = '/* port:css end */';

const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const lineAt = (html: string, index: number) => html.slice(0, index).split('\n').length;
const attr = (tag: string, name: string) =>
  tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];

function write(file: string, text: string) {
  mkdirSync(path.dirname(file), { recursive: true });
  const changed = !existsSync(file) || readFileSync(file, 'utf8') !== text;
  if (changed) writeFileSync(file, text);
  console.log(`${changed ? 'wrote' : 'unchanged'} ${path.relative(process.cwd(), file)}`);
}

type Block = { tag: string; line: number; body?: string };

/** `<style>` blocks (with inner text) and `<link rel=stylesheet>` tags in document order. */
function styleTags(html: string, from = 0, to = html.length): Block[] {
  const blocks: Block[] = [];
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>|<link\b[^>]*>/gi;
  re.lastIndex = from;
  for (let m = re.exec(html); m && m.index < to; m = re.exec(html)) {
    const tag = m[0].match(/^<[^>]*>/)![0];
    if (m[1] === undefined && attr(tag, 'rel')?.toLowerCase() !== 'stylesheet') continue;
    blocks.push({ tag, line: lineAt(html, m.index), body: m[1] });
  }
  return blocks;
}

type Entry = {
  file: string;
  kind?: 'route-head' | 'en-override';
  source: string;
  line: number;
  htmlLine?: number;
  route?: string;
  sha256: string;
  transforms: Transforms;
};

/** Reads and transforms one `<style>`/`<link>` block of `htmlFile`, hashed per styles.json. */
function portBlock({ tag, line, body }: Block, htmlFile: string) {
  const href = attr(tag, 'href');
  const source =
    body === undefined
      ? path.posix.join(path.posix.dirname(htmlFile), decodeURI(href!.split(/[?#]/)[0]))
      : htmlFile;
  const raw = (body ?? readFileSync(path.join(ERAS_CLONE_DIR, source), 'utf8')).replace(
    /\r\n/g,
    '\n',
  );
  const sha = sha256(body === undefined ? raw : raw.replace(/\s+/g, ' ').trim());
  const { css, transforms } = transformCss(raw, `/${source}`);
  return { source, line: body === undefined ? 1 : line, sha256: sha, css, transforms };
}

const isExternal = (tag: string) => /^(?:https?:)?\/\//i.test(attr(tag, 'href') ?? '');

/** Top-level rules (at-rules included) of a CSS text, in order. */
function topLevelRules(css: string): string[] {
  const rules: string[] = [];
  let depth = 0;
  let from = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) {
      rules.push(css.slice(from, i + 1).trim());
      from = i + 1;
    }
  }
  return rules;
}

async function main() {
  const indexPath = path.join(ERAS_CLONE_DIR, 'index.html');
  if (!existsSync(indexPath))
    throw new Error(`Source mirror not found at ${ERAS_CLONE_DIR} (set ERAS_CLONE_DIR)`);
  const index = readFileSync(indexPath, 'utf8');
  const headOf = (html: string) => styleTags(html, 0, html.search(/<\/head>/i));

  const cascade: Entry[] = [];
  const skipped: { source: string; line: number; href?: string; reason: string }[] = [];
  const files = new Map<string, string>();
  const head = headOf(index);
  let customCss = '';
  // custom-css split into top-level rules, each transformed alone so overrides carry their own counts.
  const customRules = (body: string, source: string) =>
    topLevelRules(body.replace(/\r\n/g, '\n')).map((rule) => transformCss(rule, `/${source}`));
  for (const block of head) {
    const id = attr(block.tag, 'id') ?? '';
    if (id === 'kirki-inline-styles') {
      skipped.push({
        source: 'index.html',
        line: block.line,
        reason: 'webfont @font-face only (kirki)',
      });
      continue;
    }
    if (isExternal(block.tag)) {
      skipped.push({
        source: attr(block.tag, 'href')!,
        line: block.line,
        reason: 'external stylesheet (webfont/icon CDN)',
      });
      continue;
    }
    const { css, source, line, sha256: hash, transforms } = portBlock(block, 'index.html');
    if (id === 'custom-css') customCss = block.body!;
    const name = id
      .replace(/-css$/, '')
      .replace(/\.css$/, '')
      .replace(/[^a-z0-9-]+/gi, '-');
    const file = `${String(cascade.length + 1).padStart(2, '0')}-${name}.css`;
    files.set(file, `${HEADER}\n/* source: ${source}:${line} */\n${css}\n`);
    cascade.push({ file, source, line, htmlLine: block.line, sha256: hash, transforms });
  }
  const indexHeadIds = new Set(head.map((b) => attr(b.tag, 'id')).filter(Boolean));
  const indexRules = customRules(customCss, 'index.html');

  const sections: Entry[] = [];
  const enOverrides: Entry[] = [];
  let enRules: string[] | undefined;
  for (const route of routes) {
    const source = route.source.file;
    const html = readFileSync(path.join(ERAS_CLONE_DIR, source), 'utf8');
    const file = `sections/${route.id}.css`;
    let text = `${HEADER}\n/* route: ${route.path} */\n`;
    const own: Entry[] = [];

    // Route-only head styles; the /login-eras/ wp-admin cascade belongs to the utility epic.
    for (const block of route.kind === 'login' ? [] : headOf(html)) {
      const id = attr(block.tag, 'id');
      if (!id || indexHeadIds.has(id) || isExternal(block.tag)) continue;
      const { css, ...entry } = portBlock(block, source);
      text += `\n/* source: ${entry.source}:${entry.line} (head, ${source}:${block.line}) */\n${css.trim()}\n`;
      own.push({ file, kind: 'route-head', ...entry, htmlLine: block.line, route: route.id });
    }
    for (const block of styleTags(html, html.search(/<body\b/i))) {
      if (block.body === undefined) {
        if (isExternal(block.tag))
          skipped.push({
            source,
            line: block.line,
            href: attr(block.tag, 'href')!,
            reason: 'external stylesheet in body (not ported)',
          });
        continue;
      }
      const { css, ...entry } = portBlock(block, source);
      text += `\n/* source: ${source}:${block.line} */\n${css.trim()}\n`;
      own.push({ file, ...entry, route: route.id });
    }
    if (own.length) {
      sections.push(...own);
      files.set(file, text);
    }

    if (route.locale !== 'en') continue;
    const block = headOf(html).find((b) => attr(b.tag, 'id') === 'custom-css');
    if (!block) throw new Error(`${source}: no custom-css block`);
    const { line, sha256: hash } = portBlock(block, source);
    const rules = customRules(block.body!, source);
    if (rules.length !== indexRules.length)
      throw new Error(
        `${source}: custom-css has ${rules.length} rules, index.html ${indexRules.length}`,
      );
    const diff = rules.filter((rule, i) => rule.css !== indexRules[i].css);
    const diffCss = diff.map((rule) => rule.css.trim());
    if (enRules && diffCss.join('\n') !== enRules.join('\n'))
      throw new Error(`${source}: EN custom-css overrides differ from ${enOverrides[0].source}`);
    enRules = diffCss;
    const transforms: Transforms = {};
    for (const rule of diff)
      for (const [k, n] of Object.entries(rule.transforms))
        transforms[k] = (transforms[k] ?? 0) + n;
    enOverrides.push({
      file: 'en-overrides.css',
      kind: 'en-override',
      source,
      line,
      sha256: hash,
      transforms,
      route: route.id,
    });
  }
  if (!enRules) throw new Error('no EN routes with custom-css');
  files.set(
    'en-overrides.css',
    `${HEADER}\n/* EN custom-css rules that differ from index.html custom-css (identical on all ${enOverrides.length} EN routes; first: ${enOverrides[0].source}:${enOverrides[0].line}). Imported by the EN root layout after globals.css. */\n${enRules.join('\n')}\n`,
  );

  const iconDir = path.join(ERAS_CLONE_DIR, ICONS);
  const assets = readdirSync(iconDir)
    .filter((name) => /^fl-icons/.test(name))
    .sort()
    .map((name) => {
      const source = `${ICONS}/${name}`;
      const data = readFileSync(path.join(ERAS_CLONE_DIR, source));
      const target = path.join(APP, 'public', source);
      mkdirSync(path.dirname(target), { recursive: true });
      const changed = !existsSync(target) || !readFileSync(target).equals(data);
      if (changed) copyFileSync(path.join(ERAS_CLONE_DIR, source), target);
      console.log(`${changed ? 'copied' : 'unchanged'} public/${source}`);
      return { source, target: `public/${source}`, sha256: sha256(data) };
    });

  for (const [file, text] of files) write(path.join(LEGACY, file), text);
  // Prune stale outputs (removed/renamed routes or cascade blocks).
  for (const rel of readdirSync(LEGACY, { recursive: true, encoding: 'utf8' })) {
    if (!rel.endsWith('.css') || files.has(rel.split(path.sep).join('/'))) continue;
    unlinkSync(path.join(LEGACY, rel));
    console.log(`deleted ${path.relative(process.cwd(), path.join(LEGACY, rel))}`);
  }
  write(
    path.join(LEGACY, 'manifest.json'),
    // One entry per line: diffable without a 2MB pretty-printed file.
    `{\n${Object.entries({ cascade, sections, enOverrides, skipped, assets })
      .map(([key, list]) => `"${key}": [\n${list.map((e) => JSON.stringify(e)).join(',\n')}\n]`)
      .join(',\n')}\n}\n`,
  );

  const globals = readFileSync(GLOBALS, 'utf8');
  const start = globals.indexOf(BEGIN);
  const stop = globals.indexOf(END);
  if (start < 0 || stop < start) throw new Error(`${GLOBALS}: port:css markers missing`);
  const imports = cascade.map((e) => `@import './legacy/${e.file}';`).join('\n');
  const next = `${globals.slice(0, start)}${BEGIN}\n${imports}\n${globals.slice(stop)}`;
  write(GLOBALS, await format(next, { ...(await resolveConfig(GLOBALS)), filepath: GLOBALS }));

  const total = (list: Entry[]) =>
    list.reduce<Transforms>((sum, e) => {
      for (const [k, n] of Object.entries(e.transforms)) sum[k] = (sum[k] ?? 0) + n;
      return sum;
    }, {});
  console.log(
    `port:css: ${cascade.length} cascade files ${JSON.stringify(total(cascade))}, ` +
      `${sections.length} section blocks in ${new Set(sections.map((s) => s.file)).size} files ` +
      `${JSON.stringify(total(sections))}, ${skipped.length} skipped, ${assets.length} icon files`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
