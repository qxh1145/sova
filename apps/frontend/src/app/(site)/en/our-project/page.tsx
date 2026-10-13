import type { Metadata } from 'next';
import '@/styles/legacy/sections/route-en--our-project.css';
import { notFound } from 'next/navigation';
import { BRAND_TITLE_SUFFIX, routeAlternates } from '@/lib/queries/site';
import { getProjectListingPage } from '@/lib/queries/projects';
import { ProjectListView } from '@/components/projects/ProjectListView';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getProjectListingPage('en');
  if (!data) return {};
  const title = `Our Project${BRAND_TITLE_SUFFIX}`;
  const alternates = await routeAlternates('/en/our-project/');
  return {
    title,
    alternates,
  };
}

export default async function EnProjectListingPage() {
  const data = await getProjectListingPage('en');
  if (!data) {
    notFound();
  }
  return <ProjectListView {...data} />;
}
