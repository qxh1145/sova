import type { RelatedProjectCard } from '@/lib/queries/projects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Carousel, type CarouselLabels } from '@/components/ui/Carousel';

export interface RelatedProjectsProps {
  related: RelatedProjectCard[];
  labels: CarouselLabels;
}

export function RelatedProjects({ related, labels }: RelatedProjectsProps) {
  return (
    <div className="portfolio-bottom">
      <div className="row row-portcus">
        <div className="col large-12">
          <h4 style={{ marginBottom: '20px', marginTop: '10px' }}>
            Dự án liên quan {/* business-text-ok: source related heading */}
          </h4>
          <div className="portfolio-related">
            <div className="portfolio-element-wrapper has-filtering">
              {/* Source Flickity options: groupCells 100%, dragThreshold 5, cellAlign left, wrapAround, no dots, no autoplay. */}
              <Carousel
                className="row portfolio-related large-columns-4 medium-columns-3 small-columns-2 row-small slider row-slider slider-nav-reveal slider-nav-push"
                align="start"
                loop
                arrows
                slidesToScroll="auto"
                dragThreshold={5}
                labels={labels}
              >
                {related.map(({ project, thumbnailAsset, category }) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    thumbnailAsset={thumbnailAsset}
                    categoryLabel={category?.label}
                    imageClassName="attachment-medium size-medium"
                  />
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
