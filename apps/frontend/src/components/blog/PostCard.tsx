/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { AssetRef, Post } from '@/types/content';

export interface PostCardProps {
  post: Post;
  thumbnailAsset?: AssetRef | null;
}

export function PostCard({ post, thumbnailAsset }: PostCardProps) {
  const hasValidMedia = Boolean(
    thumbnailAsset && thumbnailAsset.status !== 'missing' && thumbnailAsset.src,
  );

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
