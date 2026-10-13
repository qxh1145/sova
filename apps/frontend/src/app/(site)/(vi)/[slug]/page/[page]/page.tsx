import type { Metadata } from 'next';
import '@/styles/legacy/sections/route-goc-nhin.css';
import { notFound } from 'next/navigation';
import { categorySlugs, parsePageParam, pathSegments } from '@/lib/routes';
import { BRAND_TITLE_SUFFIX, listRoutes, routeAlternates } from '@/lib/queries/site';
import { getBlogListingPage } from '@/lib/queries/posts';
import { BlogListView } from '@/components/blog/BlogListView';

export async function generateStaticParams() {
  const routes = await listRoutes();
  const catSlugs = new Set(categorySlugs(routes));

  return routes
    .filter((r) => {
      if (r.locale !== 'vi' || r.kind !== 'post-list') return false;
      const parts = pathSegments(r.path); // ['thu-thuat', 'page', '2']
      return parts.length === 3 && parts[1] === 'page' && catSlugs.has(parts[0]);
    })
    .map((r) => {
      const parts = pathSegments(r.path);
      return {
        slug: parts[0],
        page: parts[2],
      };
    });
}

interface ViCategoryPagedPageProps {
  params: Promise<{ slug: string; page: string }>;
}

export async function generateMetadata({ params }: ViCategoryPagedPageProps): Promise<Metadata> {
  const { slug, page: pageStr } = await params;
  const pageNum = parsePageParam(pageStr);
  if (pageNum === null) return {};

  const targetPath: `/${string}` = `/${slug}/page/${pageNum}/`;
  const data = await getBlogListingPage({
    category: slug,
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

export default async function ViCategoryPagedPage({ params }: ViCategoryPagedPageProps) {
  const { slug, page: pageStr } = await params;
  const pageNum = parsePageParam(pageStr);
  if (pageNum === null) {
    notFound();
  }

  const data = await getBlogListingPage({
    category: slug,
    page: pageNum,
    locale: 'vi',
  });

  if (!data) {
    notFound();
  }

  return <BlogListView {...data} />;
}
