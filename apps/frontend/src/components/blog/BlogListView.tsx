import Link from 'next/link';
import { PostCard } from './PostCard';
import { BlogSidebar } from './BlogSidebar';
import { Pagination } from '@/components/ui/Pagination';
import type { BlogListingPageData } from '@/lib/queries/posts';

export function BlogListView({
  posts,
  thumbnailAssets,
  page,
  totalPages,
  settings,
  categories,
  basePath,
  copy,
  searchQuery,
}: BlogListingPageData) {
  const assetMap = new Map(thumbnailAssets.map((asset) => [asset.id, asset]));
  const isSearch = searchQuery !== undefined;
  const heroH1 = isSearch
    ? `${copy.searchResultsTitle}${searchQuery.trim()}`
    : settings?.hero?.headingLines?.[0] || copy.title;
  const isCategory = !isSearch && basePath !== '/goc-nhin/' && basePath !== '/en/insight/';
  const categoryTitle = isCategory ? settings?.heading?.title : undefined;
  const homeHref = basePath.startsWith('/en/') ? '/en/home/' : '/';

  const hrefForPage = (p: number) => {
    if (isSearch) {
      const encQ = encodeURIComponent(searchQuery);
      return p === 1 ? `/?s=${encQ}` : `/page/${p}/?s=${encQ}`;
    }
    return p === 1 ? basePath : `${basePath}page/${p}/`;
  };

  return (
    <main id="main">
      <section className="section" id="section_1769897078">
        <div className="bg section-bg fill bg-fill bg-loaded" />
        <div className="section-content relative">
          <h1 style={{ textAlign: 'center', fontSize: '49px' }}>
            <span style={{ color: '#ffffff' }}>{heroH1}</span>
          </h1>
          <p style={{ textAlign: 'center' }}>
            <Link href={homeHref} style={{ color: '#808080', textDecoration: 'none' }}>
              {copy.breadcrumbHome}
            </Link>
            {'\u00a0\u00a0'}
            <span
              style={{
                color: '#ffffff',
                borderLeft: '1px solid #fff',
                paddingLeft: '5px',
              }}
            >
              {copy.breadcrumbBlog}
            </span>
          </p>
        </div>
      </section>

      <div
        id="post-list"
        className="row row-large"
        style={{
          marginTop: '30px',
          marginBottom: '30px',
          padding: '20px 10px 0 10px',
          borderRadius: '8px',
        }}
      >
        <div className="large-8 col small-col-first">
          {categoryTitle && <h2 className="category-title">{categoryTitle}</h2>}
          {posts.length === 0 && isSearch ? (
            <p>{copy.searchNoResults}</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                variant="list"
                thumbnailAsset={post.thumbnailId ? assetMap.get(post.thumbnailId) : undefined}
                readMoreLabel={copy.readMore}
              />
            ))
          )}
          {posts.length > 0 && (
            <Pagination
              current={page}
              total={totalPages}
              labels={copy.pagination}
              hrefForPage={hrefForPage}
            />
          )}
        </div>
        <div className="large-4 col">
          <BlogSidebar categories={categories} copy={copy} searchQuery={searchQuery} />
        </div>
      </div>
    </main>
  );
}
