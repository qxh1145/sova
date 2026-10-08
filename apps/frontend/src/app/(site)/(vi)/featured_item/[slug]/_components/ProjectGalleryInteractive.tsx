'use client';

import { useState } from 'react';
import type { AssetRef } from '@/types/content';
import { Carousel, type CarouselLabels } from '@/components/ui/Carousel';
import { GalleryLightbox } from '@/components/projects/GalleryLightbox';

const GALLERY_CAROUSEL_LABELS: CarouselLabels = {
  prev: 'Previous',
  next: 'Next',
  goTo: 'Go to slide {index}',
  region: 'Project gallery',
};

export interface ProjectGallerySliderProps {
  galleryAssets: AssetRef[];
}

export function ProjectGallerySlider({ galleryAssets }: ProjectGallerySliderProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <Carousel
        className="slider slider-nav-circle slider-nav-large slider-nav-dark slider-style-focus slider-show-nav"
        align="center"
        loop
        autoplayMs={3000}
        arrows
        dots
        containScroll={false}
        labels={GALLERY_CAROUSEL_LABELS}
      >
        {galleryAssets.map((img, index) => (
          <div className="img col" key={img.id}>
            <div className="img-inner">
              <a
                className="lightbox-gallery"
                href={img.src}
                onClick={(e) => {
                  e.preventDefault();
                  setLightboxIndex(index);
                }}
              >
                <img style={{ borderRadius: '12px' }} src={img.src} alt={img.alt ?? ''} />
              </a>
            </div>
          </div>
        ))}
      </Carousel>

      <GalleryLightbox
        assets={galleryAssets}
        isOpen={lightboxIndex !== null}
        initialIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}

export interface ProjectGallerySingleProps {
  asset: AssetRef;
}

export function ProjectGallerySingle({ asset }: ProjectGallerySingleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="row">
        <div className="col large-12">
          <div className="img-inner">
            <a
              className="lightbox-gallery"
              href={asset.src}
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(true);
              }}
            >
              <img style={{ borderRadius: '12px' }} src={asset.src} alt={asset.alt ?? ''} />
            </a>
          </div>
        </div>
      </div>

      <GalleryLightbox
        assets={[asset]}
        isOpen={isOpen}
        initialIndex={0}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
