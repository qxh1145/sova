import '@/styles/legacy/sections/route-goc-nhin.css';
import { notFound } from 'next/navigation';
import { listRoutes } from '@/lib/queries/site';
import { getBlogListingPage } from '@/lib/queries/posts';
import { parsePageParam, pathSegments } from '@/lib/routes';
import { BlogListView } from '@/components/blog/BlogListView';

export async function generateStaticParams() {
  const routes = await listRoutes();
  return routes
    .filter((r) => r.locale === 'vi' && r.kind === 'post-list' && r.path.startsWith('/goc-nhin/page/'))
    .map((r) => pathSegments(r.path))
    .filter((parts) => parts.length === 3 && parts[1] === 'page' && /^\d+$/.test(parts[2]))
    .map((parts) => ({ page: parts[2] }));
}

import type { Metadata } from 'next';
import { BRAND_TITLE_SUFFIX, routeAlternates } from '@/lib/queries/site';

interface GocNhinPagedProps {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({ params }: GocNhinPagedProps): Promise<Metadata> {
  const { page: pageStr } = await params;
  const pageNum = parsePageParam(pageStr);
  if (pageNum === null) return {};

  const targetPath: `/${string}` = `/goc-nhin/page/${pageNum}/`;
  const data = await getBlogListingPage({
    page: pageNum,
    locale: 'vi',
  });
  if (!data) return {};

  const title = `${data.settings?.heading.title ?? data.copy.title}${BRAND_TITLE_SUFFIX}`;
  const alternates = await routeAlternates(targetPath);
  return {
    title,
    alternates,
  };
}

export default async function ViGocNhinPagedPage({ params }: GocNhinPagedProps) {
  const { page: pageStr } = await params;
  const pageNum = parsePageParam(pageStr);
  if (pageNum === null) {
    notFound();
  }

  const data = await getBlogListingPage({
    page: pageNum,
    locale: 'vi',
  });

  if (!data) {
    notFound();
  }

  return <BlogListView {...data} />;
}
