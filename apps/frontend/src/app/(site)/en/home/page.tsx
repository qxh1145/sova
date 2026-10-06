import '@/styles/legacy/sections/route-en--home.css';
import { getHomePage } from '@/lib/queries/pages';
import { getAssets } from '@/lib/queries/assets';
import { getProjectCategories } from '@/lib/queries/projects';
import { HomeView } from '@/components/home/HomeView';

export default async function EnHomePage() {
  const content = await getHomePage('en');
  const galleryAssetIds = (content?.projects ?? [])
    .map((p) => p.galleryIds[0])
    .filter((id): id is string => Boolean(id));

  const [[videoAsset], projectAssets, categories] = await Promise.all([
    content?.hero.videoId ? getAssets([content.hero.videoId]) : Promise.resolve([]),
    galleryAssetIds.length ? getAssets(galleryAssetIds) : Promise.resolve([]),
    getProjectCategories(),
  ]);

  return (
    <HomeView
      content={content}
      locale="en"
      videoAsset={videoAsset}
      projectAssets={projectAssets}
      projectCategories={categories}
    />
  );
}
