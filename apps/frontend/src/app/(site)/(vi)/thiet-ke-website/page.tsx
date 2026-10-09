import '@/styles/legacy/sections/route-thiet-ke-website.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { WebsiteServiceView } from '@/components/services/WebsiteServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('website', 'vi');
  if (!page) return {};
  return {
    title: page.service.seo.title,
    description: page.service.seo.description,
  };
}

export default async function ViWebsiteServicePage() {
  const page = await getServicePage('website', 'vi');
  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return <WebsiteServiceView page={page} assets={assets} locale="vi" />;
}
