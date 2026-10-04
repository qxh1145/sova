'use client';

import {
  Children,
  isValidElement,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import AutoHeight from 'embla-carousel-auto-height';

export interface CarouselLabels {
  prev: string;
  next: string;
  goTo: string | ((index: number) => string);
}

export interface CarouselOptionsInput {
  align?: 'start' | 'center' | 'end';
  loop?: boolean;
  dragThreshold?: number;
  duration?: number;
  containScroll?: false | 'trimSnaps' | 'keepSnaps';
}

export interface CarouselPluginInput {
  autoplayMs?: number;
  pauseOnHover?: boolean;
  adaptiveHeight?: boolean;
}

export interface CarouselProps extends CarouselOptionsInput, CarouselPluginInput {
  id?: string;
  className?: string;
  arrows?: boolean;
  dots?: boolean;
  labels: CarouselLabels;
  children: ReactNode;
}

/** Pure option mapping from Carousel props to Embla options. */
export function toEmblaOptions(
  input: CarouselOptionsInput,
  slideCount: number,
): EmblaOptionsType {
  const isSingle = slideCount <= 1;
  const options: EmblaOptionsType = {
    align: input.align ?? 'start',
    loop: isSingle ? false : (input.loop ?? false),
    watchDrag: !isSingle,
  };
  if (input.dragThreshold !== undefined) {
    options.dragThreshold = input.dragThreshold;
  }
  if (input.duration !== undefined) {
    options.duration = input.duration;
  }
  if (input.containScroll !== undefined) {
    options.containScroll = input.containScroll;
  }
  return options;
}

/** Pure plugin factory from Carousel props to Embla plugins. */
export function getCarouselPlugins(
  input: CarouselPluginInput,
  slideCount: number,
): EmblaPluginType[] {
  if (slideCount <= 1) return [];

  const plugins: EmblaPluginType[] = [];

  if (input.autoplayMs && input.autoplayMs > 0) {
    plugins.push(
      Autoplay({
        delay: input.autoplayMs,
        stopOnMouseEnter: input.pauseOnHover ?? true,
        stopOnInteraction: false,
      }),
    );
  }

  if (input.adaptiveHeight) {
    plugins.push(AutoHeight());
  }

  return plugins;
}

export function Carousel({
  id,
  className = '',
  align,
  loop,
  autoplayMs,
  pauseOnHover = true,
  adaptiveHeight,
  arrows = false,
  dots = false,
  dragThreshold,
  duration,
  containScroll,
  labels,
  children,
}: CarouselProps) {
  const validChildren = Children.toArray(children).filter(isValidElement);
  const slideCount = validChildren.length;
  const isSingle = slideCount <= 1;

  const emblaOptions = useMemo(
    () => toEmblaOptions({ align, loop, dragThreshold, duration, containScroll }, slideCount),
    [align, loop, dragThreshold, duration, containScroll, slideCount],
  );

  const plugins = useMemo(
    () => getCarouselPlugins({ autoplayMs, pauseOnHover, adaptiveHeight }, slideCount),
    [autoplayMs, pauseOnHover, adaptiveHeight, slideCount],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins);
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on('select', callback);
      emblaApi.on('reInit', callback);
      return () => {
        emblaApi.off('select', callback);
        emblaApi.off('reInit', callback);
      };
    },
    [emblaApi],
  );

  const selectedIndex = useSyncExternalStore(
    subscribe,
    () => (emblaApi ? emblaApi.selectedScrollSnap() : 0),
    () => 0,
  );

  const canScrollPrev = useSyncExternalStore(
    subscribe,
    () => (emblaApi ? emblaApi.canScrollPrev() : false),
    () => (loop && !isSingle ? true : false),
  );

  const canScrollNext = useSyncExternalStore(
    subscribe,
    () => (emblaApi ? emblaApi.canScrollNext() : false),
    () => (!isSingle ? true : false),
  );

  const defaultSnaps = useMemo(
    () => Array.from({ length: slideCount }, (_, i) => i),
    [slideCount],
  );

  const scrollSnaps = useSyncExternalStore(
    subscribe,
    () => (emblaApi ? emblaApi.scrollSnapList() : defaultSnaps),
    () => defaultSnaps,
  );

  const resetAutoplay = useCallback(() => {
    if (!emblaApi) return;
    (emblaApi.plugins().autoplay as { reset?: () => void } | undefined)?.reset?.();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      resetAutoplay();
    }
  }, [emblaApi, resetAutoplay]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      resetAutoplay();
    }
  }, [emblaApi, resetAutoplay]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
        resetAutoplay();
      }
    },
    [emblaApi, resetAutoplay],
  );

  const { goTo } = labels;
  const getGoToLabel = useCallback(
    (index: number) => {
      if (typeof goTo === 'function') {
        return goTo(index);
      }
      if (typeof goTo === 'string') {
        return goTo.includes('{index}')
          ? goTo.replace('{index}', String(index))
          : `${goTo} ${index}`;
      }
      return `${index}`;
    },
    [goTo],
  );

  const rootClasses = [
    className,
    'flickity-enabled',
    slideCount > 1 ? 'is-draggable' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div id={id} className={rootClasses}>
      <div ref={emblaRef} className="flickity-viewport">
        <div className="flickity-slider">
          {validChildren.map((child, index) => (
            <div
              key={isValidElement(child) && child.key != null ? child.key : index}
              className={`flickity-cell ${selectedIndex === index ? 'is-selected' : ''}`.trim()}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {arrows && slideCount > 1 && (
        <>
          <button
            type="button"
            className="flickity-button flickity-prev-next-button previous"
            aria-label={labels.prev}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <svg className="flickity-button-icon" viewBox="0 0 100 100">
              <path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z" className="arrow" />
            </svg>
          </button>
          <button
            type="button"
            className="flickity-button flickity-prev-next-button next"
            aria-label={labels.next}
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <svg className="flickity-button-icon" viewBox="0 0 100 100">
              <path
                d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z"
                className="arrow"
                transform="translate(100, 100) rotate(180)"
              />
            </svg>
          </button>
        </>
      )}

      {dots && slideCount > 1 && (
        <ol className="flickity-page-dots">
          {scrollSnaps.map((_, index) => (
            <li key={index} style={{ display: 'inline-block' }}>
              <button
                type="button"
                className={`dot ${selectedIndex === index ? 'is-selected' : ''}`.trim()}
                aria-label={getGoToLabel(index + 1)}
                onClick={() => scrollTo(index)}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
