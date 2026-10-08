import '@/styles/legacy/sections/route-goc-nhin.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categorySlugs } from '@/lib/routes';
import { listRoutes } from '@/lib/queries/site';
import { getBlogListingPage, getPostDetail } from '@/lib/queries/posts';
import { BlogListView } from '@/components/blog/BlogListView';
import { ArticleHeroImage } from './_components/ArticleHeroImage';
import { PostMeta } from './_components/PostMeta';
import { ArticleBody } from './_components/ArticleBody';

export async function generateStaticParams() {
  const routes = await listRoutes();
  const catSlugs = new Set(categorySlugs(routes));
  return routes
    .filter(
      (r) =>
        r.locale === 'vi' &&
        (r.kind === 'post-detail' ||
          (r.kind === 'post-list' && catSlugs.has(r.path.slice(1, -1)))),
    )
    .map((r) => ({
      slug: r.path.replace(/^\/|\/$/g, ''),
    }));
}

interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ViPostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;
  const routes = await listRoutes();
  const targetPath = `/${slug}/`;
  const routeEntry = routes.find((r) => r.locale === 'vi' && r.path === targetPath);

  if (!routeEntry) {
    notFound();
  }

  if (routeEntry.kind === 'post-detail') {
    const detail = await getPostDetail(slug);
    if (!detail) {
      notFound();
    }

    const { post, featuredAsset, copy } = detail;

    return (
      <main id="main">
        <div
          className="cs-page_heading cs-style1 cs-center text-center cs-bg"
          style={{
            backgroundImage: `url("${copy.headingBackgroundImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            position: 'relative',
          }}
        >
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div className="cs-page_heading_in">
              <h1 className="cs-page_title cs-font_50 cs-white_color">{post.title}</h1>
            </div>
            <p style={{ textAlign: 'center' }}>
              <span style={{ color: '#808080' }}>
                <Link href="/" style={{ color: '#808080', textDecoration: 'none' }}>
                  {copy.breadcrumbHome}
                </Link>
                {' | '}
                <Link href="/goc-nhin/" style={{ color: '#808080', textDecoration: 'none' }}>
                  {copy.breadcrumbBlog}
                </Link>
                {' | '}
                <span style={{ color: '#ffffff' }}>{copy.breadcrumbCurrent}</span>
              </span>
            </p>
          </div>
        </div>

        <div id="content" className="blog-wrapper blog-single page-wrapper">
          <div className="row">
            <div className="col large-12">
              <ArticleHeroImage image={featuredAsset} />
              <PostMeta author={post.author?.name} date={post.displayDate} />
              <ArticleBody body={post.body} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const catSlugs = new Set(categorySlugs(routes));
  if (routeEntry.kind === 'post-list' && catSlugs.has(slug)) {
    const data = await getBlogListingPage({
      routeId: routeEntry.id,
      category: slug,
      page: 1,
      locale: 'vi',
    });
    if (!data) {
      notFound();
    }
    return <BlogListView {...data} />;
  }

  notFound();
}
