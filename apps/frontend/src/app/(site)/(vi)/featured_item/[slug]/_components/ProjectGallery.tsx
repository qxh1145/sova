import type { AssetRef } from '@/types/content';
import {
  ProjectGallerySingle,
  ProjectGallerySlider,
} from './ProjectGalleryInteractive';

export interface ProjectGalleryProps {
  galleryAssets: AssetRef[];
  galleryLayout?: 'slider' | 'row';
}

export function ProjectGallery({ galleryAssets, galleryLayout }: ProjectGalleryProps) {
  if (galleryAssets.length === 0) {
    if (galleryLayout === 'row') {
      return (
        <div className="slider-wrapper relative" id="slider-duan">
          <div className="row" />
        </div>
      );
    }

    return (
      <div className="slider-wrapper relative" id="slider-duan">
        <div
          className="slider slider-nav-circle slider-nav-large slider-nav-dark slider-style-focus slider-show-nav is-draggable"
          data-flickity-options='{"cellAlign":"center","imagesLoaded":true,"wrapAround":true,"autoPlay":3000,"prevNextButtons":true,"pageDots":true}'
        />
      </div>
    );
  }

  if (galleryAssets.length === 1) {
    const img = galleryAssets[0];
    return (
      <div className="slider-wrapper relative" id="slider-duan">
        <ProjectGallerySingle asset={img} />
      </div>
    );
  }

  return (
    <div className="slider-wrapper relative" id="slider-duan">
      <ProjectGallerySlider galleryAssets={galleryAssets} />
    </div>
  );
}
