import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { LatestPosts } from './LatestPosts';
import type { AssetRef, Post, SectionCopy } from '@/types/content';

describe('LatestPosts component', () => {
  const mockCopy: SectionCopy = {
    eyebrow: 'GÓC NHÌN',
    title: 'Theo dõi tin tức mới nhất',
    description: 'Khám phá thêm →',
  };

  const createPost = (id: string, path: `/${string}`, title: string, thumbnailId?: string): Post => ({
    id,
    locale: 'vi',
    path,
    slug: path.replace(/^\/|\/$/g, ''),
    title,
    categoryIds: [],
    excerpt: '',
    body: { format: 'sanitized-html', html: '', assetIds: [], sources: [] },
    thumbnailId,
    author: { id: 'author-1', name: 'Author' },
    relatedPostIds: [],
    editorial: { status: 'published', updatedAt: '2023-10-01', revision: 1 },
    seo: { title, canonicalPath: path },
    sources: [],
  });

  const mockAssets: AssetRef[] = [
    {
      id: 'asset-1',
      src: '/wp-content/uploads/2023/10/ERAS-THUMB-WEBSITE-1.webp',
      alt: '',
      width: 960,
      height: 540,
      kind: 'image',
      status: 'local',
      sources: [],
    },
    {
      id: 'asset-missing',
      src: '/wp-content/uploads/2023/10/missing.webp',
      alt: '',
      width: 960,
      height: 540,
      kind: 'image',
      status: 'missing',
      sources: [],
    },
  ];

  it('renders posts in placement order in both desktop grid and mobile slider', () => {
    const posts: Post[] = [
      createPost('post-1', '/bai-viet-1/', 'Bài viết 1', 'asset-1'),
      createPost('post-2', '/bai-viet-2/', 'Bài viết 2'),
      createPost('post-3', '/bai-viet-3/', 'Bài viết 3'),
    ];

    const html = renderToStaticMarkup(
      <LatestPosts posts={posts} copy={mockCopy} assets={mockAssets} />,
    );
    const root = parse(html);

    expect(root.querySelector('#section_549960105')).not.toBeNull();
    const gridCards = root.querySelectorAll('#text-386464690 .post .post-item-cus');
    expect(gridCards).toHaveLength(3);

    const sliderCards = root.querySelectorAll('#text-1494522260 .slider-wrapper .post-item-cus');
    expect(sliderCards).toHaveLength(3);

    const gridLinks = root.querySelectorAll('#text-386464690 .post a.plain');
    expect(gridLinks.map((a) => a.getAttribute('href')?.replace(/\/$/, ''))).toEqual([
      '/bai-viet-1',
      '/bai-viet-2',
      '/bai-viet-3',
    ]);

    const gridImgs = root.querySelectorAll('#text-386464690 img.wp-post-image');
    expect(gridImgs).toHaveLength(1);
    const img = gridImgs[0];
    expect(img.getAttribute('src')).toBe(mockAssets[0].src);
    expect(img.getAttribute('width')).toBe('960');
    expect(img.getAttribute('height')).toBe('540');
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
    expect(img.classList.contains('attachment-post-thumbnail')).toBe(true);
    expect(img.classList.contains('size-post-thumbnail')).toBe(true);
    expect(root.querySelectorAll('#text-1494522260 img.wp-post-image')).toHaveLength(1);
  });

  it('renders heading column: eyebrow, title lines, divider and view-all link', () => {
    const posts: Post[] = [createPost('post-1', '/bai-viet-1/', 'Bài viết 1')];
    const root = parse(
      renderToStaticMarkup(
        <LatestPosts
          posts={posts}
          copy={{ ...mockCopy, titleLines: ['Theo dõi', 'tin tức mới nhất'] }}
        />,
      ),
    );

    expect(root.querySelector('#text-2718069597 h4 strong')?.text).toBe('GÓC NHÌN');
    const h2 = root.querySelector('#text-2917652779 h2');
    expect(h2?.innerHTML).toBe('Theo dõi<br>tin tức mới nhất');
    expect(root.querySelector('#col-1323995894 .is-divider.divider')).not.toBeNull();
    const link = root.querySelector('#text-578526168 a.but-lh');
    expect(link?.getAttribute('href')?.replace(/\/$/, '')).toBe('/goc-nhin');
    expect(link?.text).toBe('Khám phá thêm →');
  });

  it('dedupes posts by path, keeping the first occurrence and preserving order', () => {
    const posts: Post[] = [
      createPost('post-1', '/bai-viet-1/', 'Bài viết 1'),
      createPost('post-dup', '/bai-viet-1/', 'Bài viết trùng lặp'),
      createPost('post-2', '/bai-viet-2/', 'Bài viết 2'),
    ];

    const html = renderToStaticMarkup(<LatestPosts posts={posts} copy={mockCopy} />);
    const root = parse(html);

    const gridCards = root.querySelectorAll('#text-386464690 .post .post-item-cus');
    expect(gridCards).toHaveLength(2);
    expect(html).toContain('Bài viết 1');
    expect(html).not.toContain('Bài viết trùng lặp');
    expect(html).toContain('Bài viết 2');
  });

  it('renders null when posts array is empty', () => {
    const html = renderToStaticMarkup(<LatestPosts posts={[]} copy={mockCopy} />);
    expect(html).toBe('');
  });

  it('handles missing media fallback: keeps .image-cover, title and link, omits img', () => {
    const posts: Post[] = [
      createPost('post-missing-status', '/bai-viet-missing/', 'Missing Status Post', 'asset-missing'),
      createPost('post-no-asset', '/bai-viet-no-asset/', 'No Asset Post', 'asset-not-found'),
      createPost('post-no-thumb', '/bai-viet-no-thumb/', 'No Thumbnail ID Post'),
    ];

    const html = renderToStaticMarkup(
      <LatestPosts posts={posts} copy={mockCopy} assets={mockAssets} />,
    );
    const root = parse(html);

    const gridCards = root.querySelectorAll('#text-386464690 .post .post-item-cus');
    expect(gridCards).toHaveLength(3);

    const imgs = root.querySelectorAll('#text-386464690 img');
    expect(imgs).toHaveLength(0);

    const covers = root.querySelectorAll('#text-386464690 .image-cover');
    expect(covers).toHaveLength(3);

    expect(html).toContain('Missing Status Post');
    expect(html).toContain('No Asset Post');
    expect(html).toContain('No Thumbnail ID Post');
  });
});
