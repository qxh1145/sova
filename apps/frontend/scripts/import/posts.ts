import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import type { HTMLElement } from 'node-html-parser';
import type {
  AssetRef,
  ListingSnapshot,
  Post,
  PostCategory,
  PublicPath,
  SourceRef,
} from '../../src/types/content.ts';
import { decodeEscapes, rewriteEraLinks } from '../../src/lib/content/brand.ts';
import {
  ALLOWED,
  lineLookup,
  parseHtml,
  processHref,
  processText,
  sanitize,
  type Stats,
} from './html.ts';

/** Blog listings: public path -> page count. `/goc-nhin/` (all posts) first. */
const LISTINGS: [PublicPath, number][] = [
  ['/goc-nhin/', 5],
  ['/creative-branding/', 1],
  ['/goc-nhin-website/', 1],
  ['/social-marketing/', 2],
  ['/thu-thuat/', 2],
  ['/tin-tuc/', 1],
  ['/ux-ui/', 1],
];
const EXPECTED_POSTS = 27;

export const POST_ALLOWED: ReadonlySet<string> = new Set([
  ...ALLOWED,
  ...'h2 h3 h4 h5 h6 blockquote hr table thead tbody tr th td figure figcaption img video source'.split(
    ' ',
  ),
]);

export type PostCategoryRecord = PostCategory & { sources: SourceRef[] };

const ERAS_HOST = /(^|\.)erasvietnam\.(vn|com)$/i;
// A bare Eras URL written as body text (not a link) keeps only its path, like rewriteEraLinks.
const ERAS_URL_TEXT = /https?:\/\/(?:[\w-]+\.)*erasvietnam\.(?:vn|com)(\/[^\s<]*)?/gi;

/**
 * Media src -> AssetRef src + status. Mirror-relative and Eras-host paths become `/path`
 * (local when the file exists in the mirror, else missing); any other host keeps its URL (missing).
 */
export function classifyAsset(
  raw: string,
  file: string,
  erasDir: string,
): { src: string; status: 'local' | 'missing' } | null {
  const value = decodeEscapes(raw).trim();
  let url: URL;
  try {
    url = new URL(value, `https://erasvietnam.vn/${file}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!ERAS_HOST.test(url.hostname)) return { src: value, status: 'missing' };
  let local = false;
  try {
    local = statSync(path.join(erasDir, decodeURIComponent(url.pathname))).isFile();
  } catch {
    // missing file or malformed %-escape: no local file
  }
  return { src: url.pathname, status: local ? 'local' : 'missing' };
}

const dimension = (value: string | undefined) =>
  value && /^\d+$/.test(value) ? Number(value) : undefined;

/** `/slug/` of a post link on `file`, or throws when it is not one of the listed posts. */
function postSlug(href: string, file: string, slugs: Set<string>): string {
  const target = rewriteEraLinks(decodeEscapes(href), `https://erasvietnam.vn/${file}`) ?? '';
  const slug = target.replace(/^\/|\/$/g, '');
  if (!slugs.has(slug)) throw new Error(`Source drift: ${file}: ${href} has no post folder`);
  return slug;
}

interface Card {
  postId: string;
  slug: string;
  categorySlugs: string[];
  excerpt: string;
  thumbnailId?: string;
}

export function importPosts(erasDir: string, stats: Stats) {
  const assets = new Map<string, AssetRef>();

  const addAsset = (
    raw: string | undefined,
    meta: { alt?: string; width?: string; height?: string; kind: AssetRef['kind'] },
    source: SourceRef,
  ): { src: string; id: string } | null => {
    const found = raw ? classifyAsset(raw, source.file, erasDir) : null;
    if (!found) {
      console.log(`asset dropped ${source.file}:${source.line} ${raw ?? '(no src)'}`);
      return null;
    }
    const id = `asset-${createHash('sha1').update(found.src).digest('hex').slice(0, 10)}`;
    let asset = assets.get(id);
    if (asset && asset.src !== found.src) throw new Error(`Asset id collision: ${id}`);
    if (!asset) {
      asset = { id, src: found.src, alt: '', kind: meta.kind, status: found.status, sources: [] };
      assets.set(id, asset);
    }
    // First non-empty value wins, so the output does not depend on which page mentioned it last.
    if (!asset.alt && meta.alt) asset.alt = processText(meta.alt, stats).trim();
    asset.width ??= dimension(meta.width);
    asset.height ??= dimension(meta.height);
    if (!asset.sources.some((s) => s.file === source.file && s.line === source.line))
      asset.sources.push(source);
    return { src: asset.src, id };
  };

  const imageAsset = (el: HTMLElement | null, file: string, lineOf: (o: number) => number) =>
    el
      ? addAsset(
          el.getAttribute('src'),
          {
            alt: el.getAttribute('alt'),
            width: el.getAttribute('width'),
            height: el.getAttribute('height'),
            kind: 'image',
          },
          { file, line: lineOf(el.range[0]) },
        )?.id
      : undefined;

  // Listings: cards and pagination per page.
  const cards = new Map<string, Card>();
  const snapshots: ListingSnapshot[] = [];
  const cardCounts = new Map<PublicPath, number>();
  let sidebar: { root: HTMLElement; file: string; lineOf: (o: number) => number } | undefined;

  for (const [routeId, pages] of LISTINGS) {
    for (let page = 1; page <= pages; page++) {
      const file = `${routeId.slice(1)}${page > 1 ? `page/${page}/` : ''}index.html`;
      const source = readFileSync(path.join(erasDir, file), 'utf8');
      const lineOf = lineLookup(source);
      const root = parseHtml(source);
      sidebar ??= { root, file, lineOf };
      const orderedIds: string[] = [];
      for (const article of root.querySelectorAll('#post-list .large-8 > article[id^=post-]')) {
        const href = article.querySelector('.post-details-archive a[href]')?.getAttribute('href');
        if (!href) throw new Error(`${file}:${lineOf(article.range[0])}: card has no link`);
        const postId = article.id;
        orderedIds.push(postId);
        if (routeId !== '/goc-nhin/') {
          if (!cards.has(postId))
            throw new Error(`Source drift: ${file}: ${postId} is not on /goc-nhin/`);
          continue;
        }
        const target = rewriteEraLinks(decodeEscapes(href), `https://erasvietnam.vn/${file}`);
        const slug = (target ?? '').replace(/^\/|\/$/g, '');
        if (!slug || !existsSync(path.join(erasDir, slug, 'index.html')))
          throw new Error(`Source drift: ${file}: card ${href} has no post folder`);
        cards.set(postId, {
          postId,
          slug,
          categorySlugs: article.classList.value
            .filter((c) => c.startsWith('category-'))
            .map((c) => c.slice('category-'.length)),
          excerpt: processText(article.querySelector('.excerpt p')?.rawText ?? '', stats)
            .replace(/\s+/g, ' ')
            .trim(),
          thumbnailId: imageAsset(
            article.querySelector('.post-image img.wp-post-image'),
            file,
            lineOf,
          ),
        });
      }
      const link = (selector: string) => {
        const a = root.querySelector(selector);
        const raw = a?.getAttribute('href');
        return raw === undefined || !a
          ? undefined
          : ((processHref(raw, file, lineOf(a.range[0]), stats) ?? undefined) as
              PublicPath | undefined);
      };
      const snapshot: ListingSnapshot = { routeId, page, orderedIds };
      const previousPath = link('a.prev.page-numbers');
      const nextPath = link('a.next.page-numbers');
      if (previousPath) snapshot.previousPath = previousPath;
      if (nextPath) snapshot.nextPath = nextPath;
      snapshots.push(snapshot);
      cardCounts.set(routeId, (cardCounts.get(routeId) ?? 0) + orderedIds.length);
    }
  }
  if (cards.size !== EXPECTED_POSTS)
    throw new Error(`Source drift: /goc-nhin/ has ${cards.size} cards, expected ${EXPECTED_POSTS}`);

  // Categories: the /goc-nhin/ sidebar, checked against card classes and category listings.
  const categories: PostCategoryRecord[] = [];
  for (const li of sidebar!.root.querySelectorAll('aside.widget_categories li.cat-item')) {
    const a = li.querySelector('a');
    const count = /\((\d+)\)/.exec(li.text)?.[1];
    const href = a?.getAttribute('href');
    const line = sidebar!.lineOf(li.range[0]);
    const categoryPath = href
      ? rewriteEraLinks(decodeEscapes(href), `https://erasvietnam.vn/${sidebar!.file}`)
      : null;
    if (!a || !count || !categoryPath?.startsWith('/'))
      throw new Error(`${sidebar!.file}:${line}: unexpected category markup`);
    const slug = categoryPath.replace(/^\/|\/$/g, '');
    const sourceDisplayCount = Number(count);
    const classCount = [...cards.values()].filter((c) => c.categorySlugs.includes(slug)).length;
    if (classCount !== sourceDisplayCount)
      throw new Error(
        `Source drift: category ${slug} sidebar count ${sourceDisplayCount} != ${classCount} card classes`,
      );
    if (cardCounts.get(categoryPath as PublicPath) !== sourceDisplayCount)
      throw new Error(
        `Source drift: category ${slug} sidebar count ${sourceDisplayCount} != ` +
          `${cardCounts.get(categoryPath as PublicPath) ?? 'no'} listing cards`,
      );
    categories.push({
      id: `post-category-${slug}`,
      locale: 'vi',
      slug,
      title: processText(a.rawText, stats).trim(),
      path: categoryPath as PublicPath,
      sourceDisplayCount,
      sources: [{ file: sidebar!.file, line, sourceId: slug }],
    });
  }
  const categorySlugs = new Set(categories.map((c) => c.slug));
  if (categorySlugs.size !== LISTINGS.length - 1)
    throw new Error(`Source drift: ${categorySlugs.size} sidebar categories`);
  for (const card of cards.values())
    for (const slug of card.categorySlugs)
      if (!categorySlugs.has(slug))
        throw new Error(`Source drift: ${card.postId} has unknown category ${slug}`);

  // Posts, in /goc-nhin/ card order (newest first).
  const slugs = new Set([...cards.values()].map((c) => c.slug));
  const posts: Post[] = [];
  for (const card of cards.values()) {
    const file = `${card.slug}/index.html`;
    const source = readFileSync(path.join(erasDir, file), 'utf8');
    const lineOf = lineLookup(source);
    const root = parseHtml(source);
    const wpId = /\bpostid-(\d+)\b/.exec(
      root.querySelector('body')?.getAttribute('class') ?? '',
    )?.[1];
    if (`post-${wpId}` !== card.postId)
      throw new Error(`Source drift: ${file} is postid-${wpId}, card says ${card.postId}`);
    const h1 = root.querySelector('h1.cs-page_title');
    const meta = root.querySelector('#content.blog-single .meta');
    const siblings = meta?.parentNode?.childNodes ?? [];
    const start = meta ? siblings.indexOf(meta) + 1 : -1;
    const end = siblings.findIndex(
      (n, i) => i >= start && (n as HTMLElement).classList?.contains('relatedcat'),
    );
    if (!h1 || !meta || end < 0) throw new Error(`${file}: unexpected post markup`);

    const bodyAssetIds: string[] = [];
    const html = sanitize(
      siblings.slice(start, end),
      {
        text: (raw) =>
          processText(raw, stats).replace(ERAS_URL_TEXT, (url, urlPath = '/') => {
            console.log(`text url ${file} ${url} -> ${urlPath}`);
            return urlPath;
          }),
        href: (raw) => processHref(raw, file, lineOf(meta.range[0]), stats),
        asset: (el) => {
          const tag = el.rawTagName.toLowerCase();
          const found = addAsset(
            el.getAttribute('src'),
            {
              alt: el.getAttribute('alt'),
              width: el.getAttribute('width'),
              height: el.getAttribute('height'),
              kind: tag === 'source' ? 'video' : 'image',
            },
            { file, line: lineOf(el.range[0]) },
          );
          if (found && !bodyAssetIds.includes(found.id)) bodyAssetIds.push(found.id);
          return found;
        },
      },
      POST_ALLOWED,
    );

    const metaContent = (selector: string) =>
      root.querySelector(selector)?.getAttribute('content') ?? undefined;
    const og = root.querySelector('meta[property="og:image"]');
    const seoImageId = og
      ? addAsset(og.getAttribute('content'), { kind: 'image' }, { file, line: lineOf(og.range[0]) })
          ?.id
      : undefined;
    const featuredImageId = imageAsset(
      root.querySelector('#content.blog-single .post-image > img.wp-post-image'),
      file,
      lineOf,
    );
    const description = metaContent('meta[name="description"]');
    const authorName = processText(meta.querySelector('p.author')?.rawText ?? '', stats).trim();
    const displayDate = meta.querySelector('p.date')?.rawText.trim();
    const publishedAt = metaContent('meta[property="article:published_time"]');
    const modifiedAt = metaContent('meta[property="article:modified_time"]');
    const postPath = `/${card.slug}/` as PublicPath;

    const post: Post = {
      id: card.postId,
      locale: 'vi',
      path: postPath,
      title: processText(h1.rawText, stats).replace(/\s+/g, ' ').trim(),
      slug: card.slug,
      categoryIds: card.categorySlugs.map((slug) => `post-category-${slug}`),
      excerpt: card.excerpt,
      body: {
        format: 'sanitized-html',
        html,
        assetIds: bodyAssetIds,
        sources: [{ file, line: lineOf(meta.range[0]) }],
      },
      author: {
        id: `author-${authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: authorName,
      },
      relatedPostIds: root
        .querySelectorAll('.relatedcat .related-post-item a[href]')
        .map((a) => postSlug(a.getAttribute('href')!, file, slugs))
        .map((slug) => [...cards.values()].find((c) => c.slug === slug)!.postId),
      seo: {
        title: processText(root.querySelector('title')?.rawText ?? '', stats).trim(),
        canonicalPath: postPath,
      },
      sources: [{ file, line: lineOf(h1.range[0]), sourceId: wpId }],
    };
    if (card.thumbnailId) post.thumbnailId = card.thumbnailId;
    if (featuredImageId) post.featuredImageId = featuredImageId;
    if (publishedAt) post.publishedAt = publishedAt;
    if (modifiedAt) post.modifiedAt = modifiedAt;
    if (displayDate) post.displayDate = processText(displayDate, stats);
    if (description) post.seo.description = processText(description, stats).trim();
    if (seoImageId) post.seo.imageId = seoImageId;
    posts.push(post);
  }

  return { posts, categories, snapshots, assets: [...assets.values()] };
}
