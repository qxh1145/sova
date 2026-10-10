import '@/styles/legacy/sections/route-chinh-sach-hoan-tien.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLegalPage } from '@/lib/queries/pages';
import { LegalView } from '@/components/legal/LegalView';

const PATH = '/chinh-sach-hoan-tien/';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage(PATH, 'vi');
  if (!page) return {};
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default async function ChinhSachHoanTienPage() {
  const page = await getLegalPage(PATH, 'vi');
  if (!page) {
    notFound();
  }

  return <LegalView page={page} />;
}
