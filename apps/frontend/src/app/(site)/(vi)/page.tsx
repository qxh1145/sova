import '@/styles/legacy/sections/route-root.css';
import { getHomePage } from '@/lib/queries/pages';
import { getAssets } from '@/lib/queries/assets';
import { getProjectCategories } from '@/lib/queries/projects';
import { HomeView } from '@/components/home/HomeView';

export default async function ViHomePage() {
  const content = await getHomePage('vi');
  const galleryAssetIds = (content?.projects ?? [])
    .map((p) => p.galleryIds[0])
    .filter((id): id is string => Boolean(id));
  const partnerLogoIds = (content?.partners ?? []).map((p) => p.logoId);
  const testimonialAvatarIds = (content?.testimonials ?? [])
    .map((t) => t.avatarId)
    .filter((id): id is string => Boolean(id));

  const [[videoAsset], projectAssets, categories, partnerAssets, testimonialAssets] =
    await Promise.all([
      content?.hero.videoId ? getAssets([content.hero.videoId]) : Promise.resolve([]),
      galleryAssetIds.length ? getAssets(galleryAssetIds) : Promise.resolve([]),
      getProjectCategories(),
      partnerLogoIds.length ? getAssets(partnerLogoIds) : Promise.resolve([]),
      testimonialAvatarIds.length ? getAssets(testimonialAvatarIds) : Promise.resolve([]),
    ]);

  return (
    <HomeView
      content={content}
      locale="vi"
      videoAsset={videoAsset}
      projectAssets={projectAssets}
      projectCategories={categories}
      partnerAssets={partnerAssets}
      testimonialAssets={testimonialAssets}
    />
  );
}

