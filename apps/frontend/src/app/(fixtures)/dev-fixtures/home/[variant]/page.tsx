import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/layout/SiteShell';
import { HomeView } from '@/components/home/HomeView';
import { FeaturedProjects } from '@/components/projects/FeaturedProjects';
import { getShellProps } from '@/lib/queries/site';
import { getHomePage } from '@/lib/queries/pages';
import { getAssets } from '@/lib/queries/assets';
import { getProjectCategories } from '@/lib/queries/projects';
import { createScenarioRepository } from '@/dev/scenarios';
import type { Locale } from '@/types/content';
import { UnmountToggle } from './UnmountToggle';

export const dynamic = 'force-dynamic';

const VALID_VARIANTS = new Set(['empty', 'error', 'unmount']);

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

  // Real VI projects inside a client toggle: e2e unmounts the island without navigating.
  if (variant === 'unmount') {
    const home = await getHomePage('vi');
    if (!home) notFound();
    const { projects } = home;
    const [assets, categories] = await Promise.all([
      getAssets(projects.map((p) => p.galleryIds[0]).filter((id): id is string => Boolean(id))),
      getProjectCategories(),
    ]);
    return (
      <UnmountToggle>
        <FeaturedProjects
          projects={projects}
          copy={home.sectionCopy.projects}
          assets={assets}
          categories={categories}
        />
      </UnmountToggle>
    );
  }

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
  const [projectAssets, categories] = await Promise.all([
    galleryAssetIds.length ? getAssets(galleryAssetIds, emptyRepo) : Promise.resolve([]),
    getProjectCategories(emptyRepo),
  ]);

  return (
    <SiteShell {...shell}>
      <HomeView
        content={content}
        locale={locale}
        videoAsset={videoAsset}
        projectAssets={projectAssets}
        projectCategories={categories}
      />
    </SiteShell>
  );
}
