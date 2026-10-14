import type { Metadata } from 'next';
import '@/styles/legacy/sections/route-goc-nhin.css';
import { notFound } from 'next/navigation';
import { parsePageParam } from '@/lib/routes';
import { BRAND_TITLE_SUFFIX, routeAlternates } from '@/lib/queries/site';
import { getBlogCategoryPagedParams, getBlogListingPage } from '@/lib/queries/posts';
import { BlogListView } from '@/components/blog/BlogListView';

export function generateStaticParams() {
  return getBlogCategoryPagedParams();
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
