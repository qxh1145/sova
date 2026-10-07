/* eslint-disable @next/next/no-img-element */
import { Fragment } from 'react';
import type { AssetRef, Locale, SectionCopy, Testimonial } from '@/types/content';
import { Carousel, type CarouselLabels } from '@/components/ui/Carousel';
import { TestimonialCard, type TestimonialSlideIds } from './TestimonialCard';

export interface TestimonialsArt {
  photo: AssetRef;
  quoteIcon: AssetRef;
  line: AssetRef;
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

export const TESTIMONIALS_IDS_MOBILE_VI: TestimonialsIds = {
  section: 'section_611504284',
  row: 'row-1744614563',
  leftCol: 'col-1209418902',
  imageWrapper: 'image_537706431',
  rightCol: 'col-747664916',
  eyebrowText: 'text-725286249',
  titleText: 'text-1488968211',
  sliderWrapper: 'slider-1746009011',
  innerGap: 'gap-1849267319',
  bottomGap: 'gap-1067076909',
  slides: [
    {
      row: 'row-315631769',
      col: 'col-818589815',
      ndKh: 'text-2744278447',
      line: 'text-2896139581',
      iconBoxText: 'text-2666594682',
    },
    {
      row: 'row-2024683135',
      col: 'col-644536123',
      ndKh: 'text-2009410189',
      line: 'text-1982626175',
      iconBoxText: 'text-780003339',
    },
    {
      row: 'row-1787779435',
      col: 'col-1215656760',
      ndKh: 'text-830958306',
      line: 'text-4161399947',
      iconBoxText: 'text-3716479530',
    },
  ],
};

export const TESTIMONIALS_IDS_MOBILE_EN: TestimonialsIds = {
  section: 'section_1896637792',
  row: 'row-920490087',
  leftCol: 'col-68456414',
  imageWrapper: 'image_1284626495',
  rightCol: 'col-975785863',
  eyebrowText: 'text-970536821',
  titleText: 'text-233220127',
  sliderWrapper: 'slider-2023647237',
  innerGap: 'gap-1942715701',
  bottomGap: 'gap-636789219',
  slides: [
    {
      row: 'row-2112378752',
      col: 'col-1978610518',
      ndKh: 'text-1663926344',
      line: 'text-2119023388',
      iconBoxText: 'text-1814777814',
    },
    {
      row: 'row-1342641053',
      col: 'col-1012808329',
      ndKh: 'text-509714514',
      line: 'text-1740085102',
      iconBoxText: 'text-2166651137',
    },
    {
      row: 'row-150274955',
      col: 'col-189619842',
      ndKh: 'text-2039104331',
      line: 'text-1163562078',
      iconBoxText: 'text-924829024',
    },
  ],
};

export const TESTIMONIALS_LABELS: Record<Locale, CarouselLabels> = {
  vi: {
    prev: 'Trước',
    next: 'Tiếp theo',
    goTo: 'Chuyển tới slide {index}',
  },
  en: {
    prev: 'Previous',
    next: 'Next',
    goTo: 'Go to slide {index}',
  },
};

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
