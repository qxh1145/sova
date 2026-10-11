import '@/styles/legacy/sections/route-eras-xin-chan-thanh-cam-on-quy-khach.css'; // business-text-ok: route CSS import
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getUtilityContent } from '@/lib/queries/pages';
import { getShellContent } from '@/lib/queries/site';
import { ThankYouView } from '@/components/utility/ThankYouView';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getUtilityContent('thank-you-vi');
  if (!content?.seo) return {};
  return {
    title: content.seo.title,
    description: content.seo.description,
  };
}

interface ThankYouPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const content = await getUtilityContent('thank-you-vi');
  if (!content) {
    notFound();
  }

  const params = await searchParams;
  let demoLabel: string | undefined;
  if (params?.demo === '1') {
    const shell = await getShellContent('vi');
    demoLabel = shell.consult.demoBadge;
  }

  return <ThankYouView content={content} demoLabel={demoLabel} />;
}
