export interface PostMetaProps {
  author?: string;
  date?: string;
}

export function PostMeta({ author, date }: PostMetaProps) {
  return (
    <div className="meta">
      {author && <p className="author">{author}</p>}
      {date && <p className="date">{date}</p>}
    </div>
  );
}
