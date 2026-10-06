import type { AssetRef, Project, ProjectCategory, SectionCopy } from '@/types/content';
import { HorizontalProjects } from './HorizontalProjects';
import { ProjectShowcaseItem } from './ProjectShowcaseItem';

export interface FeaturedProjectsProps {
  projects: Project[];
  copy: SectionCopy;
  assets?: AssetRef[];
  categories?: ProjectCategory[];
}

export function FeaturedProjects({
  projects,
  copy,
  assets = [],
  categories = [],
}: FeaturedProjectsProps) {
  if (!projects.length) return null;

  const categoryMap = new Map(categories.map((c) => [c.id, c.label]));
  const assetMap = new Map(assets.map((a) => [a.id, a.src]));

  return (
    <section className="horizontal-scroll-section">
      <div className="row row-collapse tt_home_new" id="row-2138573453">
        <div id="col-765783521" className="col small-12 large-12">
          <div className="col-inner text-center">
            {copy.eyebrow && (
              <div id="text-980725794" className="text">
                <h4 style={{ textAlign: 'center' }}>
                  <strong>{copy.eyebrow}</strong>
                </h4>
              </div>
            )}
            <div id="text-3520817437" className="text">
              <h2 style={{ textAlign: 'center' }}>{copy.title}</h2>
            </div>
            <div
              className="is-divider divider clearfix"
              style={{
                maxWidth: 180,
                height: 2,
                backgroundColor: 'rgb(0, 101, 223)',
              }}
            />
          </div>
        </div>
      </div>

      <HorizontalProjects>
        {projects.map((project) => {
          const firstGalleryId = project.galleryIds[0];
          const imageUrl = firstGalleryId ? assetMap.get(firstGalleryId) : undefined;
          const categoryId = project.categoryIds[0];
          const categoryLabel = categoryId ? categoryMap.get(categoryId) : undefined;

          return (
            <ProjectShowcaseItem
              key={project.id}
              project={project}
              imageUrl={imageUrl}
              categoryLabel={categoryLabel}
            />
          );
        })}
      </HorizontalProjects>
    </section>
  );
}
