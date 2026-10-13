import '@/styles/legacy/sections/route-en--ui-ux-branding-design-2.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { seoMetadata } from "@/lib/queries/site";
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { BrandingServiceView } from '@/components/services/BrandingServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('branding', 'en');
  if (!page) return {};
  return seoMetadata(page.service.seo);
}

export default async function EnBrandingServicePage() {
  const page = await getServicePage('branding', 'en');
  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return <BrandingServiceView page={page} assets={assets} locale="en" />;
}
