import type { AssetRef } from '@/types/content';

export interface ProjectGalleryProps {
  galleryAssets: AssetRef[];
}

export function ProjectGallery({ galleryAssets }: ProjectGalleryProps) {
  if (galleryAssets.length === 0) {
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
        <div className="row">
          <div className="col large-12">
            <div className="img-inner">
              <img style={{ borderRadius: '12px' }} src={img.src} alt={img.alt ?? ''} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="slider-wrapper relative" id="slider-duan">
      <div
        className="slider slider-nav-circle slider-nav-large slider-nav-dark slider-style-focus slider-show-nav is-draggable"
        data-flickity-options='{"cellAlign":"center","imagesLoaded":true,"wrapAround":true,"autoPlay":3000,"prevNextButtons":true,"pageDots":true}'
      >
        {galleryAssets.map((img) => (
          <div className="img col" key={img.id}>
            <div className="img-inner">
              <img style={{ borderRadius: '12px' }} src={img.src} alt={img.alt ?? ''} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
