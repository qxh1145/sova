import type { Metadata } from 'next';
import '@/styles/legacy/sections/route-du-an.css';
import { notFound } from 'next/navigation';
import { BRAND_TITLE_SUFFIX, routeAlternates } from '@/lib/queries/site';
import { getProjectListingPage } from '@/lib/queries/projects';
import { ProjectListView } from '@/components/projects/ProjectListView';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getProjectListingPage('vi');
  if (!data) return {};
  const title = `Dự án${BRAND_TITLE_SUFFIX}`;
  const alternates = await routeAlternates('/du-an/');
  return {
    title,
    alternates,
  };
}

export default async function ViProjectListingPage() {
  const data = await getProjectListingPage('vi');
  if (!data) {
    notFound();
  }
  return <ProjectListView {...data} />;
}
