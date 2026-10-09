import type { ProjectListingPageData } from '@/lib/queries/projects';
import { PageHero } from '@/components/hero/PageHero';
import {
  PROJECT_HERO_IDS_VI,
  PROJECT_HERO_IDS_EN,
} from './projectHeroIds';
import { ProjectFilters } from './ProjectFilters';
import { toCardData } from './ProjectCard';

export interface ProjectListViewProps extends ProjectListingPageData {
  loading?: boolean;
}

export function ProjectListView({
  projects,
  categories,
  thumbnailAssets,
  heroImage,
  bgImage,
  settings,
  copy,
  locale,
  loading = false,
}: ProjectListViewProps) {
  const isEn = locale === 'en';
  const heroIds = isEn ? PROJECT_HERO_IDS_EN : PROJECT_HERO_IDS_VI;
  const sectionId = isEn ? 'section_2024589567' : 'section_2137536464';

  const defaultHero = {
    headingLines: isEn
      ? ['Projects Partnered', 'with Sova']
      : ['Dự án đồng hành', 'cùng Sova'],
    breadcrumb: [
      { label: isEn ? 'Home' : 'Trang chủ', href: '/' },
      { label: isEn ? 'Projects' : 'Dự án' },
    ],
  };

  const hero = settings?.hero ?? defaultHero;

  return (
    <main id="main">
      <section className="section ss-duan" id={sectionId}>
        <div className="section-bg fill" />
        <div className="section-content relative">
          <PageHero
            hero={hero}
            heroImage={heroImage}
            bgImage={bgImage}
            ids={heroIds}
            bannerClass="banner-project"
          />
        </div>
      </section>

      <ProjectFilters
        projects={projects.map(toCardData)}
        listingPath={isEn ? '/en/our-project/' : '/du-an/'}
        categories={categories}
        thumbnailAssets={thumbnailAssets}
        locale={locale}
        loading={loading}
        emptyMessage={copy.emptyMessage}
        loadingMessage={copy.loadingMessage}
        filterAllLabel={copy.filterAll}
        paginationLabels={copy.pagination}
        pageSize={6}
      />
    </main>
  );
}
