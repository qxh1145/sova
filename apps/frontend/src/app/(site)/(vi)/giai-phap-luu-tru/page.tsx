import '@/styles/legacy/sections/route-giai-phap-luu-tru.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { seoMetadata } from "@/lib/queries/site";
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { listRoutes } from '@/lib/queries/site';
import { StorageServiceView } from '@/components/services/StorageServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('storage', 'vi');
  if (!page) return {};
  return seoMetadata(page.service.seo);
}

export default async function ViStorageServicePage() {
  const [page, routes] = await Promise.all([
    getServicePage('storage', 'vi'),
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
      locale="vi"
    />
  );
}
