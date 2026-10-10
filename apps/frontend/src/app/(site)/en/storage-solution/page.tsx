import '@/styles/legacy/sections/route-en--storage-solution.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { listRoutes } from '@/lib/queries/site';
import { StorageServiceView } from '@/components/services/StorageServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('storage', 'en');
  if (!page) return {};
  return {
    title: page.service.seo.title,
    description: page.service.seo.description,
  };
}

export default async function EnStorageServicePage() {
  const [page, routes] = await Promise.all([
    getServicePage('storage', 'en'),
    listRoutes(),
  ]);

  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return (
    <StorageServiceView
      page={page}
      assets={assets}
      routes={routes}
      locale="en"
    />
  );
}
