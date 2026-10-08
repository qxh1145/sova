import '@/styles/legacy/sections/route-en--our-project.css';
import { getProjectListingPage } from '@/lib/queries/projects';
import { ProjectListView } from '@/components/projects/ProjectListView';

export default async function EnProjectListingPage() {
  const data = await getProjectListingPage('en');
  return <ProjectListView {...data} />;
}
