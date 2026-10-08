import Link from 'next/link';
import type { AssetRef, Project } from '@/types/content';

/** Fields a card renders; keeps client payloads free of body/SEO data. */
export type ProjectCardData = Pick<
  Project,
  'id' | 'path' | 'title' | 'thumbnailId' | 'categoryIds'
>;

export function toCardData(project: ProjectCardData): ProjectCardData {
  return {
    id: project.id,
    path: project.path,
    title: project.title,
    thumbnailId: project.thumbnailId,
    categoryIds: project.categoryIds,
  };
}

export function categoryLabel(
  categoryIds: string[],
  categoryMap: Map<string, string>,
): string {
  return categoryIds
    .map((id) => categoryMap.get(id))
    .filter(Boolean)
    .join(', ');
}

export interface ProjectCardProps {
  project: ProjectCardData;
  thumbnailAsset?: AssetRef | null;
  categoryLabel?: string;
  imageClassName?: string;
}

export function ProjectCard({
  project,
  thumbnailAsset,
  categoryLabel: label = '',
  imageClassName = 'attachment-original size-original',
}: ProjectCardProps) {
  const termsAttr = label ? JSON.stringify([label]) : undefined;

  return (
    <div className="col" data-terms={termsAttr}>
      <div className="col-inner">
        <Link href={project.path} className="plain">
          <div className="portfolio-box box has-hover">
            <div className="box-image">
              <div>
                {thumbnailAsset ? (
                  <img
                    width={thumbnailAsset.width ?? 2000}
                    height={thumbnailAsset.height ?? 2000}
                    src={thumbnailAsset.src}
                    className={imageClassName}
                    alt={thumbnailAsset.alt ?? ''}
                    decoding="async"
                    loading="lazy"
                  />
                ) : null}
              </div>
            </div>
            <div className="box-text text-center">
              <div className="box-text-inner">
                <h6 className="uppercase portfolio-box-title">{project.title}</h6>
                {label ? (
                  <p className="uppercase portfolio-box-category is-xsmall op-6">
                    <span className="show-on-hover">{label}</span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
