import type { AssetRegistry } from '../assets.ts';
import type { HeroContent, ListingSettings } from '../../../src/types/content.ts';
import { processHref, type Stats } from '../html.ts';
import { linkModel, plain } from '../services.ts';
import {
  must,
  rich,
  type Page,
} from './shared.ts';

export function listing(page: Page, registry: AssetRegistry, stats: Stats): ListingSettings {
  const headingLines = must(
    page.root
      .querySelectorAll('h1')
      .filter((h) => !h.classList.contains('entry-title') && !h.closest('footer')),
    page,
    'listing h1',
  ).map((h) => plain(h, stats));
  // Featured archives title the page with `h1.entry-title` (category label, or the THP title on
  // /featured_item/, A12).
  const category =
    page.root.querySelector('h2.category-title') ?? page.root.querySelector('h1.entry-title');

  let hero: HeroContent = { headingLines };

  if (
    page.route.id === 'route-du-an' ||
    page.route.id === 'route-en--our-project' ||
    page.route.id === 'route-featured_item' ||
    page.route.id.startsWith('route-featured_item_category--')
  ) {
    const banner = page.root.querySelector('.banner');
    if (banner) {
      const lineOf = page.lineOf;
      const file = page.file;
      const ctx = { file, lineOf, stats };

      const bgImg = banner.querySelector('.banner-bg img');
      const bgImageId = registry.image(bgImg, file, lineOf);

      const rightColImg = banner.querySelector('.img img');
      const imageId = registry.image(rightColImg, file, lineOf);

      const descEl = banner.querySelector('.text.nd-kh');
      const descText = descEl ? descEl.childNodes[0]?.rawText.trim() : undefined;
      const description = descText
        ? rich(descText, [{ file, line: lineOf(descEl!.range[0]) }])
        : undefined;

      const ctaEl = banner.querySelector('a.but-lh');
      const cta = linkModel(ctaEl, ctx);

      const bcEl = banner.querySelector('.row .col:first-child .text:first-child');
      let breadcrumb: { label: string; href?: string }[] | undefined;
      if (bcEl) {
        const homeLink = bcEl.querySelector('a');
        const lastText = bcEl.childNodes
          .filter((n) => n.nodeType === 3)
          .map((n) => n.text.trim())
          .filter(Boolean)
          .pop();
        if (homeLink && lastText) {
          breadcrumb = [
            {
              label: plain(homeLink, stats),
              href: processHref(homeLink.getAttribute('href') ?? '', file, lineOf(homeLink.range[0]), stats) ?? '/',
            },
            {
              label: lastText,
            },
          ];
        }
      }

      hero = {
        headingLines,
        description,
        cta,
        imageId,
        bgImageId,
        breadcrumb,
      };
    }
  }

  return {
    routeId: page.route.id,
    heading: { title: category ? plain(category, stats) : headingLines.join(' ') },
    hero,
  };
}
