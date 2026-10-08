import '@/styles/legacy/sections/route-du-an.css';
import { getProjectListingPage } from '@/lib/queries/projects';
import { ProjectListView } from '@/components/projects/ProjectListView';

export default async function ViProjectListingPage() {
  const data = await getProjectListingPage('vi');
  return <ProjectListView {...data} />;
}
