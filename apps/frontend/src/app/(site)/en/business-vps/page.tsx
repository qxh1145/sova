import '@/styles/legacy/sections/route-en--business-vps.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { seoMetadata } from '@/lib/queries/site';
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { VpsServiceView } from '@/components/services/VpsServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('vps', 'en');
  if (!page) return {};
  return seoMetadata(page.service.seo);
}

export default async function EnVpsServicePage() {
  const page = await getServicePage('vps', 'en');
  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return <VpsServiceView page={page} assets={assets} locale="en" />;
}
