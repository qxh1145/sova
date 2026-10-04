import type { ReactNode } from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  styleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  level = 2,
  styleLevel = level,
  className = '',
  children,
}: SectionHeadingProps) {
  const Tag = `h${level}` as const;
  const styleClass = `heading-h${styleLevel}`;

  return (
    <div className={`section-heading ${className}`.trim()}>
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <Tag className={styleClass}>{title}</Tag>
      {description && <p className="section-description">{description}</p>}
      {children}
    </div>
  );
}
