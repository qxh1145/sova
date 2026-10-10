import '@/styles/legacy/sections/route-gioi-thieu.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAboutAssets, getAboutPage } from '@/lib/queries/pages';
import { AboutView } from '@/components/about/AboutView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAboutPage('vi');
  if (!page) return {};
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default async function ViAboutPage() {
  const page = await getAboutPage('vi');
  if (!page) {
    notFound();
  }

  const assets = await getAboutAssets(page);

  return <AboutView page={page} assets={assets} locale="vi" />;
}
