import Link from 'next/link';
import type { AssetRef, OfferingPanel, SectionCopy } from '@/types/content';
import { Carousel, type CarouselLabels } from '@/components/ui/Carousel';

export interface ServicePackageCardIds {
  col: string;
  isBlur?: boolean;
  titleText: string;
  itemGaps: string[];
  gapBeforeBtn: string;
}

export interface ServicePackageSlideIds extends ServicePackageCardIds {
  row: string;
}

export interface ServicePackageCardsIds {
  section: string;
  topGap: string;
  headingRow: string;
  headingCol: string;
  headingText: string;
  gridRow: string;
  gridCards: ServicePackageCardIds[];
  sliderWrapper: string;
  sliderCards: ServicePackageSlideIds[];
}

export const SERVICE_PACKAGE_CARDS_IDS_SEO_VI: ServicePackageCardsIds = {
  section: 'section_148064088',
  topGap: 'gap-310054870',
  headingRow: 'row-1658607961',
  headingCol: 'col-1016521761',
  headingText: 'text-1492573675',
  gridRow: 'row-731747472',
  gridCards: [
    {
      col: 'col-2086702966',
      isBlur: true,
      titleText: 'text-494824446',
      itemGaps: [
        'gap-855819681',
        'gap-249482746',
        'gap-2027953405',
        'gap-365739104',
        'gap-837415492',
        'gap-537520527',
      ],
      gapBeforeBtn: 'gap-895867112',
    },
    {
      col: 'col-279358235',
      isBlur: false,
      titleText: 'text-2043975176',
      itemGaps: [
        'gap-1633425625',
        'gap-1511426975',
        'gap-847591561',
        'gap-1090798410',
        'gap-1291966987',
        'gap-1984643233',
        'gap-414242652',
      ],
      gapBeforeBtn: 'gap-1990748987',
    },
    {
      col: 'col-1937004722',
      isBlur: false,
      titleText: 'text-1523480848',
      itemGaps: [
        'gap-1558087388',
        'gap-679214029',
        'gap-951592454',
        'gap-1145702661',
        'gap-1657913175',
        'gap-355473739',
        'gap-2087397748',
      ],
      gapBeforeBtn: 'gap-1929402062',
    },
    {
      col: 'col-1635005918',
      isBlur: false,
      titleText: 'text-2772874422',
      itemGaps: [
        'gap-931914821',
        'gap-445058901',
        'gap-1302494348',
        'gap-234044862',
        'gap-885802717',
        'gap-1925628497',
      ],
      gapBeforeBtn: 'gap-1832617160',
    },
  ],
  sliderWrapper: 'slider-229014746',
  sliderCards: [
    {
      row: 'row-863063486',
      col: 'col-409233393',
      titleText: 'text-1002710887',
      itemGaps: [
        'gap-1711751466',
        'gap-1180999399',
        'gap-1064579642',
        'gap-1857750494',
        'gap-1711650382',
        'gap-1086519473',
      ],
      gapBeforeBtn: 'gap-512448040',
    },
    {
      row: 'row-1293851659',
      col: 'col-105841476',
      titleText: 'text-1139255846',
      itemGaps: [
        'gap-1690281420',
        'gap-248215298',
        'gap-354301649',
        'gap-69444104',
        'gap-374666547',
        'gap-1485871664',
        'gap-986792928',
      ],
      gapBeforeBtn: 'gap-1492907680',
    },
    {
      row: 'row-1783592049',
      col: 'col-120960221',
      titleText: 'text-2735994447',
      itemGaps: [
        'gap-546752179',
        'gap-822932770',
        'gap-1654378381',
        'gap-1437867373',
        'gap-761636470',
        'gap-1270201662',
        'gap-1881033081',
      ],
      gapBeforeBtn: 'gap-687399856',
    },
    {
      row: 'row-1889962335',
      col: 'col-105830007',
      titleText: 'text-3311541522',
      itemGaps: [
        'gap-2038113449',
        'gap-1941098940',
        'gap-440658416',
        'gap-293056822',
        'gap-1162870230',
        'gap-1137829180',
      ],
      gapBeforeBtn: 'gap-1108680163',
    },
  ],
};

export const SERVICE_PACKAGE_CARDS_IDS_SEO_EN: ServicePackageCardsIds = {
  section: 'section_1771281465',
  topGap: 'gap-1526701639',
  headingRow: 'row-1805119660',
  headingCol: 'col-1703062376',
  headingText: 'text-3610428661',
  gridRow: 'row-909625469',
  gridCards: [
    {
      col: 'col-1092500040',
      isBlur: true,
      titleText: 'text-841039287',
      itemGaps: [
        'gap-417240944',
        'gap-787601362',
        'gap-1203287731',
        'gap-815304247',
        'gap-460569035',
        'gap-823186125',
      ],
      gapBeforeBtn: 'gap-1493974990',
    },
    {
      col: 'col-1745631293',
      isBlur: false,
      titleText: 'text-347169200',
      itemGaps: [
        'gap-2094153776',
        'gap-1503737141',
        'gap-1369756250',
        'gap-1584564653',
        'gap-462611848',
        'gap-1977957035',
        'gap-310944967',
      ],
      gapBeforeBtn: 'gap-205071542',
    },
    {
      col: 'col-1844257276',
      isBlur: false,
      titleText: 'text-1253327573',
      itemGaps: [
        'gap-831742561',
        'gap-1172180319',
        'gap-1146032281',
        'gap-1876657037',
        'gap-1509275014',
        'gap-1012475500',
        'gap-564797448',
      ],
      gapBeforeBtn: 'gap-1418166298',
    },
    {
      col: 'col-979027263',
      isBlur: false,
      titleText: 'text-2790902154',
      itemGaps: [
        'gap-1498030434',
        'gap-1305817816',
        'gap-193185961',
        'gap-1045520616',
        'gap-1630565701',
        'gap-1647110257',
      ],
      gapBeforeBtn: 'gap-1857538071',
    },
  ],
  sliderWrapper: 'slider-650832868',
  sliderCards: [
    {
      row: 'row-99093826',
      col: 'col-2051976436',
      titleText: 'text-2566137859',
      itemGaps: [
        'gap-22578665',
        'gap-1839797246',
        'gap-458219321',
        'gap-690224192',
        'gap-1051203153',
        'gap-1244510992',
      ],
      gapBeforeBtn: 'gap-1033159280',
    },
    {
      row: 'row-632921286',
      col: 'col-120961035',
      titleText: 'text-4120876264',
      itemGaps: [
        'gap-33407833',
        'gap-266157358',
        'gap-1051677727',
        'gap-872857003',
        'gap-86714760',
        'gap-403889393',
        'gap-300270046',
      ],
      gapBeforeBtn: 'gap-1037860393',
    },
    {
      row: 'row-1065571072',
      col: 'col-1168671021',
      titleText: 'text-3433546042',
      itemGaps: [
        'gap-932001035',
        'gap-390921523',
        'gap-950667936',
        'gap-1597698365',
        'gap-1025327508',
        'gap-733377914',
        'gap-849302139',
      ],
      gapBeforeBtn: 'gap-1187864268',
    },
    {
      row: 'row-714671176',
      col: 'col-1253475065',
      titleText: 'text-2338590828',
      itemGaps: [
        'gap-2058111956',
        'gap-1513089797',
        'gap-1923717876',
        'gap-73261418',
        'gap-1894633945',
        'gap-1678483529',
      ],
      gapBeforeBtn: 'gap-27709175',
    },
  ],
};

export interface ServicePackageCardsProps {
  copy: SectionCopy;
  offerings: OfferingPanel[];
  bgImage?: AssetRef | null;
  subtractIcon?: AssetRef | null;
  ids: ServicePackageCardsIds;
  labels: CarouselLabels;
  sliderClass?: string;
}

function CardContent({
  offering,
  cardIds,
  subtractIcon,
}: {
  offering: OfferingPanel;
  cardIds: ServicePackageCardIds;
  subtractIcon?: AssetRef | null;
}) {
  const items = offering.items ?? [];
  const ctaLabel = offering.ctaHref?.label ?? offering.cta?.label ?? '';
  const ctaHref = offering.ctaHref?.href ?? '#';

  return (
    <div className="col-inner">
      <div
        className="is-border"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 8,
          borderWidth: '1px 1px 1px 1px',
        }}
      />
      <div id={cardIds.titleText} className="text">
        <h2 style={{ fontFamily: 'Poppins, sans-serif !important' }}>
          {offering.title}
        </h2>
        {offering.description && (
          <p>
            {offering.description}
            <br />
          </p>
        )}
      </div>

      {items.map((item, itemIdx) => (
        <div key={itemIdx}>
          <div className="icon-box featured-box icon-box-left text-left">
            <div className="icon-box-img" style={{ width: 22 }}>
              <div className="icon">
                <div className="icon-inner">
                  {subtractIcon && (
                    <img
                      decoding="async"
                      width={subtractIcon.width ?? 1}
                      height={subtractIcon.height ?? 1}
                      src={subtractIcon.src}
                      className="attachment-medium size-medium"
                      alt={subtractIcon.alt ?? ''}
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="icon-box-text last-reset">
              <h5>{item}</h5>
            </div>
          </div>
          {itemIdx < cardIds.itemGaps.length && (
            <div
              id={cardIds.itemGaps[itemIdx]}
              className="gap-element clearfix"
              style={{ display: 'block', height: 'auto' }}
            />
          )}
        </div>
      ))}
      {cardIds.itemGaps.slice(items.length).map((gapId) => (
        <div
          key={gapId}
          id={gapId}
          className="gap-element clearfix"
          style={{ display: 'block', height: 'auto' }}
        />
      ))}

      <div
        id={cardIds.gapBeforeBtn}
        className="gap-element clearfix"
        style={{ display: 'block', height: 'auto' }}
      />

      {ctaLabel && (
        <p>
          <Link
            className="but-lh"
            style={{ borderRadius: 12 }}
            href={ctaHref}
          >
            {ctaLabel}
          </Link>
        </p>
      )}
    </div>
  );
}

export function ServicePackageCards({
  copy,
  offerings,
  bgImage,
  subtractIcon,
  ids,
  labels,
  sliderClass = 'slide_seo',
}: ServicePackageCardsProps) {
  return (
    <section className="section ss-ndv-seo" id={ids.section}>
      <div className="section-bg fill">
        {bgImage && (
          <img
            decoding="async"
            width={bgImage.width ?? 2000}
            height={bgImage.height ?? 1498}
            src={bgImage.src}
            className="bg attachment-original size-original"
            alt={bgImage.alt ?? ''}
            loading="lazy"
          />
        )}
        <div className="section-bg-overlay absolute fill" />
      </div>

      <div className="section-content relative">
        <div
          id={ids.topGap}
          className="gap-element clearfix"
          style={{ display: 'block', height: 'auto' }}
        />

        <div className="row" id={ids.headingRow}>
          <div id={ids.headingCol} className="col medium-6 small-12 large-6">
            <div className="col-inner">
              {copy.eyebrow && (
                <p>
                  <strong>
                    <span style={{ color: '#0065df' }}>{copy.eyebrow}</span>
                  </strong>
                </p>
              )}
              <div id={ids.headingText} className="text">
                <h2>
                  {copy.titleLines ? (
                    copy.titleLines.map((line, idx) => (
                      <span key={idx}>
                        {idx > 0 && <br />}
                        {line}
                      </span>
                    ))
                  ) : (
                    copy.title
                  )}
                </h2>
              </div>
              <div
                className="is-divider divider clearfix"
                style={{
                  maxWidth: 133,
                  height: 2,
                  backgroundColor: 'rgb(0, 101, 223)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Desktop Grid: hide-for-small (hidden <= 549px) */}
        <div
          className="row row-small row-ndv align-equal hover_gra eras-table-price hide-for-small" // business-text-ok: source CSS class name
          id={ids.gridRow}
        >
          {offerings.map((offering, idx) => {
            const cardIds = ids.gridCards[idx];
            return (
              <div
                key={offering.id}
                id={cardIds?.col}
                className={`col ${cardIds?.isBlur ? 'col-blur-blue ' : ''}medium-3 small-12 large-3`}
              >
                {cardIds && (
                  <CardContent
                    offering={offering}
                    cardIds={cardIds}
                    subtractIcon={subtractIcon}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Slider: show-for-small (visible <= 549px) */}
        <div
          id={ids.sliderWrapper}
          className={`slider-wrapper relative ${sliderClass} eras-table-price-slider show-for-small`} // business-text-ok: source CSS class name
        >

          <Carousel
            align="start"
            loop
            autoplayMs={6000}
            pauseOnHover
            arrows
            dots
            containScroll="keepSnaps"
            adaptiveHeight
            dragThreshold={10}
            labels={labels}
          >
            {offerings.map((offering, idx) => {
              const slideIds = ids.sliderCards[idx];
              return (
                <div
                  className="row row-small row-ndv hover_gra"
                  id={slideIds?.row}
                  key={offering.id}
                >
                  <div
                    id={slideIds?.col}
                    className="col medium-3 small-12 large-3"
                  >
                    {slideIds && (
                      <CardContent
                        offering={offering}
                        cardIds={slideIds}
                        subtractIcon={subtractIcon}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
