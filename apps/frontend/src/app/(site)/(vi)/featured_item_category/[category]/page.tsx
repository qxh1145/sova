import '@/styles/legacy/sections/route-featured_item_category--branding.css';
import '@/styles/legacy/sections/route-featured_item_category--mobile-app.css';
import '@/styles/legacy/sections/route-featured_item_category--website.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BRAND_TITLE_SUFFIX, routeAlternates } from '@/lib/queries/site';
import { getProjectListingPage } from '@/lib/queries/projects';
import {
  ProjectArchiveView,
  type ProjectArchiveIds,
} from '@/components/projects/ProjectArchiveView';
import {
  PROJECT_HERO_IDS_FEATURED_BRANDING,
  PROJECT_HERO_IDS_FEATURED_MOBILE_APP,
  PROJECT_HERO_IDS_FEATURED_WEBSITE,
} from '@/components/projects/projectHeroIds';

// Source element ids per category archive; legacy CSS targets them.
const IDS: Record<string, ProjectArchiveIds> = {
  branding: {
    section: 'section_1170026090',
    portfolio: 'portfolio-1442370418',
    hero: PROJECT_HERO_IDS_FEATURED_BRANDING,
  },
  'mobile-app': {
    section: 'section_1483903209',
    portfolio: 'portfolio-1320843097',
    hero: PROJECT_HERO_IDS_FEATURED_MOBILE_APP,
  },
  website: {
    section: 'section_337019708',
    portfolio: 'portfolio-200128785',
    hero: PROJECT_HERO_IDS_FEATURED_WEBSITE,
  },
};

export async function generateStaticParams() {
  return Object.keys(IDS).map((category) => ({ category }));
}

interface FeaturedItemCategoryProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: FeaturedItemCategoryProps): Promise<Metadata> {
  const { category } = await params;
  if (!Object.hasOwn(IDS, category)) return {};
  const data = await getProjectListingPage('vi', undefined, {
    routeId: `route-featured_item_category--${category}`,
    category,
  });
  if (!data) return {};

  const title = `${data.settings?.heading.title ?? category}${BRAND_TITLE_SUFFIX}`;
  const alternates = await routeAlternates(`/featured_item_category/${category}/`);
  return {
    title,
    alternates,
  };
}

export default async function ViFeaturedItemCategoryPage({ params }: FeaturedItemCategoryProps) {
  const { category } = await params;
  if (!Object.hasOwn(IDS, category)) notFound();
  const data = await getProjectListingPage('vi', undefined, {
    routeId: `route-featured_item_category--${category}`,
    category,
  });
  if (!data) notFound();
  return <ProjectArchiveView {...data} ids={IDS[category]} />;
}
