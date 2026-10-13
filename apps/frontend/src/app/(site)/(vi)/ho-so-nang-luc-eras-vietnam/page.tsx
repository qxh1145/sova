import { seoMetadata } from '@/lib/queries/site';
import '@/styles/legacy/sections/route-ho-so-nang-luc-eras-vietnam.css'; // business-text-ok: route CSS import
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProfile } from '@/lib/queries/pages';
import { ProfileView } from '@/components/utility/ProfileView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getProfile('vi');
  if (!page) return {};
  return seoMetadata(page.seo);
}

export default async function HoSoNangLucPage() {
  const page = await getProfile('vi');
  if (!page) {
    notFound();
  }

  return <ProfileView page={page} />;
}
