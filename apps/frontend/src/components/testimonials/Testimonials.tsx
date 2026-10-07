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

export const TESTIMONIALS_IDS_HOSTING_VI: TestimonialsIds = {
  section: 'section_601922759',
  row: 'row-1720812725',
  leftCol: 'col-105938061',
  imageWrapper: 'image_491749075',
  rightCol: 'col-2099560627',
  eyebrowText: 'text-1954659702',
  titleText: 'text-3104430940',
  sliderWrapper: 'slider-1185320468',
  innerGap: 'gap-1090470330',
  bottomGap: 'gap-967692151',
  slides: [
    {
      row: 'row-1942823748',
      col: 'col-834795930',
      ndKh: 'text-299155815',
      line: 'text-1320344294',
      iconBoxText: 'text-2514513466',
    },
    {
      row: 'row-2124158199',
      col: 'col-578982266',
      ndKh: 'text-1384824073',
      line: 'text-2710081290',
      iconBoxText: 'text-4022369665',
    },
    {
      row: 'row-1134616236',
      col: 'col-2106742537',
      ndKh: 'text-4273456082',
      line: 'text-333887419',
      iconBoxText: 'text-54875533',
    },
  ],
};

export const TESTIMONIALS_IDS_HOSTING_EN: TestimonialsIds = {
  section: 'section_1341923526',
  row: 'row-1540336113',
  leftCol: 'col-1557214775',
  imageWrapper: 'image_562855796',
  rightCol: 'col-913191646',
  eyebrowText: 'text-2549990629',
  titleText: 'text-2128609193',
  sliderWrapper: 'slider-1739765766',
  innerGap: 'gap-149198458',
  bottomGap: 'gap-1222585009',
  slides: [
    {
      row: 'row-807651528',
      col: 'col-1694578235',
      ndKh: 'text-4174658684',
      line: 'text-669744452',
      iconBoxText: 'text-3571552358',
    },
    {
      row: 'row-335117581',
      col: 'col-820976926',
      ndKh: 'text-34308129',
      line: 'text-3628057217',
      iconBoxText: 'text-3321225928',
    },
    {
      row: 'row-1186901178',
      col: 'col-1689791417',
      ndKh: 'text-290332767',
      line: 'text-1319123777',
      iconBoxText: 'text-3730226156',
    },
  ],
};

export const TESTIMONIALS_IDS_VPS_VI: TestimonialsIds = {
  section: 'section_2083222755',
  row: 'row-222827155',
  leftCol: 'col-1084059863',
  imageWrapper: 'image_633170927',
  rightCol: 'col-1978814024',
  eyebrowText: 'text-4111739786',
  titleText: 'text-41298809',
  sliderWrapper: 'slider-334457488',
  innerGap: 'gap-1191812962',
  bottomGap: 'gap-1337576045',
  slides: [
    {
      row: 'row-468083611',
      col: 'col-274249864',
      ndKh: 'text-2056376816',
      line: 'text-1296810078',
      iconBoxText: 'text-1695803420',
    },
    {
      row: 'row-1008910294',
      col: 'col-1959434119',
      ndKh: 'text-329473446',
      line: 'text-3371698953',
      iconBoxText: 'text-975750105',
    },
    {
      row: 'row-269230667',
      col: 'col-2070867829',
      ndKh: 'text-1444004264',
      line: 'text-3125855162',
      iconBoxText: 'text-4269981143',
    },
  ],
};

export const TESTIMONIALS_IDS_VPS_EN: TestimonialsIds = {
  section: 'section_1606797624',
  row: 'row-713008911',
  leftCol: 'col-928874526',
  imageWrapper: 'image_1147461546',
  rightCol: 'col-204491766',
  eyebrowText: 'text-2611397371',
  titleText: 'text-3815097734',
  sliderWrapper: 'slider-109060255',
  innerGap: 'gap-254895094',
  bottomGap: 'gap-1142588218',
  slides: [
    {
      row: 'row-794163630',
      col: 'col-1704419566',
      ndKh: 'text-300467739',
      line: 'text-2477984878',
      iconBoxText: 'text-4211171123',
    },
    {
      row: 'row-499480548',
      col: 'col-101226913',
      ndKh: 'text-1943462905',
      line: 'text-2193445836',
      iconBoxText: 'text-849972628',
    },
    {
      row: 'row-1131111854',
      col: 'col-255863287',
      ndKh: 'text-2464852430',
      line: 'text-1941871619',
      iconBoxText: 'text-2482240244',
    },
  ],
};

export const TESTIMONIALS_IDS_EMAIL_VI: TestimonialsIds = {
  section: 'section_1984183481',
  row: 'row-114143651',
  leftCol: 'col-1068355559',
  imageWrapper: 'image_331740629',
  rightCol: 'col-901618470',
  eyebrowText: 'text-3837946768',
  titleText: 'text-1298323406',
  sliderWrapper: 'slider-114261328',
  innerGap: 'gap-1424382467',
  bottomGap: 'gap-1531803359',
  slides: [
    {
      row: 'row-1206751867',
      col: 'col-794361294',
      ndKh: 'text-1628036239',
      line: 'text-1168134763',
      iconBoxText: 'text-2116874641',
    },
    {
      row: 'row-847301732',
      col: 'col-200154738',
      ndKh: 'text-1399452221',
      line: 'text-1476327395',
      iconBoxText: 'text-1917514466',
    },
    {
      row: 'row-68234570',
      col: 'col-249943998',
      ndKh: 'text-2113135161',
      line: 'text-1378018257',
      iconBoxText: 'text-3113930760',
    },
  ],
};

export const TESTIMONIALS_IDS_EMAIL_EN: TestimonialsIds = {
  section: 'section_2136010649',
  row: 'row-103329289',
  leftCol: 'col-1651344776',
  imageWrapper: 'image_412222799',
  rightCol: 'col-901269700',
  eyebrowText: 'text-3202874702',
  titleText: 'text-3557437193',
  sliderWrapper: 'slider-1505677085',
  innerGap: 'gap-37007440',
  bottomGap: 'gap-343316009',
  slides: [
    {
      row: 'row-1701249391',
      col: 'col-38225116',
      ndKh: 'text-4243389167',
      line: 'text-1571621388',
      iconBoxText: 'text-1622937273',
    },
    {
      row: 'row-1403061539',
      col: 'col-480395229',
      ndKh: 'text-358670330',
      line: 'text-706941177',
      iconBoxText: 'text-3720002696',
    },
    {
      row: 'row-673922830',
      col: 'col-1766384887',
      ndKh: 'text-159124821',
      line: 'text-2470805889',
      iconBoxText: 'text-1126978856',
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
