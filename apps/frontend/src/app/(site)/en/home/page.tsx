import '@/styles/legacy/sections/route-en--home.css';
import { getHomeAssets, getHomePage } from '@/lib/queries/pages';
import { HomeView } from '@/components/home/HomeView';

export default async function EnHomePage() {
  const content = await getHomePage('en');
  const homeAssets = await getHomeAssets(content);

  return (
    <HomeView
      content={content}
      locale="en"
      {...homeAssets}
    />
  );
}
