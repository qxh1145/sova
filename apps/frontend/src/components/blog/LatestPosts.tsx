import { Fragment } from 'react';
import Link from 'next/link';
import type { AssetRef, Post, SectionCopy } from '@/types/content';
import { Carousel, type CarouselLabels } from '@/components/ui/Carousel';
import { PostCard } from './PostCard';

export interface LatestPostsProps {
  posts: Post[];
  copy: SectionCopy;
  assets?: AssetRef[];
}

const VI_CAROUSEL_LABELS: CarouselLabels = {
  prev: 'Trước',
  next: 'Tiếp theo',
  goTo: 'Chuyển tới slide {index}',
};

export function LatestPosts({ posts, copy, assets = [] }: LatestPostsProps) {
  const seen = new Set<string>();
  const dedupedPosts: Post[] = [];
  for (const post of posts) {
    if (!seen.has(post.path)) {
      seen.add(post.path);
      dedupedPosts.push(post);
    }
  }

  if (dedupedPosts.length === 0) {
    return null;
  }

  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));

  return (
    <section className="section" id="section_549960105">
      <div className="section-bg fill" />
      <div className="section-content relative">
        <div
          id="gap-916794445"
          className="gap-element clearfix"
          style={{ display: 'block', height: 'auto' }}
        />
        <div className="row row-collapse row-full-width" id="row-201268047">
          <div id="col-1323995894" className="col medium-3 small-12 large-3">
            <div className="col-inner">
              {copy.eyebrow && (
                <div id="text-2718069597" className="text">
                  <h4 style={{ textAlign: 'left' }}>
                    <strong>{copy.eyebrow}</strong>
                  </h4>
                </div>
              )}
              <div id="text-2917652779" className="text">
                <h2>
                  {(copy.titleLines ?? [copy.title]).map((line, idx) => (
                    <Fragment key={idx}>
                      {idx > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </h2>
              </div>
              <div
                className="is-divider divider clearfix"
                style={{
                  maxWidth: 133,
                  height: 2,
                  backgroundColor: 'rgb(0, 101, 223)',
                }}
              />
              <div
                id="gap-1576701123"
                className="gap-element clearfix"
                style={{ display: 'block', height: 'auto' }}
              />
              {copy.description && (
                <div id="text-578526168" className="text">
                  <p>
                    <Link href="/goc-nhin/" className="but-lh">
                      {copy.description}
                    </Link>
                  </p>
                </div>
              )}
              <div className="hide-for-small">
                <div className="cs-shape_4 shape41 cs-to_up" />
                <div className="cs-shape_4 shape42 cs-to_right" />
              </div>
            </div>
          </div>
          <div id="col-1058374266" className="col medium-9 small-12 large-9">
            <div className="col-inner">
              <div id="text-386464690" className="text hide-for-small">
                <div className="post row large-columns-3 medium-columns-1 small-columns-1">
                  {dedupedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      thumbnailAsset={
                        post.thumbnailId ? assetMap.get(post.thumbnailId) : undefined
                      }
                    />
                  ))}
                </div>
              </div>
              <div id="text-1494522260" className="text show-for-small">
                <div className="slider-wrapper relative slide_mobi_cus">
                  <Carousel
                    className="row large-columns-3 medium-columns-2 small-columns-1 slider slider-nav-circle slider-style-container"
                    align="start"
                    loop
                    arrows
                    dots
                    labels={{
                      ...VI_CAROUSEL_LABELS,
                      region: copy.title,
                    }}
                  >
                    {dedupedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        thumbnailAsset={
                          post.thumbnailId ? assetMap.get(post.thumbnailId) : undefined
                        }
                      />
                    ))}
                  </Carousel>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          id="gap-1941983221"
          className="gap-element clearfix"
          style={{ display: 'block', height: 'auto' }}
        />
      </div>
    </section>
  );
}
