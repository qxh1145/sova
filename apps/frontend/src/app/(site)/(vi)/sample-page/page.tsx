import '@/styles/legacy/sections/route-sample-page.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getUtilityContent } from '@/lib/queries/pages';
import { RichText } from '@/components/ui/RichText';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getUtilityContent('sample-vi');
  if (!content?.seo) return {};
  return {
    title: content.seo.title,
    description: content.seo.description,
  };
}

export default async function SamplePage() {
  const content = await getUtilityContent('sample-vi');
  if (!content) {
    notFound();
  }

  return (
    <div id="content" role="main">
      <RichText content={content.body} />
    </div>
  );
}
