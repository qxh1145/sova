import '@/styles/legacy/sections/route-vps-doanh-nghiep.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { VpsServiceView } from '@/components/services/VpsServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('vps', 'vi');
  if (!page) return {};
  return {
    title: page.service.seo.title,
    description: page.service.seo.description,
  };
}

export default async function ViVpsServicePage() {
  const page = await getServicePage('vps', 'vi');
  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return <VpsServiceView page={page} assets={assets} locale="vi" />;
}
