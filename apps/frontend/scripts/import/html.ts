import { HTMLElement, parse, TextNode, type Node } from 'node-html-parser';
import { applyBrandTerms, decodeEscapes, rewriteEraLinks } from '../../src/lib/content/brand.ts';
import { scrubContacts } from '../../src/lib/content/scrub.ts';

export interface Stats {
  brand: number;
  scrub: number;
}

/** Text pipeline: decode -> scrub -> brand map. */
export function processText(raw: string, stats: Stats): string {
  const scrubbed = scrubContacts(decodeEscapes(raw));
  const branded = applyBrandTerms(scrubbed.text);
  stats.scrub += scrubbed.count;
  stats.brand += branded.count;
  return branded.text;
}

/** Href pipeline: decode -> scrub -> link rewrite (logged). */
export function processHref(raw: string, file: string, line: number, stats: Stats): string | null {
  const scrubbed = scrubContacts(decodeEscapes(raw));
  stats.scrub += scrubbed.count;
  const href = rewriteEraLinks(scrubbed.text, `https://erasvietnam.vn/${file}`);
  if (href !== scrubbed.text)
    console.log(`link ${file}:${line} ${raw} -> ${href ?? '(unwrapped)'}`);
  return href;
}

export function parseHtml(source: string): HTMLElement {
  return parse(source, { comment: false });
}

/** 1-based line of a source offset. */
export function lineLookup(source: string): (offset: number) => number {
  const starts = [0];
  for (let i = source.indexOf('\n'); i !== -1; i = source.indexOf('\n', i + 1)) starts.push(i + 1);
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

export const ALLOWED: ReadonlySet<string> = new Set([
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'a',
  'strong',
  'b',
  'em',
]);
const DROPPED = new Set(['style', 'script', 'noscript', 'template', 'iframe', 'svg', 'button']);
const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#|\{\{site\.\w+\}\})/i;

const escapeText = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (name: string, value: string | undefined) =>
  value === undefined ? '' : ` ${name}="${escapeText(value).replace(/"/g, '&quot;')}"`;

export interface SanitizeHooks {
  /** Raw text node (entities intact) -> final plain text. */
  text(raw: string): string;
  /** Raw href -> final href, or null to unwrap the link to its text. */
  href(raw: string): string | null;
  /** img / video source -> its AssetRef src and id, or null to drop the element. */
  asset?(el: HTMLElement): { src: string; id: string } | null;
}

/**
 * Allowlist (default): p br ul ol li a[href] strong b em. Other elements are unwrapped (span, div,
 * ...), style/script & co. dropped with their content, and every attribute but a[href] removed.
 * A wider `allowed` set may add img[src alt width height], video[controls width height] (its
 * fallback content dropped) and source[src type]; img/source src comes from `hooks.asset`.
 */
export function sanitize(
  root: HTMLElement | Node[],
  hooks: SanitizeHooks,
  allowed: ReadonlySet<string> = ALLOWED,
): string {
  const render = (node: Node): string => {
    if (node instanceof TextNode)
      return escapeText(hooks.text(node.rawText.replace(/[ \t\r\n\f]+/g, ' ')));
    if (!(node instanceof HTMLElement)) return '';
    const tag = node.rawTagName?.toLowerCase() ?? '';
    if (DROPPED.has(tag)) return '';
    if (tag === 'br') return '<br>';
    if (tag === 'hr' && allowed.has(tag)) return '<hr>';
    if (allowed.has(tag) && (tag === 'img' || tag === 'source')) {
      const asset = hooks.asset?.(node);
      if (!asset) return '';
      return tag === 'img'
        ? `<img${attr('src', asset.src)}${attr('alt', hooks.text(node.getAttribute('alt') ?? ''))}` +
            `${attr('width', node.getAttribute('width'))}${attr('height', node.getAttribute('height'))}>`
        : `<source${attr('src', asset.src)}${attr('type', node.getAttribute('type'))}>`;
    }
    if (allowed.has(tag) && tag === 'video') {
      const sources = node.childNodes
        .filter((n) => n instanceof HTMLElement && n.rawTagName.toLowerCase() === 'source')
        .map(render)
        .join('');
      return `<video controls${attr('width', node.getAttribute('width'))}${attr('height', node.getAttribute('height'))}>${sources}</video>`;
    }
    const inner = node.childNodes.map(render).join('');
    if (tag === 'a') {
      const raw = node.getAttribute('href');
      const href = raw === undefined ? null : hooks.href(raw);
      return href && SAFE_HREF.test(href) ? `<a${attr('href', href)}>${inner}</a>` : inner;
    }
    return allowed.has(tag) ? `<${tag}>${inner}</${tag}>` : inner;
  };
  return (Array.isArray(root) ? root : root.childNodes)
    .map(render)
    .join('')
    .replace(/ *(<\/?(?:p|ul|ol|li)>) */g, '$1')
    .trim();
}

/** Visible text of sanitized html, whitespace-collapsed: what dedupe/revisions compare. */
export const visibleText = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
