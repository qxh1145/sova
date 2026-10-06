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
  const partnerLogoIds = (content?.partners ?? []).map((p) => p.logoId);
  const testimonialAvatarIds = (content?.testimonials ?? [])
    .map((t) => t.avatarId)
    .filter((id): id is string => Boolean(id));
  const postThumbnailIds = (content?.posts ?? [])
    .map((p) => p.thumbnailId)
    .filter((id): id is string => Boolean(id));

  const [
    [videoAsset],
    projectAssets,
    categories,
    partnerAssets,
    testimonialAssets,
    postAssets,
  ] = await Promise.all([
    content?.hero.videoId ? getAssets([content.hero.videoId]) : Promise.resolve([]),
    galleryAssetIds.length ? getAssets(galleryAssetIds) : Promise.resolve([]),
    getProjectCategories(),
    partnerLogoIds.length ? getAssets(partnerLogoIds) : Promise.resolve([]),
    testimonialAvatarIds.length ? getAssets(testimonialAvatarIds) : Promise.resolve([]),
    postThumbnailIds.length ? getAssets(postThumbnailIds) : Promise.resolve([]),
  ]);

  return (
    <HomeView
      content={content}
      locale="en"
      videoAsset={videoAsset}
      projectAssets={projectAssets}
      projectCategories={categories}
      partnerAssets={partnerAssets}
      testimonialAssets={testimonialAssets}
      postAssets={postAssets}
    />
  );
}
