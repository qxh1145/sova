import '@/styles/legacy/sections/route-en--home.css';
import { getHomePage } from '@/lib/queries/pages';
import { getAssets } from '@/lib/queries/assets';
import { HomeView } from '@/components/home/HomeView';

export default async function EnHomePage() {
  const content = await getHomePage('en');
  if (!content) return <main id="main" />;
  const [videoAsset] = content.hero.videoId ? await getAssets([content.hero.videoId]) : [];
  return <HomeView content={content} locale="en" videoAsset={videoAsset} />;
}
