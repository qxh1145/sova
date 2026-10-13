import '@/styles/legacy/sections/route-en--app-mobile-development.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { seoMetadata } from '@/lib/queries/site';
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { MobileServiceView } from '@/components/services/MobileServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('mobile', 'en');
  if (!page) return {};
  return seoMetadata(page.service.seo);
}

export default async function EnMobileServicePage() {
  const page = await getServicePage('mobile', 'en');
  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return <MobileServiceView page={page} assets={assets} locale="en" />;
}
