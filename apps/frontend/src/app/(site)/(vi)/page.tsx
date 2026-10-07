import '@/styles/legacy/sections/route-root.css';
import { getHomeAssets, getHomePage } from '@/lib/queries/pages';
import { HomeView } from '@/components/home/HomeView';

export default async function ViHomePage() {
  const content = await getHomePage('vi');
  const homeAssets = await getHomeAssets(content);

  return (
    <HomeView
      content={content}
      locale="vi"
      {...homeAssets}
    />
  );
}
