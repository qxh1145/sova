import '@/styles/legacy/sections/route-en--insight.css';
import { notFound } from 'next/navigation';
import { getBlogListingPage } from '@/lib/queries/posts';
import { BlogListView } from '@/components/blog/BlogListView';

export default async function EnInsightPage() {
  const data = await getBlogListingPage({
    routeId: 'route-en--insight',
    page: 1,
    locale: 'en',
  });

  if (!data) {
    notFound();
  }

  return <BlogListView {...data} />;
}
