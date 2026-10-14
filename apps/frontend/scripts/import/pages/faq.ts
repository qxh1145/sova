import type { AssetRegistry } from '../assets.ts';
import type { FAQPageContent } from '../../../src/types/content.ts';
import type { Stats } from '../html.ts';
import { plain } from '../services.ts';
import {
  bannerTitle,
  identity,
  must,
  seoOf,
  type Page,
} from './shared.ts';

export function faqPage(page: Page, registry: AssetRegistry, stats: Stats): FAQPageContent {
  const { root, lineOf, route } = page;
  const banner = must(root.querySelector('#content > .banner'), page, 'banner');
  const breadcrumb = must(banner.querySelector('p'), page, 'breadcrumb');
  const homeLink = must(breadcrumb.querySelector('a'), page, 'breadcrumb home link');
  const currentSpan = must(breadcrumb.querySelector('span'), page, 'breadcrumb current span');
  const seo = seoOf(page, registry, stats);

  return {
    ...identity(
      page,
      `faq-${route.locale}`,
      seo,
      lineOf(banner.range[0]),
      bannerTitle(page, stats),
    ),
    translationKey: 'faq',
    breadcrumb: {
      homeLabel: plain(homeLink, stats),
      current: plain(currentSpan, stats),
    },
    seo,
  };
}
