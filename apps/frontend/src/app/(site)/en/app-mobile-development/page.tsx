import '@/styles/legacy/sections/route-en--app-mobile-development.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { MobileServiceView } from '@/components/services/MobileServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('mobile', 'en');
  if (!page) return {};
  return {
    title: page.service.seo.title,
    description: page.service.seo.description,
  };
}

export default async function EnMobileServicePage() {
  const page = await getServicePage('mobile', 'en');
  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return <MobileServiceView page={page} assets={assets} locale="en" />;
}
