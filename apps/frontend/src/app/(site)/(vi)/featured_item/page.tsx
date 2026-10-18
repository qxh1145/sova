import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '@/styles/legacy/sections/route-featured_item.css';
import { BRAND_TITLE_SUFFIX, routeAlternates } from '@/lib/queries/site';
import { getProjectListingPage } from '@/lib/queries/projects';
import { ProjectArchiveView } from '@/components/projects/ProjectArchiveView';
import { PROJECT_HERO_IDS_FEATURED } from '@/components/projects/projectHeroIds';

const IDS = {
  section: 'section_830725942',
  portfolio: 'portfolio-1541637127',
  hero: PROJECT_HERO_IDS_FEATURED,
};

export async function generateMetadata(): Promise<Metadata> {
  const data = await getProjectListingPage('vi', undefined, { routeId: 'route-featured_item' });
  if (!data) return {};
  const title = `Portfolio${BRAND_TITLE_SUFFIX}`;
  const alternates = await routeAlternates('/featured_item/');
  return {
    title,
    alternates,
  };
}

export default async function ViFeaturedItemArchivePage() {
  const data = await getProjectListingPage('vi', undefined, { routeId: 'route-featured_item' });
  if (!data) {
    notFound();
  }
  return <ProjectArchiveView {...data} ids={IDS} listingPath="/featured_item/" />;
}
