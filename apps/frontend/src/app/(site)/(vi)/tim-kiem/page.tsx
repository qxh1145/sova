import '@/styles/legacy/sections/route-goc-nhin.css';
import { notFound } from 'next/navigation';
import { getBlogSearchPage } from '@/lib/queries/posts';
import { BlogListView } from '@/components/blog/BlogListView';

interface SearchPageProps {
  searchParams: Promise<{ s?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { s, page: pageStr } = await searchParams;
  if (s === undefined) {
    notFound();
  }

  let pageNum = 1;
  if (pageStr !== undefined) {
    if (!/^[1-9]\d*$/.test(pageStr)) {
      notFound();
    }
    pageNum = parseInt(pageStr, 10);
  }

  const data = await getBlogSearchPage({
    query: s,
    page: pageNum,
  });

  if (!data) {
    notFound();
  }

  return <BlogListView {...data} />;
}
