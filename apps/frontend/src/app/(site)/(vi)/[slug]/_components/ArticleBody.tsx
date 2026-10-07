import { RichText } from '@/components/ui/RichText';
import type { RichContent } from '@/types/content';

export interface ArticleBodyProps {
  body: RichContent;
}

export function ArticleBody({ body }: ArticleBodyProps) {
  return <RichText content={body} />;
}
