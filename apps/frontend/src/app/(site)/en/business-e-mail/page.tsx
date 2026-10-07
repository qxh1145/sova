import '@/styles/legacy/sections/route-en--business-e-mail.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServiceAssets, getServicePage } from '@/lib/queries/services';
import { EmailServiceView } from '@/components/services/EmailServiceView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getServicePage('email', 'en');
  if (!page) return {};
  return {
    title: page.service.seo.title,
    description: page.service.seo.description,
  };
}

export default async function EnEmailServicePage() {
  const page = await getServicePage('email', 'en');
  if (!page) {
    notFound();
  }

  const assets = await getServiceAssets(page);

  return <EmailServiceView page={page} assets={assets} locale="en" />;
}
