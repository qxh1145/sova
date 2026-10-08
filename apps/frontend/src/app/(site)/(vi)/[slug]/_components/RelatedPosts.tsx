import { PostCard } from '@/components/blog/PostCard';
import type { RelatedPostCard } from '@/lib/queries/posts';

export interface RelatedPostsProps {
  related: RelatedPostCard[];
  title: string;
}

export function RelatedPosts({ related, title }: RelatedPostsProps) {
  if (related.length === 0) {
    return <div className="relatedcat" />;
  }

  return (
    <div className="relatedcat">
      <h3 className="title-lienquan">{title}</h3>
      <div className="row large-columns-3 medium-columns-6 small-columns-2">
        {related.map(({ post, thumbnailAsset }, index) => (
          <PostCard
            key={post.id}
            post={post}
            thumbnailAsset={thumbnailAsset}
            variant="grid"
            itemIndex={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
