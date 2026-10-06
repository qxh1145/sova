import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/layout/SiteShell';
import { HomeView } from '@/components/home/HomeView';
import { getShellProps } from '@/lib/queries/site';
import { getHomePage } from '@/lib/queries/pages';
import { getAssets } from '@/lib/queries/assets';
import { getProjectCategories } from '@/lib/queries/projects';
import { createScenarioRepository } from '@/dev/scenarios';
import type { Locale } from '@/types/content';

export const dynamic = 'force-dynamic';

const VALID_VARIANTS = new Set(['empty', 'error']);

export default async function DevFixtureHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams?: Promise<{ locale?: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;
  if (!VALID_VARIANTS.has(variant)) {
    notFound();
  }

  const { locale: rawLocale } = (await searchParams) ?? {};
  const locale: Locale = rawLocale === 'en' ? 'en' : 'vi';

  // The error repository rejects, so getHomePage throws into the sibling error.tsx.
  if (variant === 'error') {
    await getHomePage(locale, createScenarioRepository('error'));
  }

  const emptyRepo = createScenarioRepository('empty');
  const [shell, content] = await Promise.all([
    getShellProps(locale, emptyRepo),
    getHomePage(locale, emptyRepo),
  ]);

  const [videoAsset] = content?.hero.videoId
    ? await getAssets([content.hero.videoId], emptyRepo)
    : [];
  const galleryAssetIds = (content?.projects ?? [])
    .map((p) => p.galleryIds[0])
    .filter((id): id is string => Boolean(id));
  const partnerLogoIds = (content?.partners ?? []).map((p) => p.logoId);
  const testimonialAvatarIds = (content?.testimonials ?? [])
    .map((t) => t.avatarId)
    .filter((id): id is string => Boolean(id));
  const [projectAssets, categories, partnerAssets, testimonialAssets] = await Promise.all([
    galleryAssetIds.length ? getAssets(galleryAssetIds, emptyRepo) : Promise.resolve([]),
    getProjectCategories(emptyRepo),
    partnerLogoIds.length ? getAssets(partnerLogoIds, emptyRepo) : Promise.resolve([]),
    testimonialAvatarIds.length ? getAssets(testimonialAvatarIds, emptyRepo) : Promise.resolve([]),
  ]);

  return (
    <SiteShell {...shell}>
      <HomeView
        content={content}
        locale={locale}
        videoAsset={videoAsset}
        projectAssets={projectAssets}
        projectCategories={categories}
        partnerAssets={partnerAssets}
        testimonialAssets={testimonialAssets}
      />
    </SiteShell>
  );
}

