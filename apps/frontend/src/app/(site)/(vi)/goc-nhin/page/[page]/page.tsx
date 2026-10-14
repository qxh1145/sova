import '@/styles/legacy/sections/route-goc-nhin.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BRAND_TITLE_SUFFIX, routeAlternates } from '@/lib/queries/site';
import { getBlogListingPage } from '@/lib/queries/posts';
import { parsePageParam, totalPages } from '@/lib/routes';
import { getRepository } from '@/lib/repositories';
import { BlogListView } from '@/components/blog/BlogListView';

export async function generateStaticParams() {
  const repo = getRepository();
  const { total } = await repo.listPosts({ locale: 'vi', page: 1, pageSize: 6 });
  const maxPages = totalPages(total, 6);
  return Array.from({ length: Math.max(0, maxPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

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
