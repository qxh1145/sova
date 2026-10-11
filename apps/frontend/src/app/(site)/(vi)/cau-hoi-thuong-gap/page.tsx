import '@/styles/legacy/sections/route-cau-hoi-thuong-gap.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getFAQPage } from '@/lib/queries/pages';
import { getFAQTopics, getPlacedFAQs } from '@/lib/queries/faq';
import { FAQTopicsView } from '@/components/faq/FAQTopicsView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getFAQPage('vi');
  if (!page) return {};
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default async function CauHoiThuongGapPage() {
  const page = await getFAQPage('vi');
  if (!page) {
    notFound();
  }

  const topics = await getFAQTopics('vi');
  const topicItems = await Promise.all(
    topics.map(async (topic) => ({
      topic,
      faqs: await getPlacedFAQs(topic.items, 'vi'),
    })),
  );

  return <FAQTopicsView page={page} topics={topicItems} />;
}
