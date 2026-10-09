import type { ProjectListingPageData } from '@/lib/queries/projects';
import { PageHero, type PageHeroIds } from '@/components/hero/PageHero';
import { ProjectCard, toCardData, categoryLabel } from './ProjectCard';
import { ProjectFilters } from './ProjectFilters';
import { ProjectGrid } from './ProjectGrid';

export interface ProjectArchiveIds {
  section: string;
  portfolio: string;
  hero: PageHeroIds;
}

export interface ProjectArchiveViewProps extends ProjectListingPageData {
  ids: ProjectArchiveIds;
  /** `/featured_item/` ships the client filter (no pagination); category archives render a static grid. */
  listingPath?: string;
}

const COLUMNS = { largeColumns: 4, mediumColumns: 3, smallColumns: 2 };

/** `/featured_item/` and `/featured_item_category/{slug}/`: source `portfolio-archive` markup. */
export function ProjectArchiveView({
  projects,
  categories,
  thumbnailAssets,
  heroImage,
  bgImage,
  settings,
  copy,
  locale,
  ids,
  listingPath,
}: ProjectArchiveViewProps) {
  const assetMap = new Map(thumbnailAssets.map((a) => [a.id, a]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.label]));
  const cards = projects.map(toCardData);

  return (
    <main id="main">
      <div className="portfolio-page-wrapper portfolio-archive page-featured-item">
        <div className="page-title">
          <div className="page-title-inner container flex-row">
            <div className="flex-col flex-grow">
              <h1 className="entry-title uppercase mb-0">{settings?.heading.title}</h1>
            </div>
          </div>
        </div>

        <section className="section ss-duan" id={ids.section}>
          <div className="section-bg fill" />
          <div className="section-content relative">
            {settings?.hero && (
              <PageHero
                hero={settings.hero}
                heroImage={heroImage}
                bgImage={bgImage}
                ids={ids.hero}
                bannerClass="banner-project"
              />
            )}
          </div>
        </section>

        <div id="content" className="page-wrapper">
          {listingPath ? (
            <ProjectFilters
              projects={cards}
              // Source filter nav lists terms by name: Branding, Mobile App, Website.
              categories={[...categories].sort((x, y) => x.label.localeCompare(y.label))}
              listingPath={listingPath}
              thumbnailAssets={thumbnailAssets}
              locale={locale}
              emptyMessage={copy.emptyMessage}
              loadingMessage={copy.loadingMessage}
              filterAllLabel={copy.filterAll}
              wrapperId={ids.portfolio}
              grid={COLUMNS}
            />
          ) : (
            <div id={ids.portfolio} className="portfolio-element-wrapper has-filtering">
              <ProjectGrid {...COLUMNS} rowIsotope={false}>
                {cards.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    thumbnailAsset={
                      project.thumbnailId ? assetMap.get(project.thumbnailId) : undefined
                    }
                    categoryLabel={categoryLabel(project.categoryIds, categoryMap)}
                  />
                ))}
              </ProjectGrid>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
