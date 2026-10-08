import '@/styles/legacy/sections/route-featured_item.css';
import { getProjectListingPage } from '@/lib/queries/projects';
import { ProjectArchiveView } from '@/components/projects/ProjectArchiveView';
import { PROJECT_HERO_IDS_FEATURED } from '@/components/services/ServiceHero';
import { featuredItemOrder } from '@/data/projects';

const IDS = {
  section: 'section_830725942',
  portfolio: 'portfolio-1541637127',
  hero: PROJECT_HERO_IDS_FEATURED,
};

const ORDER_MAP = new Map(featuredItemOrder.map((id, idx) => [id, idx]));

export default async function ViFeaturedItemArchivePage() {
  const data = await getProjectListingPage('vi', undefined, { routeId: 'route-featured_item' });
  const sortedProjects = [...data.projects].sort(
    (a, b) => (ORDER_MAP.get(a.id) ?? 999) - (ORDER_MAP.get(b.id) ?? 999),
  );
  return <ProjectArchiveView {...data} projects={sortedProjects} ids={IDS} listingPath="/featured_item/" />;
}

