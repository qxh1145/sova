import type { RelatedProjectCard } from '@/lib/queries/projects';
import { ProjectCard } from '@/components/projects/ProjectCard';

export interface RelatedProjectsProps {
  related: RelatedProjectCard[];
}

export function RelatedProjects({ related }: RelatedProjectsProps) {
  return (
    <div className="portfolio-bottom">
      <div className="row row-portcus">
        <div className="col large-12">
          <h4 style={{ marginBottom: '20px', marginTop: '10px' }}>
            Dự án liên quan {/* business-text-ok: source related heading */}
          </h4>
          <div className="portfolio-related">
            <div className="row large-columns-4 medium-columns-3 small-columns-2 row-small">
              {related.map(({ project, thumbnailAsset, category }) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  thumbnailAsset={thumbnailAsset}
                  categoryLabel={category?.label}
                  imageClassName="attachment-medium size-medium"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
