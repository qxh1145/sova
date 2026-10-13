import '@/styles/legacy/sections/route-en--refund-policy.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { seoMetadata } from '@/lib/queries/site';
import { getLegalPage } from '@/lib/queries/pages';
import { LegalView } from '@/components/legal/LegalView';

const PATH = '/en/refund-policy/';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage(PATH, 'en');
  if (!page) return {};
  return seoMetadata(page.seo);
}

export default async function EnRefundPolicyPage() {
  const page = await getLegalPage(PATH, 'en');
  if (!page) {
    notFound();
  }

  return <LegalView page={page} />;
}
