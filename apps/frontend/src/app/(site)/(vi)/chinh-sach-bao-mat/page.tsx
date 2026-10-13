import '@/styles/legacy/sections/route-chinh-sach-bao-mat.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { seoMetadata } from "@/lib/queries/site";
import { getLegalPage } from '@/lib/queries/pages';
import { LegalView } from '@/components/legal/LegalView';

const PATH = '/chinh-sach-bao-mat/';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage(PATH, 'vi');
  if (!page) return {};
  return seoMetadata(page.seo);
}

export default async function ChinhSachBaoMatPage() {
  const page = await getLegalPage(PATH, 'vi');
  if (!page) {
    notFound();
  }

  return <LegalView page={page} />;
}
