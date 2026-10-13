import '@/styles/legacy/sections/route-en--business-hosting.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { seoMetadata } from "@/lib/queries/site";
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { HostingServiceView } from '@/components/services/HostingServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('hosting', 'en');
  if (!page) return {};
  return seoMetadata(page.service.seo);
}

export default async function EnHostingServicePage() {
  const page = await getServicePage('hosting', 'en');
  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return <HostingServiceView page={page} assets={assets} locale="en" />;
}
