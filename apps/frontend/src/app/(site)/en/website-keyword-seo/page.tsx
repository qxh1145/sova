import '@/styles/legacy/sections/route-en--website-keyword-seo.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { SeoServiceView } from '@/components/services/SeoServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('seo', 'en');
  if (!page) return {};
  return {
    title: page.service.seo.title,
    description: page.service.seo.description,
  };
}

export default async function EnSeoServicePage() {
  const page = await getServicePage('seo', 'en');
  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return <SeoServiceView page={page} assets={assets} locale="en" />;
}
