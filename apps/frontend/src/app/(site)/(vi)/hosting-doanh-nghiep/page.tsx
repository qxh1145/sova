import '@/styles/legacy/sections/route-hosting-doanh-nghiep.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { HostingServiceView } from '@/components/services/HostingServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('hosting', 'vi');
  if (!page) return {};
  return {
    title: page.service.seo.title,
    description: page.service.seo.description,
  };
}

export default async function ViHostingServicePage() {
  const page = await getServicePage('hosting', 'vi');
  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return <HostingServiceView page={page} assets={assets} locale="vi" />;
}
