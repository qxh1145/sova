'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AssetRef } from '@/types/content';
import { Dialog } from '@/components/ui/Dialog';

export interface GalleryLightboxProps {
  assets: AssetRef[];
  isOpen: boolean;
  initialIndex?: number;
  onClose: () => void;
}

export function GalleryLightbox({
  assets,
  isOpen,
  initialIndex = 0,
  onClose,
}: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }

  const count = assets.length;
  const currentAsset = assets[currentIndex] ?? assets[0];

  const handlePrev = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const handleNext = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (!isOpen || count <= 1) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, count, handlePrev, handleNext]);

  if (count === 0 || !currentAsset) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      variant="lightbox"
      holder="image"
      title="Xem ảnh dự án" // business-text-ok: lightbox accessible title
      titleHidden
      labels={{ close: 'Đóng' }} // business-text-ok: close button label
    >
      <div className="mfp-figure">
        <figure>
          <img
            className="mfp-img"
            src={currentAsset.src}
            alt={currentAsset.alt ?? ''}
          />
          <figcaption>
            <div className="mfp-bottom-bar">
              <div className="mfp-counter">
                {`${currentIndex + 1} of ${count}`}
              </div>
            </div>
          </figcaption>
        </figure>
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            className="mfp-arrow mfp-arrow-left"
            aria-label="Ảnh trước" // business-text-ok: prev button aria label
            onClick={handlePrev}
          >
            <i className="icon-angle-left" />
          </button>
          <button
            type="button"
            className="mfp-arrow mfp-arrow-right"
            aria-label="Ảnh kế tiếp" // business-text-ok: next button aria label
            onClick={handleNext}
          >
            <i className="icon-angle-right" />
          </button>
        </>
      ) : null}
    </Dialog>
  );
}
