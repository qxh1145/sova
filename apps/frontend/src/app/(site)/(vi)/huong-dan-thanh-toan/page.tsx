import '@/styles/legacy/sections/route-huong-dan-thanh-toan.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPaymentGuide } from '@/lib/queries/pages';
import { PaymentGuideView } from '@/components/legal/PaymentGuideView';

export async function generateMetadata(): Promise<Metadata> {
  const guide = await getPaymentGuide('vi');
  if (!guide) return {};
  return {
    title: guide.seo.title,
    description: guide.seo.description,
  };
}

export default async function HuongDanThanhToanPage() {
  const guide = await getPaymentGuide('vi');
  if (!guide) {
    notFound();
  }

  return <PaymentGuideView guide={guide} />;
}
