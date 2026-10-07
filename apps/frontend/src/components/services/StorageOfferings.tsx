import Link from 'next/link';
import type { AssetRef, OfferingPanel, SectionCopy } from '@/types/content';
import { Carousel, type CarouselLabels } from '@/components/ui/Carousel';

export interface StorageOfferingsCardIds {
  col: string;
  isBlur?: boolean;
  titleText: string;
  gapTop: string;
  imageWrapper: string;
  gapAfterImg: string;
  itemGaps: string[];
  gapBeforeBtn: string;
}

export interface StorageOfferingsSlideIds extends StorageOfferingsCardIds {
  row: string;
}

export interface StorageOfferingsIds {
  section: string;
  decoRow: string;
  decoCol: string;
  decoImg: string;
  headingRow: string;
  headingCol: string;
  titleText: string;
  gridRow: string;
  gridCards: StorageOfferingsCardIds[];
  sliderWrapper: string;
  sliderCards: StorageOfferingsSlideIds[];
}

export const STORAGE_OFFERINGS_IDS_VI: StorageOfferingsIds = {
  section: 'section_1644279447',
  decoRow: 'row-299485342',
  decoCol: 'col-2094913727',
  decoImg: 'image_1886760630',
  headingRow: 'row-1599048584',
  headingCol: 'col-1983591716',
  titleText: 'text-3420182657',
  gridRow: 'row-723778660',
  gridCards: [
    {
      col: 'col-1371373921',
      titleText: 'text-3902683750',
      gapTop: 'gap-1895748435',
      imageWrapper: 'image_1121556175',
      gapAfterImg: 'gap-1653160975',
      itemGaps: [
        'gap-792845743',
        'gap-1362807489',
        'gap-1429584581',
        'gap-964296376',
        'gap-143191008',
        'gap-1001422615',
      ],
      gapBeforeBtn: 'gap-1165865883',
    },
    {
      col: 'col-942165784',
      isBlur: true,
      titleText: 'text-2398418259',
      gapTop: 'gap-1173533229',
      imageWrapper: 'image_1205890053',
      gapAfterImg: 'gap-398336029',
      itemGaps: [
        'gap-1094931978',
        'gap-1720660693',
        'gap-653374203',
        'gap-1894487630',
        'gap-1128131678',
        'gap-663588655',
      ],
      gapBeforeBtn: 'gap-2074559703',
    },
    {
      col: 'col-1008853401',
      titleText: 'text-174432634',
      gapTop: 'gap-1039089579',
      imageWrapper: 'image_1437942825',
      gapAfterImg: 'gap-1662327467',
      itemGaps: [
        'gap-1645711834',
        'gap-1993417045',
        'gap-2103647258',
        'gap-385899849',
        'gap-1823190037',
        'gap-495510323',
      ],
      gapBeforeBtn: 'gap-929710864',
    },
  ],
  sliderWrapper: 'slider-75665460',
  sliderCards: [
    {
      row: 'row-1985384909',
      col: 'col-1565225565',
      titleText: 'text-1590701734',
      gapTop: 'gap-201784164',
      imageWrapper: 'image_92114537',
      gapAfterImg: 'gap-372760546',
      itemGaps: [
        'gap-1377306403',
        'gap-240594722',
        'gap-79548851',
        'gap-498733760',
        'gap-718820899',
        'gap-808970364',
      ],
      gapBeforeBtn: 'gap-663378109',
    },
    {
      row: 'row-1015049003',
      col: 'col-1730997123',
      isBlur: true,
      titleText: 'text-890518781',
      gapTop: 'gap-1426801264',
      imageWrapper: 'image_1148768699',
      gapAfterImg: 'gap-2107021698',
      itemGaps: [
        'gap-1463531026',
        'gap-186371220',
        'gap-1283353925',
        'gap-770575008',
        'gap-491468979',
        'gap-1501501672',
      ],
      gapBeforeBtn: 'gap-417649088',
    },
    {
      row: 'row-1396220620',
      col: 'col-1333537762',
      titleText: 'text-2626812138',
      gapTop: 'gap-119548384',
      imageWrapper: 'image_254055533',
      gapAfterImg: 'gap-857008233',
      itemGaps: [
        'gap-2055049317',
        'gap-469599385',
        'gap-1276641684',
        'gap-1021144141',
        'gap-562771536',
        'gap-332483100',
      ],
      gapBeforeBtn: 'gap-419596512',
    },
  ],
};

export const STORAGE_OFFERINGS_IDS_EN: StorageOfferingsIds = {
  section: 'section_475696028',
  decoRow: 'row-1713577154',
  decoCol: 'col-1205857650',
  decoImg: 'image_1222782848',
  headingRow: 'row-1506129200',
  headingCol: 'col-985226649',
  titleText: 'text-1273719450',
  gridRow: 'row-2135703587',
  gridCards: [
    {
      col: 'col-556527216',
      titleText: 'text-1061057193',
      gapTop: 'gap-150051898',
      imageWrapper: 'image_912053209',
      gapAfterImg: 'gap-278592174',
      itemGaps: [
        'gap-950401457',
        'gap-121909744',
        'gap-1486905698',
        'gap-430528762',
        'gap-964964519',
        'gap-307698598',
      ],
      gapBeforeBtn: 'gap-1504119913',
    },
    {
      col: 'col-652789459',
      isBlur: true,
      titleText: 'text-1074995668',
      gapTop: 'gap-1049549087',
      imageWrapper: 'image_1327821032',
      gapAfterImg: 'gap-1912174278',
      itemGaps: [
        'gap-1974643479',
        'gap-1970527271',
        'gap-436047885',
        'gap-2139348590',
        'gap-398184931',
        'gap-1235537643',
      ],
      gapBeforeBtn: 'gap-226773903',
    },
    {
      col: 'col-610864820',
      titleText: 'text-2539451932',
      gapTop: 'gap-1549214914',
      imageWrapper: 'image_1421874060',
      gapAfterImg: 'gap-663606077',
      itemGaps: [
        'gap-1272271104',
        'gap-171438467',
        'gap-656990749',
        'gap-1707452963',
        'gap-755162725',
        'gap-1849569970',
      ],
      gapBeforeBtn: 'gap-1657430185',
    },
  ],
  sliderWrapper: 'slider-1825060789',
  sliderCards: [
    {
      row: 'row-1016231431',
      col: 'col-1631657257',
      titleText: 'text-191798810',
      gapTop: 'gap-1518719029',
      imageWrapper: 'image_1732858135',
      gapAfterImg: 'gap-380856365',
      itemGaps: [
        'gap-325934861',
        'gap-270534369',
        'gap-1992952443',
        'gap-1340138736',
        'gap-1486850495',
        'gap-2041142382',
      ],
      gapBeforeBtn: 'gap-1527250022',
    },
    {
      row: 'row-1863448851',
      col: 'col-245098884',
      isBlur: true,
      titleText: 'text-2067952301',
      gapTop: 'gap-1907088850',
      imageWrapper: 'image_1280118474',
      gapAfterImg: 'gap-36092110',
      itemGaps: [
        'gap-576270344',
        'gap-1886295478',
        'gap-702422003',
        'gap-1893820172',
        'gap-38985209',
        'gap-1479907210',
      ],
      gapBeforeBtn: 'gap-454527630',
    },
    {
      row: 'row-1971724390',
      col: 'col-903146609',
      titleText: 'text-121040957',
      gapTop: 'gap-784465883',
      imageWrapper: 'image_1971636246',
      gapAfterImg: 'gap-1795661834',
      itemGaps: [
        'gap-2111114334',
        'gap-1601779129',
        'gap-1220545360',
        'gap-1586115359',
        'gap-507258092',
        'gap-303024718',
      ],
      gapBeforeBtn: 'gap-254321412',
    },
  ],
};

export interface StorageOfferingsProps {
  copy?: SectionCopy;
  offerings: OfferingPanel[];
  mediaMap: Record<string, AssetRef>;
  subtractIcon?: AssetRef | null;
  decoIcon?: AssetRef | null;
  resolvedHrefs: Record<string, string>;
  ids: StorageOfferingsIds;
  labels: CarouselLabels;
}

export function StorageOfferings({
  copy,
  offerings,
  mediaMap,
  subtractIcon,
  decoIcon,
  resolvedHrefs,
  ids,
  labels,
}: StorageOfferingsProps) {
  return (
    <section className="section" id={ids.section}>
      <div className="section-bg fill" />

      <div className="section-content relative">
        {/* Deco Row: hide-for-small */}
        <div className="row align-bottom" id={ids.decoRow}>
          <div
            id={ids.decoCol}
            className="col hide-for-small medium-2 small-12 large-2"
          >
            <div className="col-inner">
              <div
                className="img has-hover x md-x lg-x y md-y lg-y"
                id={ids.decoImg}
              >
                <div className="img-inner dark">
                  {decoIcon && (
                    <img
                      decoding="async"
                      width={decoIcon.width ?? 262}
                      height={decoIcon.height ?? 261}
                      src={decoIcon.src}
                      className="attachment-original size-original"
                      alt={decoIcon.alt ?? ''}
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heading Row */}
        {copy && (
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
                <div id={ids.titleText} className="text">
                  <h2>{copy.title}</h2>
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
        )}

        {/* Desktop Grid: hide-for-small (visible >= 550px) */}
        <div
          className="row row-small row-ndv hover_gra eras-table-price hide-for-small" // business-text-ok: source CSS class name
          id={ids.gridRow}
        >
          {offerings.map((offering, idx) => {
            const cardIds = ids.gridCards[idx];
            const items = offering.items ?? [];
            const media = offering.mediaId ? mediaMap[offering.mediaId] : null;
            const href = offering.cta ? resolvedHrefs[offering.cta.routeId] ?? '#' : '#';
            const isCenterIcon = idx === 0;

            return (
              <div
                key={offering.id}
                id={cardIds?.col}
                className={`col ${cardIds?.isBlur ? 'col-blur-blue ' : ''}medium-4 small-12 large-4`}
              >
                <div className="col-inner">
                  <div
                    className="is-border"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 8,
                      borderWidth: '1px 1px 1px 1px',
                    }}
                  />
                  <div id={cardIds?.titleText} className="text">
                    <h3 style={{ fontFamily: 'Poppins, sans-serif !important' }}>
                      {offering.title}
                    </h3>
                  </div>
                  <div
                    id={cardIds?.gapTop}
                    className="gap-element clearfix"
                    style={{ display: 'block', height: 'auto' }}
                  />
                  <div
                    className="img has-hover x md-x lg-x y md-y lg-y"
                    id={cardIds?.imageWrapper}
                  >
                    <div
                      className="img-inner image-cover dark"
                      style={{ paddingTop: '100%' }}
                    >
                      {media && (
                        <img
                          decoding="async"
                          src={media.src}
                          className="attachment-original size-original"
                          alt={media.alt ?? ''}
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>
                  <div
                    id={cardIds?.gapAfterImg}
                    className="gap-element clearfix"
                    style={{ display: 'block', height: 'auto' }}
                  />

                  {items.map((item, itemIdx) => (
                    <div key={itemIdx}>
                      <div
                        className={`icon-box featured-box ${isCenterIcon ? 'icon-center ' : ''}icon-box-left text-left`}
                      >
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
                      {itemIdx < items.length - 1 && (
                        <div
                          id={cardIds?.itemGaps[itemIdx]}
                          className="gap-element clearfix"
                          style={{ display: 'block', height: 'auto' }}
                        />
                      )}
                    </div>
                  ))}

                  <div
                    id={cardIds?.gapBeforeBtn}
                    className="gap-element clearfix"
                    style={{ display: 'block', height: 'auto' }}
                  />
                  {offering.cta && (
                    <p>
                      <Link
                        className="but-lh"
                        style={{ borderRadius: 12 }}
                        href={href}
                      >
                        {offering.cta.label}
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Slider: show-for-small (visible <= 549px) */}
        <div
          id={ids.sliderWrapper}
          className="slider-wrapper relative slide_gplt eras-table-price-slider show-for-small" // business-text-ok: source CSS class name
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
              const items = offering.items ?? [];
              const media = offering.mediaId ? mediaMap[offering.mediaId] : null;
              const href = offering.cta ? resolvedHrefs[offering.cta.routeId] ?? '#' : '#';
              const isCenterIcon = idx === 0;
              const slideTitle = offering.slideTitle ?? offering.title;

              return (
                <div
                  className="row row-small row-ndv hover_gra"
                  id={slideIds?.row}
                  key={offering.id}
                >
                  <div
                    id={slideIds?.col}
                    className={`col ${slideIds?.isBlur ? 'col-blur-blue ' : ''}medium-4 small-12 large-4`}
                  >
                    <div className="col-inner">
                      <div
                        className="is-border"
                        style={{
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 8,
                          borderWidth: '1px 1px 1px 1px',
                        }}
                      />
                      <div id={slideIds?.titleText} className="text">
                        <h3 style={{ fontFamily: 'Poppins, sans-serif !important' }}>
                          {slideTitle}
                        </h3>
                      </div>
                      <div
                        id={slideIds?.gapTop}
                        className="gap-element clearfix"
                        style={{ display: 'block', height: 'auto' }}
                      />
                      <div
                        className="img has-hover x md-x lg-x y md-y lg-y"
                        id={slideIds?.imageWrapper}
                      >
                        <div
                          className="img-inner image-cover dark"
                          style={{ paddingTop: '100%' }}
                        >
                          {media && (
                            <img
                              decoding="async"
                              src={media.src}
                              className="attachment-original size-original"
                              alt={media.alt ?? ''}
                              loading="lazy"
                            />
                          )}
                        </div>
                      </div>
                      <div
                        id={slideIds?.gapAfterImg}
                        className="gap-element clearfix"
                        style={{ display: 'block', height: 'auto' }}
                      />

                      {items.map((item, itemIdx) => (
                        <div key={itemIdx}>
                          <div
                            className={`icon-box featured-box ${isCenterIcon ? 'icon-center ' : ''}icon-box-left text-left`}
                          >
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
                          {itemIdx < items.length - 1 && (
                            <div
                              id={slideIds?.itemGaps[itemIdx]}
                              className="gap-element clearfix"
                              style={{ display: 'block', height: 'auto' }}
                            />
                          )}
                        </div>
                      ))}

                      <div
                        id={slideIds?.gapBeforeBtn}
                        className="gap-element clearfix"
                        style={{ display: 'block', height: 'auto' }}
                      />
                      {offering.cta && (
                        <p>
                          <Link
                            className="but-lh"
                            style={{ borderRadius: 12 }}
                            href={href}
                          >
                            {offering.cta.label}
                          </Link>
                        </p>
                      )}
                    </div>
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
