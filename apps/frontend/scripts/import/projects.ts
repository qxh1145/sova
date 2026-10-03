import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type {
  EntityId,
  Project,
  ProjectCategory,
  PublicPath,
  RichContent,
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
import type { AssetRegistry } from './assets.ts';

/** serve.py `portfolio_items()` order, with the card count each listing must hold. */
const CATEGORIES: [ProjectCategory['slug'], number][] = [
  ['website', 59],
  ['branding', 2],
  ['mobile-app', 1],
];
const MAX_TERMS_VARIANTS = 2;
const TERMS_ALLOWED: ReadonlySet<string> = new Set([...ALLOWED, 'h2', 'h3', 'h4', 'h5', 'h6']);

export type ProjectCategoryRecord = ProjectCategory & { sources: SourceRef[] };
export interface TermsRecord {
  id: EntityId;
  body: RichContent;
}

/** Slug of a `featured_item/<slug>/` link on `file`, or throws naming the href. */
export function projectSlug(href: string | undefined, file: string, slugs?: Set<string>): string {
  const target = href
    ? (rewriteEraLinks(decodeEscapes(href), `https://erasvietnam.vn/${file}`) ?? '')
    : '';
  const slug = /^\/featured_item\/([^/]+)\/$/.exec(target)?.[1];
  if (!slug || (slugs && !slugs.has(slug)))
    throw new Error(`Source drift: ${file}: ${href ?? '(no href)'} is not a project folder`);
  return slug;
}

export const load = (erasDir: string, file: string) => {
  const source = readFileSync(path.join(erasDir, file), 'utf8');
  return { source, root: parseHtml(source), lineOf: lineLookup(source) };
};

interface Card {
  slug: string;
  categorySlug: ProjectCategory['slug'];
  thumbnailId?: string;
}

export function importProjects(erasDir: string, registry: AssetRegistry, stats: Stats) {
  // Category labels: the /du-an/ filter tabs.
  const tabsFile = 'du-an/index.html';
  const tabs = load(erasDir, tabsFile);
  const categories: ProjectCategoryRecord[] = [];
  const cards = new Map<string, Card>();

  for (const [slug, expected] of CATEGORIES) {
    const tab = tabs.root.querySelector(`.filter-nav a[data-term="${slug}"]`);
    if (!tab) throw new Error(`Source drift: ${tabsFile} has no ${slug} tab`);
    const file = `featured_item_category/${slug}/index.html`;
    const { root, lineOf } = load(erasDir, file);
    const listed = root.querySelectorAll('div.col[data-terms]');
    if (listed.length !== expected)
      throw new Error(`Source drift: ${file} has ${listed.length} cards, expected ${expected}`);
    for (const col of listed) {
      const href = col.querySelector('a[href]')?.getAttribute('href');
      const cardSlug = projectSlug(href, file);
      if (cards.has(cardSlug)) continue;
      if (!existsSync(path.join(erasDir, 'featured_item', cardSlug, 'index.html')))
        throw new Error(`Source drift: ${file}: ${href} has no project folder`);
      cards.set(cardSlug, {
        slug: cardSlug,
        categorySlug: slug,
        thumbnailId: registry.image(col.querySelector('.box-image img'), file, lineOf),
      });
    }
    categories.push({
      id: `project-category-${slug}`,
      slug,
      label: processText(tab.rawText, stats).trim(),
      locale: 'vi',
      path: `/featured_item_category/${slug}/`,
      sources: [{ file: tabsFile, line: tabs.lineOf(tab.range[0]), sourceId: slug }],
    });
  }

  const slugs = new Set(cards.keys());
  const terms: TermsRecord[] = [];
  const projects: Project[] = [];
  for (const card of cards.values()) {
    const file = `featured_item/${card.slug}/index.html`;
    const { source, root, lineOf } = load(erasDir, file);
    // Raw source: node-html-parser loses <body> on some pages with malformed <head> markup.
    const bodyClasses = (/<body[^>]*\sclass="([^"]*)"/.exec(source)?.[1] ?? '').split(/\s+/);
    const wpId = bodyClasses.find((c) => /^postid-\d+$/.test(c))?.slice('postid-'.length);
    const pageCategories = bodyClasses
      .filter((c) => c.startsWith('featured-item-category-'))
      .map((c) => c.slice('featured-item-category-'.length));
    if (pageCategories.join() !== card.categorySlug)
      throw new Error(
        `Source drift: ${file} body says ${pageCategories.join() || 'no category'}, ` +
          `listing says ${card.categorySlug}`,
      );
    const h1 = root.querySelector('h1.entry-title');
    const content = root.querySelector('.qodef-portfolio-content');
    if (!wpId || !h1 || !content) throw new Error(`${file}: unexpected project markup`);
    const contentSource: SourceRef = { file, line: lineOf(content.range[0]) };

    // Delivery terms: one utilityContent record per boilerplate variant, first-seen order.
    const html = sanitize(
      content,
      {
        text: (raw) => processText(raw, stats),
        href: (raw) => processHref(raw, file, contentSource.line, stats),
      },
      TERMS_ALLOWED,
    );
    let termsRecord = terms.find((t) => t.body.html === html);
    if (!termsRecord) {
      if (terms.length === MAX_TERMS_VARIANTS)
        throw new Error(`Source drift: ${file} has terms variant ${terms.length + 1}`);
      termsRecord = {
        id: `project-terms-${terms.length + 1}`,
        body: { format: 'sanitized-html', html, assetIds: [], sources: [] },
      };
      terms.push(termsRecord);
    }
    termsRecord.body.sources.push(contentSource);

    const og = root.querySelector('meta[property="og:image"]');
    const seoImageId = og
      ? registry.add(
          og.getAttribute('content'),
          { kind: 'image' },
          { file, line: lineOf(og.range[0]) },
        )?.id
      : undefined;
    const heroImageId = registry.image(
      root.querySelector('.portfolio-single-page .banner-bg img'),
      file,
      lineOf,
    );
    const galleryIds = root
      .querySelectorAll('#slider-duan img')
      .map((img) => registry.image(img, file, lineOf))
      .filter((id): id is string => !!id);
    const description = root.querySelector('meta[name="description"]')?.getAttribute('content');
    const displayDate = root.querySelector('.qodef-info--date .entry-date')?.rawText.trim();
    const projectPath = `/featured_item/${card.slug}/` as PublicPath;

    const project: Project = {
      id: `project-${wpId}`,
      locale: 'vi',
      path: projectPath,
      title: processText(h1.rawText, stats).replace(/\s+/g, ' ').trim(),
      slug: card.slug,
      categoryIds: [`project-category-${card.categorySlug}`],
      galleryIds,
      body: { format: 'sanitized-html', html: '', assetIds: [], sources: [contentSource] },
      metadata: [],
      deliveryTermsId: termsRecord.id,
      // Slugs for now; mapped to ids once every page is read.
      relatedProjectIds: root
        .querySelectorAll('.portfolio-related .portfolio-box')
        .map((box) => projectSlug(box.closest('a[href]')?.getAttribute('href'), file, slugs)),
      seo: {
        title: processText(root.querySelector('title')?.rawText ?? '', stats).trim(),
        canonicalPath: projectPath,
      },
      sources: [{ file, line: lineOf(h1.range[0]), sourceId: wpId }],
    };
    if (card.thumbnailId) project.thumbnailId = card.thumbnailId;
    if (heroImageId) project.heroImageId = heroImageId;
    if (displayDate) project.displayDate = processText(displayDate, stats);
    if (description) project.seo.description = processText(description, stats).trim();
    if (seoImageId) project.seo.imageId = seoImageId;
    projects.push(project);
  }

  const idBySlug = new Map(projects.map((p) => [p.slug, p.id]));
  for (const project of projects)
    project.relatedProjectIds = project.relatedProjectIds.map((slug) => idBySlug.get(slug)!);

  return { projects, categories, terms };
}
