/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { AssetRef, Post } from '@/types/content';

export interface PostCardProps {
  post: Post;
  thumbnailAsset?: AssetRef | null;
  variant?: 'home' | 'list';
  readMoreLabel?: string;
}

export function PostCard({
  post,
  thumbnailAsset,
  variant = 'home',
  readMoreLabel,
}: PostCardProps) {
  const hasValidMedia = Boolean(
    thumbnailAsset && thumbnailAsset.status !== 'missing' && thumbnailAsset.src,
  );

  if (variant === 'list') {
    return (
      <article
        id={post.id}
        className={`${post.id} post type-post status-publish format-standard has-post-thumbnail hentry`}
      >
        <div className="article-inner ">
          <div className="post-content">
            <div className="post-image">
              {hasValidMedia && thumbnailAsset && (
                <img
                  className="attachment-post-thumbnail size-post-thumbnail wp-post-image"
                  alt=""
                  decoding="async"
                  loading="lazy"
                  src={thumbnailAsset.src}
                  width={thumbnailAsset.width}
                  height={thumbnailAsset.height}
                />
              )}
            </div>
            <div className="post-details-archive">
              <Link href={post.path}>
                <h5 className="title-post-archive">{post.title}</h5>
              </Link>
              <div className="excerpt">
                <p>{post.excerpt}</p>
                {readMoreLabel && (
                  <Link className="read-more-new" href={post.path}>
                    {readMoreLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="col post-item-cus">
      <div className="col-inner">
        <Link href={post.path} className="plain">
          <div className="box box-normal box-text-bottom box-blog-post has-hover">
            <div className="box-image">
              <div className="image-cover" style={{ position: 'relative' }}>
                {hasValidMedia && thumbnailAsset && (
                  <img
                    className="attachment-post-thumbnail size-post-thumbnail wp-post-image"
                    alt=""
                    decoding="async"
                    loading="lazy"
                    src={thumbnailAsset.src}
                    width={thumbnailAsset.width}
                    height={thumbnailAsset.height}
                  />
                )}
                <div className="box-text text-left">
                  <h5 className="post-tt-cus">{post.title}</h5>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
