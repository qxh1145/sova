import '@/styles/legacy/sections/route-root.css';
import { getHomePage } from '@/lib/queries/pages';
import { getAssets } from '@/lib/queries/assets';
import { HomeView } from '@/components/home/HomeView';

export default async function ViHomePage() {
  const content = await getHomePage('vi');
  if (!content) return <main id="main" />;
  const [videoAsset] = content.hero.videoId ? await getAssets([content.hero.videoId]) : [];
  return <HomeView content={content} locale="vi" videoAsset={videoAsset} />;
}
