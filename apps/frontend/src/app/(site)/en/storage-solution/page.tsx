import '@/styles/legacy/sections/route-en--storage-solution.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { listRoutes, seoMetadata } from '@/lib/queries/site';
import { StorageServiceView } from '@/components/services/StorageServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('storage', 'en');
  if (!page) return {};
  return seoMetadata(page.service.seo);
}

export default async function EnStorageServicePage() {
  const [page, routes] = await Promise.all([getServicePage('storage', 'en'), listRoutes()]);

  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return <StorageServiceView page={page} assets={assets} routes={routes} locale="en" />;
}
