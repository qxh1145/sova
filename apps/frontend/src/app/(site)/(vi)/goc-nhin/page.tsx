import '@/styles/legacy/sections/route-goc-nhin.css';
import { notFound } from 'next/navigation';
import { getBlogListingPage } from '@/lib/queries/posts';
import { BlogListView } from '@/components/blog/BlogListView';

export default async function ViBlogListingPage() {
  const data = await getBlogListingPage(1);
  if (!data) {
    notFound();
  }
  return <BlogListView {...data} />;
}

