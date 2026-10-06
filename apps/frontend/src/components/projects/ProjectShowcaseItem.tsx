import Link from 'next/link';
import type { Project } from '@/types/content';

export interface ProjectShowcaseItemProps {
  project: Project;
  imageUrl?: string;
  categoryLabel?: string;
}

export function ProjectShowcaseItem({
  project,
  imageUrl,
  categoryLabel,
}: ProjectShowcaseItemProps) {
  return (
    <div className="scroll-item" style={{ width: '50vw', padding: 20 }}>
      <Link
        href={project.path}
        className="item-link"
        style={{ display: 'block', textDecoration: 'none' }}
      >
        <div
          className="item-content"
          style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}
        />
        <div className="box-text">
          <h3 className="item-title">{project.title}</h3>
          {categoryLabel ? (
            <div className="item-categories">
              <span className="item-term">{categoryLabel}</span>
            </div>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
