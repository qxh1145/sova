import type { AssetRef, HomePageContent, Locale, ProjectCategory } from '@/types/content';
import { HomeHero } from './HomeHero';
import { HomeStats } from './HomeStats';
import { FeaturedProjects } from '@/components/projects/FeaturedProjects';

export interface HomeViewProps {
  content: HomePageContent | null;
  locale: Locale;
  videoAsset?: AssetRef | null;
  projectAssets?: AssetRef[];
  projectCategories?: ProjectCategory[];
}

export function HomeView({
  content,
  locale,
  videoAsset,
  projectAssets,
  projectCategories,
}: HomeViewProps) {
  if (!content) {
    return <main id="main" />;
  }

  return (
    <main id="main">
      <HomeHero hero={content.hero} locale={locale} videoAsset={videoAsset} />
      <HomeStats stats={content.stats} copy={content.sectionCopy.achievements} locale={locale} />
      <FeaturedProjects
        projects={content.projects}
        copy={content.sectionCopy.projects}
        assets={projectAssets}
        categories={projectCategories}
      />
    </main>
  );
}
