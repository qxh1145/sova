import { notFound } from 'next/navigation';
import '@/styles/legacy/sections/route-du-an.css';
import '@/styles/legacy/sections/route-en--our-project.css';
import { SiteShell } from '@/components/layout/SiteShell';
import { ProjectListView } from '@/components/projects/ProjectListView';
import { getShellProps } from '@/lib/queries/site';
import { getProjectListingPage } from '@/lib/queries/projects';
import { createScenarioRepository } from '@/dev/scenarios';
import { routes } from '@/data/routes';
import type { Locale } from '@/types/content';

export const dynamic = 'force-dynamic';

const VALID_VARIANTS = new Set(['default', 'loading', 'empty', 'error']);

export default async function DevFixtureProjectsPage({
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

  if (variant === 'error') {
    await getProjectListingPage(locale, createScenarioRepository('error'));
  }

  const repo =
    variant === 'empty'
      ? createScenarioRepository('empty')
      : createScenarioRepository('happy-path');
  // Scenario fixtures carry no project-list routes; borrow the registry's so the listing route guard passes.
  const listingRepo = {
    ...repo,
    listRoutes: async () => routes.filter((r) => r.kind === 'project-list'),
  };

  const [shell, data] = await Promise.all([
    getShellProps(locale, repo),
    getProjectListingPage(locale, listingRepo),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <SiteShell {...shell}>
      <ProjectListView {...data} loading={variant === 'loading'} />
    </SiteShell>
  );
}
