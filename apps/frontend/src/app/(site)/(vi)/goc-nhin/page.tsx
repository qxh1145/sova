import type { Metadata } from 'next';
import '@/styles/legacy/sections/route-goc-nhin.css';
import { notFound } from 'next/navigation';
import { BRAND_TITLE_SUFFIX, routeAlternates } from '@/lib/queries/site';
import { getBlogListingPage } from '@/lib/queries/posts';
import { BlogListView } from '@/components/blog/BlogListView';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getBlogListingPage();
  if (!data) return {};
  const title = `${data.settings?.heading.title ?? data.copy.title}${BRAND_TITLE_SUFFIX}`;
  const alternates = await routeAlternates('/goc-nhin/');
  return {
    title,
    alternates,
  };
}

export default async function ViBlogListingPage() {
  const data = await getBlogListingPage();
  if (!data) {
    notFound();
  }
  return <BlogListView {...data} />;
}
