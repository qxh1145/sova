import '@/styles/legacy/sections/route-goc-nhin.css';
import { getBlogListingPage } from '@/lib/queries/posts';
import { BlogListView } from '@/components/blog/BlogListView';

export default async function ViBlogListingPage() {
  const data = await getBlogListingPage(1);
  return <BlogListView {...data} />;
}
