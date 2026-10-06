import type { AssetRef, HomePageContent, Locale } from '@/types/content';
import { HomeHero } from './HomeHero';
import { HomeStats } from './HomeStats';

export interface HomeViewProps {
  content: HomePageContent | null;
  locale: Locale;
  videoAsset?: AssetRef | null;
}

export function HomeView({ content, locale, videoAsset }: HomeViewProps) {
  if (!content) {
    return <main id="main" />;
  }

  return (
    <main id="main">
      <HomeHero hero={content.hero} locale={locale} videoAsset={videoAsset} />
      <HomeStats stats={content.stats} copy={content.sectionCopy.achievements} locale={locale} />
    </main>
  );
}
