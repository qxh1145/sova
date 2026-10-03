// Eras -> Sova text rules (MIGRATION_PLAN 03/10). No path aliases: Node type stripping loads this.

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  laquo: '«',
  raquo: '»',
  copy: '©',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

/** Decode `\uXXXX` escapes and HTML entities (numeric + common named), then NFC-normalize. */
export function decodeEscapes(text: string): string {
  return text
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (entity, body: string) => {
      if (body[0] !== '#') return NAMED_ENTITIES[body] ?? entity;
      const hex = body[1] === 'x' || body[1] === 'X';
      return String.fromCodePoint(parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10));
    })
    .normalize('NFC');
}

// Longest first so "Eras Việt Nam" wins over "Eras".
export const BRAND_TERMS = ['Eras Việt Nam', 'Eras Vietnam', 'Eras Viet Nam', 'ErasVietnam', 'Eras']
  .map((term) => term.normalize('NFC'))
  .sort((a, b) => b.length - a.length);

const BRAND_RE = new RegExp(
  `(?<![\\p{L}\\p{N}_])(?:${BRAND_TERMS.join('|')})(?![\\p{L}\\p{N}_])`,
  'gu',
);

/** Case-sensitive, whole-word Eras -> Sova. Decode escapes first. */
export function applyBrandTerms(text: string): { text: string; count: number } {
  let count = 0;
  const out = text.replace(BRAND_RE, () => {
    count++;
    return 'Sova';
  });
  return { text: out, count };
}

/** What the post-build grep treats as an Eras leak. */
export const BRAND_LEAK_RE = /Eras|eras-|erasvietnam/g;

const SITE_HOSTS = ['erasvietnam.vn', 'www.erasvietnam.vn'];

/**
 * erasvietnam.vn links (absolute, or relative to the mirror page at `base`) -> site-relative path;
 * other Eras hosts -> null (unwrap to text); anything else unchanged.
 */
export function rewriteEraLinks(href: string, base = 'https://erasvietnam.vn/'): string | null {
  if (href.startsWith('{{')) return href;
  let url: URL;
  try {
    url = new URL(href, base);
  } catch {
    return href;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return href;
  if (SITE_HOSTS.includes(url.hostname)) {
    // The mirror stores pages as dir/index.html (and dated index.mirror-*.html copies).
    return url.pathname.replace(/index(\.mirror-[^/]*)?\.html$/, '') + url.search + url.hash;
  }
  if (/(^|\.)erasvietnam\.(vn|com)$/i.test(url.hostname)) return null;
  return href;
}
