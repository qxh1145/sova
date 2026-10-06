'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactElement,
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
  /** Accessible name; when set the root becomes a `region` landmark. */
  region?: string;
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
  adaptiveHeight?: boolean;
}

export interface CarouselProps extends CarouselOptionsInput, CarouselPluginInput {
  pauseOnHover?: boolean;
  id?: string;
  className?: string;
  arrows?: boolean;
  dots?: boolean;
  labels: CarouselLabels;
  children: ReactNode;
}

/** Pure option mapping from Carousel props to Embla options. */
export function toEmblaOptions(input: CarouselOptionsInput, slideCount: number): EmblaOptionsType {
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
      // Flickity parity: any drag/click stops autoplay for good; hover pause lives in Carousel.
      Autoplay({ delay: input.autoplayMs, stopOnInteraction: true }),
    );
  }

  if (input.adaptiveHeight) {
    plugins.push(AutoHeight());
  }

  return plugins;
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
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
  const validChildren = Children.toArray(children).filter(isValidElement) as ReactElement<{
    className?: string;
  }>[];
  const slideCount = validChildren.length;
  const isSingle = slideCount <= 1;

  const emblaOptions = useMemo(
    () => toEmblaOptions({ align, loop, dragThreshold, duration, containScroll }, slideCount),
    [align, loop, dragThreshold, duration, containScroll, slideCount],
  );

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  const effectiveAutoplayMs = reducedMotion ? undefined : autoplayMs;

  const plugins = useMemo(
    () => getCarouselPlugins({ autoplayMs: effectiveAutoplayMs, adaptiveHeight }, slideCount),
    [effectiveAutoplayMs, adaptiveHeight, slideCount],
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

  const initialCanPrev = !!loop && !isSingle;
  const canScrollPrev = useSyncExternalStore(
    subscribe,
    () => (emblaApi ? emblaApi.canScrollPrev() : initialCanPrev),
    () => initialCanPrev,
  );

  const canScrollNext = useSyncExternalStore(
    subscribe,
    () => (emblaApi ? emblaApi.canScrollNext() : !isSingle),
    () => !isSingle,
  );

  const defaultSnaps = useMemo(() => Array.from({ length: slideCount }, (_, i) => i), [slideCount]);

  const scrollSnaps = useSyncExternalStore(
    subscribe,
    () => (emblaApi ? emblaApi.scrollSnapList() : defaultSnaps),
    () => defaultSnaps,
  );

  // Set once the user drags or clicks a control; hover-leave must not restart autoplay after that.
  const userStopped = useRef(false);
  const stopAutoplay = useCallback(() => {
    userStopped.current = true;
    emblaApi?.plugins().autoplay?.stop();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('pointerDown', stopAutoplay);
    return () => {
      emblaApi.off('pointerDown', stopAutoplay);
    };
  }, [emblaApi, stopAutoplay]);

  const pauseHover = useCallback(() => emblaApi?.plugins().autoplay?.stop(), [emblaApi]);
  const resumeHover = useCallback(() => {
    if (!userStopped.current) emblaApi?.plugins().autoplay?.play();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    stopAutoplay();
  }, [emblaApi, stopAutoplay]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    stopAutoplay();
  }, [emblaApi, stopAutoplay]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      stopAutoplay();
    },
    [emblaApi, stopAutoplay],
  );

  const { goTo } = labels;
  const getGoToLabel = useCallback(
    (index: number) => {
      if (typeof goTo === 'function') {
        return goTo(index);
      }
      return goTo.includes('{index}')
        ? goTo.replace('{index}', String(index))
        : `${goTo} ${index}`;
    },
    [goTo],
  );

  const rootClasses = [className, 'flickity-enabled', slideCount > 1 ? 'is-draggable' : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      id={id}
      className={rootClasses}
      role={labels.region ? 'region' : undefined}
      aria-label={labels.region}
      onMouseEnter={pauseOnHover ? pauseHover : undefined}
      onMouseLeave={pauseOnHover ? resumeHover : undefined}
    >
      <div ref={emblaRef} className="flickity-viewport">
        <div className="flickity-slider">
          {/* Flickity parity: the child itself is the cell, so legacy `.flickity-slider > .row/.col` rules match. */}
          {validChildren.map((child, index) =>
            selectedIndex === index
              ? cloneElement(child, {
                  className: [child.props.className, 'is-selected'].filter(Boolean).join(' '),
                })
              : child,
          )}
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
            <svg
              className="flickity-button-icon"
              viewBox="0 0 100 100"
              aria-hidden="true"
              focusable="false"
            >
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
            <svg
              className="flickity-button-icon"
              viewBox="0 0 100 100"
              aria-hidden="true"
              focusable="false"
            >
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
            <li key={index}>
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
