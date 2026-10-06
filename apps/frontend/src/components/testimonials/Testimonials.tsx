/* eslint-disable @next/next/no-img-element */
import type { AssetRef, Locale, SectionCopy, Testimonial } from '@/types/content';
import { Carousel, type CarouselLabels } from '@/components/ui/Carousel';
import { TestimonialCard, type TestimonialSlideIds } from './TestimonialCard';

export interface TestimonialsArt {
  photo?: AssetRef;
  quoteIcon?: AssetRef;
  line?: AssetRef;
}

export interface TestimonialsIds {
  section: string;
  row: string;
  leftCol: string;
  imageWrapper: string;
  rightCol: string;
  eyebrowText?: string;
  titleText?: string;
  sliderWrapper: string;
  innerGap?: string;
  bottomGap?: string;
  slides?: TestimonialSlideIds[];
}

export const TESTIMONIALS_IDS_VI: TestimonialsIds = {
  section: 'section_1900032435',
  row: 'row-1068036605',
  leftCol: 'col-1079299922',
  imageWrapper: 'image_1870701100',
  rightCol: 'col-55011168',
  eyebrowText: 'text-355018751',
  titleText: 'text-4267280504',
  sliderWrapper: 'slider-1717467276',
  innerGap: 'gap-1197683257',
  bottomGap: 'gap-463933089',
  slides: [
    {
      row: 'row-14011233',
      col: 'col-1026990964',
      ndKh: 'text-1590618984',
      line: 'text-867299508',
      iconBoxText: 'text-210173545',
    },
    {
      row: 'row-693377910',
      col: 'col-1852668721',
      ndKh: 'text-1572294598',
      line: 'text-3700567653',
      iconBoxText: 'text-3120545540',
    },
    {
      row: 'row-2021009934',
      col: 'col-1650919536',
      ndKh: 'text-3909856715',
      line: 'text-1648463642',
      iconBoxText: 'text-2833241039',
    },
  ],
};

export const TESTIMONIALS_IDS_EN: TestimonialsIds = {
  section: 'section_1228410742',
  row: 'row-437563557',
  leftCol: 'col-1768254652',
  imageWrapper: 'image_1238961925',
  rightCol: 'col-863261912',
  eyebrowText: 'text-3668364895',
  titleText: 'text-3509530597',
  sliderWrapper: 'slider-283546209',
  innerGap: 'gap-962155070',
  bottomGap: 'gap-1944902466',
  slides: [
    {
      row: 'row-1450896083',
      col: 'col-993040111',
      ndKh: 'text-3287329704',
      line: 'text-4017882471',
      iconBoxText: 'text-1934524323',
    },
    {
      row: 'row-1154937134',
      col: 'col-471033680',
      ndKh: 'text-563581188',
      line: 'text-935327714',
      iconBoxText: 'text-2518450561',
    },
    {
      row: 'row-1376163772',
      col: 'col-92386505',
      ndKh: 'text-3819219461',
      line: 'text-3932566025',
      iconBoxText: 'text-493768455',
    },
  ],
};

export const TESTIMONIALS_LABELS: Record<Locale, CarouselLabels> = {
  vi: {
    prev: 'Trước',
    next: 'Tiếp theo',
    goTo: 'Chuyển tới slide {index}',
    region: 'Khách hàng nhận xét về chúng tôi',
  },
  en: {
    prev: 'Previous',
    next: 'Next',
    goTo: 'Go to slide {index}',
    region: 'Customer Reviews',
  },
};

export interface TestimonialsProps {
  testimonials: Testimonial[];
  avatars?: AssetRef[];
  copy: SectionCopy;
  art?: TestimonialsArt;
  ids: TestimonialsIds;
  labels: CarouselLabels;
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

  const avatarMap = new Map(avatars.map((a) => [a.id, a]));

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
                    width={art?.photo?.width ?? 700}
                    height={art?.photo?.height ?? 461}
                    src={art?.photo?.src ?? '/wp-content/uploads/2025/08/A8-Feedback-122.webp'}
                    className="attachment-original size-original"
                    alt={art?.photo?.alt ?? ''}
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
                <h2>{copy.title}</h2>
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
                  src={art?.quoteIcon?.src ?? '/wp-content/uploads/2024/02/Group.svg'}
                  alt={art?.quoteIcon?.alt ?? ''}
                  width={art?.quoteIcon?.width ?? 55}
                  height={art?.quoteIcon?.height ?? 55}
                />
              </p>
              <div className="slider-wrapper relative slide-kh" id={ids.sliderWrapper}>
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
                  {testimonials.map((t, index) => {
                    const avatar = t.avatarId ? avatarMap.get(t.avatarId) : undefined;
                    return (
                      <TestimonialCard
                        key={t.id}
                        testimonial={t}
                        avatar={avatar}
                        lineArt={art?.line}
                        ids={ids.slides?.[index]}
                      />
                    );
                  })}
                </Carousel>
              </div>
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
