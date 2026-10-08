import Link from 'next/link';
import type { AssetRef, Project } from '@/types/content';

export interface ProjectCardProps {
  project: Project;
  thumbnailAsset?: AssetRef | null;
  categoryLabel?: string;
  dataTerms?: string;
}

export function ProjectCard({
  project,
  thumbnailAsset,
  categoryLabel,
  dataTerms,
}: ProjectCardProps) {
  const label = categoryLabel || '';
  const termsAttr = dataTerms !== undefined ? dataTerms : label ? JSON.stringify([label]) : undefined;

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
                    className="attachment-original size-original"
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
