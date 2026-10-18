/* eslint-disable @next/next/no-img-element */
import { Fragment } from 'react';
import type { AssetRef, SectionCopy, Testimonial } from '@/types/content';
import { Carousel, type CarouselLabels } from '@/components/ui/Carousel';
import {
  type TestimonialsIds,
  TESTIMONIALS_IDS,
  type TestimonialsConsumer,
} from './testimonialsIds';
import { TestimonialCard, type TestimonialSlideIds } from './TestimonialCard';

export { type TestimonialsIds, TESTIMONIALS_IDS, type TestimonialsConsumer };

export interface TestimonialsArt {
  photo: AssetRef;
  quoteIcon: AssetRef;
  line: AssetRef;
}

export interface TestimonialsProps {
  testimonials: Testimonial[];
  avatars?: AssetRef[];
  copy: SectionCopy;
  art: TestimonialsArt;
  ids: TestimonialsIds;
  labels: CarouselLabels;
}

export interface TestimonialsSliderProps {
  testimonials: Testimonial[];
  avatars?: AssetRef[];
  lineArt: AssetRef;
  id: string;
  slideIds?: TestimonialSlideIds[];
  labels: CarouselLabels;
}

/** The `.slide-kh` slider: shared by the section and the story-2.2 carousel fixture. */
export function TestimonialsSlider({
  testimonials,
  avatars = [],
  lineArt,
  id,
  slideIds,
  labels,
}: TestimonialsSliderProps) {
  const avatarMap = new Map(avatars.map((a) => [a.id, a]));
  return (
    <div className="slider-wrapper relative slide-kh" id={id}>
      <Carousel
        className="slider slider-nav-simple slider-nav-large slider-nav-light slider-style-normal slider-show-nav"
        align="center"
        loop
        autoplayMs={6000}
        pauseOnHover
        adaptiveHeight
        arrows
        dots
        dragThreshold={10}
        labels={labels}
      >
        {testimonials.map((t, index) => (
          <TestimonialCard
            key={t.id}
            testimonial={t}
            avatar={t.avatarId ? avatarMap.get(t.avatarId) : undefined}
            lineArt={lineArt}
            ids={slideIds?.[index]}
          />
        ))}
      </Carousel>
    </div>
  );
}

export function Testimonials({
  testimonials,
  avatars = [],
  copy,
  art,
  ids,
  labels,
}: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="section ss-kh" id={ids.section}>
      <div className="section-bg fill" />
      <div className="section-content relative">
        <div className="row row-collapse row-full-width align-middle" id={ids.row}>
          <div id={ids.leftCol} className="col medium-7 small-12 large-7">
            <div className="col-inner">
              <div className="img has-hover x md-x lg-x y md-y lg-y" id={ids.imageWrapper}>
                <div className="img-inner dark">
                  <img
                    decoding="async"
                    width={art.photo.width}
                    height={art.photo.height}
                    src={art.photo.src}
                    className="attachment-original size-original"
                    alt={art.photo.alt}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
          <div id={ids.rightCol} className="col medium-5 small-12 large-5">
            <div className="col-inner">
              {copy.eyebrow && (
                <div id={ids.eyebrowText} className="text">
                  <h4 style={{ textAlign: 'left' }}>
                    <strong>{copy.eyebrow}</strong>
                  </h4>
                </div>
              )}
              <div id={ids.titleText} className="text">
                <h2>
                  {(copy.titleLines ?? [copy.title]).map((line, i) => (
                    <Fragment key={i}>
                      {/* Source: `nhận xét <br />về` keeps the space before the break. */}
                      {i > 0 && (
                        <>
                          {' '}
                          <br />
                        </>
                      )}
                      {line}
                    </Fragment>
                  ))}
                </h2>
              </div>
              <div
                className="is-divider divider clearfix"
                style={{ maxWidth: '133px', height: '2px', backgroundColor: 'rgb(0, 101, 223)' }}
              />
              <p>
                <img
                  decoding="async"
                  className="alignnone wp-image-3102 size-thumbnail"
                  role="img"
                  src={art.quoteIcon.src}
                  alt={art.quoteIcon.alt}
                  width={art.quoteIcon.width}
                  height={art.quoteIcon.height}
                />
              </p>
              <TestimonialsSlider
                testimonials={testimonials}
                avatars={avatars}
                lineArt={art.line}
                id={ids.sliderWrapper}
                slideIds={ids.slides}
                labels={{ ...labels, region: copy.title }}
              />
              {ids.innerGap && (
                <div
                  id={ids.innerGap}
                  className="gap-element clearfix"
                  style={{ display: 'block', height: 'auto' }}
                />
              )}
            </div>
          </div>
        </div>
        {ids.bottomGap && (
          <div
            id={ids.bottomGap}
            className="gap-element clearfix hide-for-small"
            style={{ display: 'block', height: 'auto' }}
          />
        )}
      </div>
    </section>
  );
}
