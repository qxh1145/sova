import type { Metadata } from 'next';
import '@/styles/legacy/sections/route-root.css';
import { getHomeAssets, getHomePage } from '@/lib/queries/pages';
import { seoMetadata } from '@/lib/queries/site';
import { HomeView } from '@/components/home/HomeView';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomePage('vi');
  if (!content) return {};
  return seoMetadata(content.seo);
}

export default async function ViHomePage() {
  const content = await getHomePage('vi');
  const homeAssets = await getHomeAssets(content);

  return (
    <HomeView
      content={content}
      locale="vi"
      {...homeAssets}
    />
  );
}
