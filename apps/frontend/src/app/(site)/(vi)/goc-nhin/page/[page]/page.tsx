import '@/styles/legacy/sections/route-goc-nhin.css';
import { notFound } from 'next/navigation';
import { listRoutes } from '@/lib/queries/site';
import { getBlogListingPage } from '@/lib/queries/posts';
import { BlogListView } from '@/components/blog/BlogListView';

export async function generateStaticParams() {
  const routes = await listRoutes();
  return routes
    .filter((r) => r.locale === 'vi' && r.kind === 'post-list' && r.path.startsWith('/goc-nhin/page/'))
    .map((r) => {
      const match = r.path.match(/^\/goc-nhin\/page\/(\d+)\/$/);
      return { page: match ? match[1] : '' };
    })
    .filter((p) => Boolean(p.page));
}

interface GocNhinPagedProps {
  params: Promise<{ page: string }>;
}

export default async function ViGocNhinPagedPage({ params }: GocNhinPagedProps) {
  const { page: pageStr } = await params;
  if (!/^\d+$/.test(pageStr)) {
    notFound();
  }
  const pageNum = parseInt(pageStr, 10);
  if (pageNum < 2) {
    notFound();
  }

  const routes = await listRoutes();
  const targetPath = `/goc-nhin/page/${pageNum}/`;
  const routeEntry = routes.find((r) => r.locale === 'vi' && r.path === targetPath);

  if (!routeEntry) {
    notFound();
  }

  const data = await getBlogListingPage({
    routeId: routeEntry.id,
    page: pageNum,
    locale: 'vi',
  });

  if (!data) {
    notFound();
  }

  return <BlogListView {...data} />;
}
