import type { Metadata } from 'next';
import '@/styles/legacy/sections/route-goc-nhin.css';
import { notFound } from 'next/navigation';
import { parsePageParam, totalPages } from '@/lib/routes';
import { BRAND_TITLE_SUFFIX, routeAlternates } from '@/lib/queries/site';
import { getBlogListingPage } from '@/lib/queries/posts';
import { getRepository } from '@/lib/repositories';
import { BlogListView } from '@/components/blog/BlogListView';

export async function generateStaticParams() {
  const repo = getRepository();
  const categories = await repo.getPostCategories('vi');
  const params: { slug: string; page: string }[] = [];
  for (const cat of categories) {
    const { total } = await repo.listPosts({
      locale: 'vi',
      category: cat.slug,
      page: 1,
      pageSize: 6,
    });
    const maxPages = totalPages(total, 6);
    for (let p = 2; p <= maxPages; p++) {
      params.push({ slug: cat.slug, page: String(p) });
    }
  }
  return params;
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
