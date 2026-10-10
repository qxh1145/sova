import '@/styles/legacy/sections/route-en--warranty-policy.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLegalPage } from '@/lib/queries/pages';
import { LegalView } from '@/components/legal/LegalView';

const PATH = '/en/warranty-policy/';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage(PATH, 'en');
  if (!page) return {};
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default async function EnWarrantyPolicyPage() {
  const page = await getLegalPage(PATH, 'en');
  if (!page) {
    notFound();
  }

  return <LegalView page={page} />;
}
