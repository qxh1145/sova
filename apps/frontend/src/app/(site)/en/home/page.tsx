import type { Metadata } from 'next';
import '@/styles/legacy/sections/route-en--home.css';
import { getHomeAssets, getHomePage } from '@/lib/queries/pages';
import { seoMetadata } from '@/lib/queries/site';
import { HomeView } from '@/components/home/HomeView';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomePage('en');
  if (!content) return {};
  return seoMetadata(content.seo);
}

export default async function EnHomePage() {
  const content = await getHomePage('en');
  const homeAssets = await getHomeAssets(content);

  return <HomeView content={content} locale="en" {...homeAssets} />;
}
