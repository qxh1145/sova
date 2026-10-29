import type { Metadata } from 'next';
import '@/styles/legacy/sections/route-en--insight.css';
import { notFound } from 'next/navigation';
import { BRAND_TITLE_SUFFIX_EN, routeAlternates } from '@/lib/queries/site';
import { getBlogListingPage } from '@/lib/queries/posts';
import { BlogListView } from '@/components/blog/BlogListView';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getBlogListingPage({
    routeId: 'route-en--insight',
    page: 1,
    locale: 'en',
  });
  if (!data) return {};

  const title = `${data.settings?.heading.title ?? data.copy.title}${BRAND_TITLE_SUFFIX_EN}`;
  const alternates = await routeAlternates('/en/insight/');
  return {
    title,
    alternates,
  };
}

export default async function EnInsightPage() {
  const data = await getBlogListingPage({
    routeId: 'route-en--insight',
    page: 1,
    locale: 'en',
  });

  if (!data) {
    notFound();
  }

  return <BlogListView {...data} />;
}
