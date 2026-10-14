import { type HTMLElement, TextNode } from 'node-html-parser';
import type { AssetRegistry } from '../assets.ts';
import type { EntityId, HomePageRecord, SectionCopy } from '../../../src/types/content.ts';
import { processHref, processText, type Stats } from '../html.ts';
import { projectSlug } from '../projects.ts';
import { linkModel, plain, sectionCopy } from '../services.ts';
import { imageStem, readSlides } from '../social.ts';
import {
  identity,
  must,
  placements,
  readStats,
  resolveServiceCard,
  seoOf,
  type Page,
  type PageRefs,
} from './shared.ts';

export function home(page: Page, registry: AssetRegistry, stats: Stats, refs: PageRefs) {
  const { root, file, lineOf, route } = page;
  const { locale } = route;
  const content = must(root.querySelector('#content'), page, '#content');
  const heading = must(content.querySelectorAll('.home_text_go h1'), page, 'hero heading');
  const video = content.querySelector('.banner .video-bg source');
  const ctx = { file, lineOf, stats };
  const section = (el: HTMLElement | null, what: string) =>
    must(el?.closest('section.section') ?? null, page, `${what} section`);
  const copy = (el: HTMLElement, what: string): SectionCopy =>
    must(sectionCopy(el, stats), page, `${what} copy`);

  // Services in card order (desktop cards), each resolved by title.
  const serviceCards = must(
    content.querySelectorAll('.hide-for-small .dich_vu'),
    page,
    'service cards',
  );
  const localeServices = refs.services.filter((s) => s.locale === locale);
  const serviceIds = serviceCards.map((card) => {
    const nameEl = must(card.querySelector('.name_dv'), page, 'card name');
    const rawTitle = nameEl.childNodes[0]?.rawText.trim() ?? '';
    const service = resolveServiceCard(rawTitle, localeServices, file);
    return service.id;
  });

  const marquee = must(content.querySelector('.cs-moving_text'), page, 'marquee');
  const marqueeText = marquee.childNodes
    .filter((n): n is TextNode => n instanceof TextNode)
    .map((n) => processText(n.rawText, stats).trim())
    .filter(Boolean);
  const separatorImg = must(marquee.querySelector('img'), page, 'marquee separator image');
  const marqueeSeparatorId = must(
    registry.image(separatorImg, file, lineOf),
    page,
    'marquee separator asset',
  );

  const ssKh = must(content.querySelector('.ss-kh'), page, 'testimonials section');
  const photoImg = must(
    ssKh.querySelector('[id^="image_"] img, .img img'),
    page,
    'testimonials photo image',
  );
  const photoId = must(
    registry.image(photoImg, file, lineOf),
    page,
    'testimonial side photo asset',
  );
  const quoteIconImg = must(
    ssKh.querySelector('img[src*="Group.svg"]'),
    page,
    'testimonials quote icon image',
  );
  const quoteIconId = must(
    registry.image(quoteIconImg, file, lineOf),
    page,
    'testimonial quote icon asset',
  );
  const lineImg = must(
    ssKh.querySelector('img[src*="Vector-268.svg"]'),
    page,
    'testimonials line image',
  );
  const lineId = must(registry.image(lineImg, file, lineOf), page, 'testimonial line asset');

  const projectIds = content.querySelectorAll('.scroll-item a.item-link').map((a) => {
    const id = refs.projectIdBySlug.get(projectSlug(a.getAttribute('href'), file));
    if (!id) throw new Error(`Source drift: ${file}: ${a.getAttribute('href')} is not a project`);
    return id;
  });

  // The first set of post cards (the markup repeats it for the slider).
  const postIds: EntityId[] = [];
  for (const a of content.querySelectorAll('.post-item-cus a.plain')) {
    const href = processHref(a.getAttribute('href') ?? '', file, lineOf(a.range[0]), stats);
    const id = refs.postIdBySlug.get((href ?? '').replace(/^\/|\/$/g, ''));
    if (!id) throw new Error(`Source drift: ${file}: ${href} is not a post`);
    if (postIds.includes(id)) break;
    postIds.push(id);
  }

  const logos = must(content.querySelectorAll('img.gal-doitac'), page, 'partner logos');
  const partnerIds = logos.map((img) => {
    const id = `partner-${imageStem(img.getAttribute('src') ?? '')}`;
    if (!refs.partnerIds.has(id)) throw new Error(`Source drift: ${file}: ${id} is not a partner`);
    return id;
  });

  const footerBar = root.querySelector('#azt-contact-footer');
  if (footerBar) {
    for (const img of footerBar.querySelectorAll('img')) {
      registry.image(img, file, lineOf);
    }
  }

  const seo = seoOf(page, registry, stats);
  const servicesSection = section(content.querySelector('.dich_vu'), 'services');
  const record: HomePageRecord = {
    ...identity(page, `home-${locale}`, seo, lineOf(heading[0].range[0])),
    translationKey: 'home',
    hero: {
      headingLines: heading.map((h) => plain(h, stats)),
      videoId: video
        ? registry.add(
            video.getAttribute('src'),
            { kind: 'video' },
            { file, line: lineOf(video.range[0]) },
          )?.id
        : undefined,
      cta: linkModel(content.querySelector('.link_banner a'), ctx),
    },
    seo,
    statIds: readStats(root, file, locale, stats).map((s) => s.id),
    sectionCopy: {
      achievements: copy(
        must(content.querySelector('.col-thanhtuu'), page, 'achievements'),
        'achievements',
      ),
      services: {
        eyebrow: plain(
          must(servicesSection.querySelector('.tt_dvu p'), page, 'services eyebrow'),
          stats,
        ),
        title: copy(servicesSection, 'services').title,
      },
      projects: copy(section(content.querySelector('.ss-decor'), 'projects'), 'projects'),
      partners: copy(section(logos[0], 'partners'), 'partners'),
      testimonials: copy(section(ssKh, 'testimonials'), 'testimonials'),
      // The news teaser is the last section (EN has no cards in it).
      posts: copy(
        must(root.querySelectorAll('#content > section.section').at(-1), page, 'posts section'),
        'posts',
      ),
    },
    serviceIds,
    marqueeText,
    marqueeSeparatorId,
    testimonialArtIds: {
      photoId,
      quoteIconId,
      lineId,
    },
    projectPlacements: placements(projectIds),
    partnerPlacements: placements(partnerIds),
    testimonialPlacements: placements(readSlides(root, file).map((s) => s.id)),
    postPlacements: placements(postIds),
  };
  return record;
}
