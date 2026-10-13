import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/layout/SiteShell';
import { HomeView } from '@/components/home/HomeView';
import { FeaturedProjects } from '@/components/projects/FeaturedProjects';
import { getShellProps } from '@/lib/queries/site';
import { getHomeAssets, getHomePage } from '@/lib/queries/pages';
import { createScenarioRepository } from '@/dev/scenarios';
import type { Locale } from '@/types/content';
import { UnmountToggle } from './UnmountToggle';
import '@/styles/legacy/sections/route-root.css';

export const dynamic = 'force-dynamic';

const VALID_VARIANTS = new Set(['empty', 'error', 'missing-media', 'unmount', 'one-card']);

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
    const { projectAssets, projectCategories } = await getHomeAssets(home);
    return (
      <UnmountToggle>
        <FeaturedProjects
          projects={home.projects}
          copy={home.sectionCopy.projects}
          assets={projectAssets}
          categories={projectCategories}
        />
      </UnmountToggle>
    );
  }

  if (variant === 'one-card') {
    const home = await getHomePage('vi');
    if (!home) notFound();
    const { projectAssets, projectCategories } = await getHomeAssets(home);
    // Tall filler below the section so the pin range can actually be scrolled through.
    return (
      <>
        <FeaturedProjects
          projects={home.projects.slice(0, 1)}
          copy={home.sectionCopy.projects}
          assets={projectAssets}
          categories={projectCategories}
        />
        <div style={{ height: '200vh' }} />
      </>
    );
  }

  // The error repository rejects, so getHomePage throws into the sibling error.tsx.
  if (variant === 'error') {
    await getHomePage(locale, createScenarioRepository('error'));
  }

  const repo = createScenarioRepository(variant === 'missing-media' ? 'missing-media' : 'empty');
  const [shell, content] = await Promise.all([
    getShellProps(locale, repo),
    getHomePage(locale, repo),
  ]);

  const homeAssets = await getHomeAssets(content, repo);

  return (
    <SiteShell {...shell}>
      <HomeView content={content} locale={locale} {...homeAssets} />
    </SiteShell>
  );
}
