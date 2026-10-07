/* eslint-disable @next/next/no-img-element */
import type { AssetRef } from '@/types/content';

export interface ArticleHeroImageProps {
  image?: AssetRef | null;
}

export function ArticleHeroImage({ image }: ArticleHeroImageProps) {
  if (!image || image.status === 'missing' || !image.src) {
    return null;
  }

  return (
    <div className="post-image">
      <img
        width={image.width}
        height={image.height}
        src={image.src}
        className="attachment-post-thumbnail size-post-thumbnail wp-post-image"
        alt=""
        decoding="async"
        loading="lazy"
      />
    </div>
  );
}
