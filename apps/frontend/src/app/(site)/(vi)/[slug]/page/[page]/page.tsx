import '@/styles/legacy/sections/route-goc-nhin.css';
import { notFound } from 'next/navigation';
import { categorySlugs } from '@/lib/routes';
import { listRoutes } from '@/lib/queries/site';
import { getBlogListingPage } from '@/lib/queries/posts';
import { BlogListView } from '@/components/blog/BlogListView';

export async function generateStaticParams() {
  const routes = await listRoutes();
  const catSlugs = new Set(categorySlugs(routes));

  return routes
    .filter((r) => {
      if (r.locale !== 'vi' || r.kind !== 'post-list') return false;
      const parts = r.path.split('/').filter(Boolean); // ['thu-thuat', 'page', '2']
      return parts.length === 3 && parts[1] === 'page' && catSlugs.has(parts[0]);
    })
    .map((r) => {
      const parts = r.path.split('/').filter(Boolean);
      return {
        slug: parts[0],
        page: parts[2],
      };
    });
}

interface ViCategoryPagedPageProps {
  params: Promise<{ slug: string; page: string }>;
}

export default async function ViCategoryPagedPage({ params }: ViCategoryPagedPageProps) {
  const { slug, page: pageStr } = await params;
  if (!/^[1-9]\d*$/.test(pageStr)) {
    notFound();
  }
  const pageNum = parseInt(pageStr, 10);
  if (pageNum < 2) {
    notFound();
  }

  const routes = await listRoutes();
  const catSlugs = new Set(categorySlugs(routes));
  if (!catSlugs.has(slug)) {
    notFound();
  }

  const targetPath = `/${slug}/page/${pageNum}/`;
  const routeEntry = routes.find((r) => r.locale === 'vi' && r.path === targetPath);

  if (!routeEntry) {
    notFound();
  }

  const data = await getBlogListingPage({
    routeId: routeEntry.id,
    category: slug,
    page: pageNum,
    locale: 'vi',
  });

  if (!data) {
    notFound();
  }

  return <BlogListView {...data} />;
}
