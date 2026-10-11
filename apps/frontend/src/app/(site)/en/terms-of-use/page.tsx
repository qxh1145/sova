import '@/styles/legacy/sections/route-en--terms-of-use.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLegalPage } from '@/lib/queries/pages';
import { LegalView } from '@/components/legal/LegalView';

const PATH = '/en/terms-of-use/';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage(PATH, 'en');
  if (!page) return {};
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default async function EnTermsOfUsePage() {
  const page = await getLegalPage(PATH, 'en');
  if (!page) {
    notFound();
  }

  return <LegalView page={page} />;
}
