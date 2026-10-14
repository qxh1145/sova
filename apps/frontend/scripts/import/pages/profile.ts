import type { AssetRegistry } from '../assets.ts';
import type { CompanyProfileContent } from '../../../src/types/content.ts';
import { applyBrandTerms } from '../../../src/lib/content/brand.ts';
import type { Stats } from '../html.ts';
import {
  bannerTitle,
  identity,
  must,
  seoOf,
  type Page,
} from './shared.ts';

export function profile(page: Page, registry: AssetRegistry, stats: Stats): CompanyProfileContent {
  const { root, file, lineOf, source, route } = page as Page & { source: string };
  const match = /window\.option_df_\d+ = (\{.*?\});/.exec(source);
  const pdf = match ? (JSON.parse(match[1]) as { source?: string }).source : undefined;
  const script = must(root.querySelector('script.df-shortcode-script'), page, 'flipbook script');
  // The PDF is remote (not in the mirror); its brand-named filename is mapped like text.
  const pdfAssetId = must(
    registry.add(
      pdf && applyBrandTerms(pdf).text,
      { kind: 'pdf' },
      { file, line: lineOf(script.range[0]) },
    )?.id,
    page,
    'profile PDF',
  );
  const seo = seoOf(page, registry, stats);
  const banner = must(root.querySelector('#content > .banner'), page, 'banner');
  return {
    ...identity(
      page,
      `profile-${route.locale}`,
      seo,
      lineOf(banner.range[0]),
      bannerTitle(page, stats),
    ),
    translationKey: 'profile',
    coverId: registry.image(banner.querySelector('.banner-bg img'), file, lineOf),
    pdfAssetId,
    seo,
  };
}
