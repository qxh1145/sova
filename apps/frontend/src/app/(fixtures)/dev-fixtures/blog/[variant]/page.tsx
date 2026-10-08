import Link from 'next/link';
import { notFound } from 'next/navigation';
import '@/styles/legacy/sections/route-goc-nhin.css';
import { SiteShell } from '@/components/layout/SiteShell';
import { ArticleHeroImage } from '@/app/(site)/(vi)/[slug]/_components/ArticleHeroImage';
import { PostMeta } from '@/app/(site)/(vi)/[slug]/_components/PostMeta';
import { ArticleBody } from '@/app/(site)/(vi)/[slug]/_components/ArticleBody';
import { RelatedPosts } from '@/app/(site)/(vi)/[slug]/_components/RelatedPosts';
import { getShellProps } from '@/lib/queries/site';
import { getBlogSearchPage, getPostDetail } from '@/lib/queries/posts';
import { createScenarioRepository } from '@/dev/scenarios';
import type { Locale } from '@/types/content';

import { createMockRepository } from '@/lib/repositories/mock';
import { fixtures } from '@/dev/fixtures';
import { BlogListView } from '@/components/blog/BlogListView';
import type { Post } from '@/types/content';

export const dynamic = 'force-dynamic';

const VALID_VARIANTS = new Set(['happy-path', 'missing-media', 'error', 'search']);

export default async function DevFixtureBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams?: Promise<{ locale?: string; s?: string; page?: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;
  if (!VALID_VARIANTS.has(variant)) {
    notFound();
  }

  const { locale: rawLocale, s: query = 'Fixture', page: pageStr } = (await searchParams) ?? {};
  const locale: Locale = rawLocale === 'en' ? 'en' : 'vi';

  if (variant === 'search') {
    const draftPost: Post = {
      id: 'post-draft-fixture',
      locale: 'vi',
      path: '/draft-fixture-post',
      slug: 'draft-fixture-post',
      title: 'Fixture Draft Post Title',
      sources: [{ file: 'fixture', line: 1 }],
      seo: { title: 'Fixture Draft', canonicalPath: '/draft-fixture-post' },
      categoryIds: [],
      thumbnailId: 'asset-1',
      excerpt: 'Fixture Draft excerpt',
      body: {
        format: 'sanitized-html',
        html: '<p>Fixture draft body</p>',
        assetIds: [],
        sources: [{ file: 'fixture', line: 1 }],
      },
      author: { id: 'author-1', name: 'Fixture' },
      relatedPostIds: [],
      editorial: { status: 'draft', updatedAt: '2026-10-08', revision: 1 },
    };

    const repo = createMockRepository({
      ...fixtures,
      posts: [...fixtures.posts, draftPost],
    });

    const pageNum = pageStr && /^[1-9]\d*$/.test(pageStr) ? parseInt(pageStr, 10) : 1;
    const [shell, searchData] = await Promise.all([
      getShellProps(locale, repo),
      getBlogSearchPage({ query, page: pageNum }, repo),
    ]);

    if (!searchData) {
      notFound();
    }

    return (
      <SiteShell {...shell}>
        <BlogListView {...searchData} />
      </SiteShell>
    );
  }

  if (variant === 'error') {
    await getPostDetail('fixture-post', createScenarioRepository('error'));
  }

  const repo = createScenarioRepository(variant);
  const [shell, detail] = await Promise.all([
    getShellProps(locale, repo),
    getPostDetail('fixture-post', repo),
  ]);

  if (!detail) {
    notFound();
  }

  const { post, featuredAsset, related, copy } = detail;

  return (
    <SiteShell {...shell}>
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
              <RelatedPosts related={related} title={copy.relatedTitle} />
            </div>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
