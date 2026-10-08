import '@/styles/legacy/sections/route-goc-nhin.css';
import { notFound } from 'next/navigation';
import { listRoutes } from '@/lib/queries/site';
import { getBlogListingPage } from '@/lib/queries/posts';
import { parsePageParam, pathSegments } from '@/lib/routes';
import { BlogListView } from '@/components/blog/BlogListView';

export async function generateStaticParams() {
  const routes = await listRoutes();
  return routes
    .filter((r) => r.locale === 'vi' && r.kind === 'post-list' && r.path.startsWith('/goc-nhin/page/'))
    .map((r) => {
      const parts = pathSegments(r.path);
      return { page: parts[2] ?? '' };
    })
    .filter((p) => Boolean(p.page));
}

interface GocNhinPagedProps {
  params: Promise<{ page: string }>;
}

export default async function ViGocNhinPagedPage({ params }: GocNhinPagedProps) {
  const { page: pageStr } = await params;
  const pageNum = parsePageParam(pageStr);
  if (pageNum === null) {
    notFound();
  }

  const data = await getBlogListingPage({
    page: pageNum,
    locale: 'vi',
  });

  if (!data) {
    notFound();
  }

  return <BlogListView {...data} />;
}
