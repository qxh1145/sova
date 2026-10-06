import type { RichContent } from '@/types/content';

export interface RichTextProps {
  content: RichContent;
  className?: string;
}

export function RichText({ content, className }: RichTextProps) {
  if (content.format !== 'sanitized-html') {
    throw new Error(`Unsupported RichContent format: ${(content as { format?: string }).format}`);
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: content.html }}
    />
  );
}
