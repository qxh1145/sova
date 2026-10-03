import { HTMLElement, parse, TextNode, type Node } from 'node-html-parser';

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

const ALLOWED = new Set(['p', 'br', 'ul', 'ol', 'li', 'a', 'strong', 'b', 'em']);
const DROPPED = new Set(['style', 'script', 'noscript', 'template', 'iframe', 'svg', 'button']);
const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#|\{\{site\.\w+\}\})/i;

const escapeText = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export interface SanitizeHooks {
  /** Raw text node (entities intact) -> final plain text. */
  text(raw: string): string;
  /** Raw href -> final href, or null to unwrap the link to its text. */
  href(raw: string): string | null;
}

/**
 * Allowlist: p br ul ol li a[href] strong b em. Other elements are unwrapped (span, div, ...),
 * style/script & co. dropped with their content, and every attribute but a[href] removed.
 */
export function sanitize(root: HTMLElement, hooks: SanitizeHooks): string {
  const render = (node: Node): string => {
    if (node instanceof TextNode)
      return escapeText(hooks.text(node.rawText.replace(/[ \t\r\n\f]+/g, ' ')));
    if (!(node instanceof HTMLElement)) return '';
    const tag = node.rawTagName?.toLowerCase() ?? '';
    if (DROPPED.has(tag)) return '';
    const inner = node.childNodes.map(render).join('');
    if (tag === 'br') return '<br>';
    if (tag === 'a') {
      const raw = node.getAttribute('href');
      const href = raw === undefined ? null : hooks.href(raw);
      return href && SAFE_HREF.test(href)
        ? `<a href="${escapeText(href).replace(/"/g, '&quot;')}">${inner}</a>`
        : inner;
    }
    return ALLOWED.has(tag) ? `<${tag}>${inner}</${tag}>` : inner;
  };
  return root.childNodes
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
