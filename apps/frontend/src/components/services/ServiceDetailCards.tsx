import type { AssetRef, Locale, OfferingPanel, SectionCopy } from '@/types/content';
import { Carousel, type CarouselLabels } from '@/components/ui/Carousel';

export interface ServiceDetailCardsIds {
  section: string;
  headingRow: string;
  headingCol: string;
  headingEyebrow: string;
  headingTitle: string;
  gridRow: string;
  gridCards: {
    col: string;
    titleText: string;
    gap: string;
    itemTexts: string[];
  }[];
  sliderWrapper: string;
  sliderCards: {
    row: string;
    rowClass?: string;
    col: string;
    titleText: string;
    gap: string;
    itemTexts: string[];
  }[];
}


export const SERVICE_DETAIL_CARDS_IDS_VI: ServiceDetailCardsIds = {
  section: 'section_1129413203',
  headingRow: 'row-507392413',
  headingCol: 'col-1698140986',
  headingEyebrow: 'text-2370979570',
  headingTitle: 'text-2281668683',
  gridRow: 'row-599722782',
  gridCards: [
    {
      col: 'col-874958164',
      titleText: 'text-717286693',
      gap: 'gap-1831319049',
      itemTexts: [
        'text-893802695',
        'text-1007617100',
        'text-984975434',
        'text-1101505652',
        'text-453555121',
        'text-2724576710',
        'text-899101357',
      ],
    },
    {
      col: 'col-1518633315',
      titleText: 'text-3008339327',
      gap: 'gap-2066566202',
      itemTexts: [
        'text-2286470154',
        'text-159775562',
        'text-2827935873',
        'text-2956094667',
        'text-3956569031',
        'text-3333625883',
        'text-2422614632',
      ],
    },
    {
      col: 'col-1573324673',
      titleText: 'text-843288158',
      gap: 'gap-1760978027',
      itemTexts: [
        'text-2633362779',
        'text-264055738',
        'text-3778232857',
        'text-695278600',
        'text-1607996520',
        'text-923135666',
        'text-514604901',
      ],
    },
  ],
  sliderWrapper: 'slider-1922721948',
  sliderCards: [
    {
      row: 'row-1170178551',
      col: 'col-629654731',
      titleText: 'text-107236117',
      gap: 'gap-352452340',
      itemTexts: [
        'text-1721685128',
        'text-1027052556',
        'text-823291012',
        'text-2267948686',
        'text-210797736',
        'text-1604501149',
        'text-993766267',
      ],
    },
    {
      row: 'row-1263837408',
      col: 'col-846384690',
      titleText: 'text-95939350',
      gap: 'gap-268219732',
      itemTexts: [
        'text-2221228365',
        'text-4010210200',
        'text-4257121081',
        'text-3769939523',
        'text-1875322960',
        'text-3363365879',
        'text-1349884218',
      ],
    },
    {
      row: 'row-1698305712',
      col: 'col-127976856',
      titleText: 'text-2953284061',
      gap: 'gap-1800262106',
      itemTexts: [
        'text-3510507204',
        'text-2266858485',
        'text-2469446340',
        'text-1365809796',
        'text-3147816654',
        'text-3687352825',
        'text-1854619472',
      ],
    },
  ],
};

export const SERVICE_DETAIL_CARDS_IDS_EN: ServiceDetailCardsIds = {
  section: 'section_1411013231',
  headingRow: 'row-965232782',
  headingCol: 'col-1329677472',
  headingEyebrow: 'text-2332245024',
  headingTitle: 'text-1489102208',
  gridRow: 'row-2041526175',
  gridCards: [
    {
      col: 'col-966976269',
      titleText: 'text-4172167541',
      gap: 'gap-1946254838',
      itemTexts: [
        'text-1584250981',
        'text-2583284428',
        'text-1251735597',
        'text-3419291966',
        'text-354683903',
        'text-4136257796',
        'text-2569728879',
      ],
    },
    {
      col: 'col-1103320728',
      titleText: 'text-203187882',
      gap: 'gap-746555132',
      itemTexts: [
        'text-2779049978',
        'text-1118329240',
        'text-3529606808',
        'text-3902439290',
        'text-3058231548',
        'text-4263029156',
        'text-669982057',
      ],
    },
    {
      col: 'col-1674979791',
      titleText: 'text-838159606',
      gap: 'gap-307480860',
      itemTexts: [
        'text-3624094951',
        'text-452669939',
        'text-1777823125',
        'text-3691976940',
        'text-68863661',
        'text-2118541795',
        'text-2767889266',
      ],
    },
  ],
  sliderWrapper: 'slider-1998309322',
  sliderCards: [
    {
      row: 'row-367726508',
      col: 'col-519193382',
      titleText: 'text-4244325060',
      gap: 'gap-140169176',
      itemTexts: [
        'text-186703450',
        'text-3990106704',
        'text-47989162',
        'text-3760892759',
        'text-751683592',
        'text-1854514942',
        'text-2879145135',
      ],
    },
    {
      row: 'row-429880057',
      col: 'col-332249893',
      titleText: 'text-1216322184',
      gap: 'gap-1507683901',
      itemTexts: [
        'text-1832033067',
        'text-2022479066',
        'text-3658949146',
        'text-3886963022',
        'text-3864237804',
        'text-2059808423',
        'text-2162024509',
      ],
    },
    {
      row: 'row-319218833',
      col: 'col-912580621',
      titleText: 'text-1396918278',
      gap: 'gap-775714332',
      itemTexts: [
        'text-431791202',
        'text-312183449',
        'text-2556170493',
        'text-4071973768',
        'text-4255164492',
        'text-1068577722',
        'text-1450821647',
      ],
    },
  ],
};

export const SERVICE_DETAIL_CARDS_IDS_WEBSITE_VI: ServiceDetailCardsIds = {
  section: 'section_2045360196',
  headingRow: 'row-1518428203',
  headingCol: 'col-1569333820',
  headingEyebrow: 'text-2610696603',
  headingTitle: 'text-1306801483',
  gridRow: 'row-106839715',
  gridCards: [
    {
      col: 'col-1193552611',
      titleText: 'text-928475185',
      gap: 'gap-608623598',
      itemTexts: [
        'text-543767919',
        'text-565384461',
        'text-2702591327',
        'text-663772641',
        'text-2334703959',
        'text-421237886',
        'text-3963051509',
      ],
    },
    {
      col: 'col-738744122',
      titleText: 'text-79520304',
      gap: 'gap-1547391341',
      itemTexts: [
        'text-166137742',
        'text-3546235738',
        'text-1200106463',
        'text-1296799399',
        'text-1751695483',
        'text-2404075628',
        'text-888839690',
      ],
    },
    {
      col: 'col-567249448',
      titleText: 'text-731457928',
      gap: 'gap-709440818',
      itemTexts: [
        'text-3414830680',
        'text-1449847316',
        'text-2379584536',
        'text-602204890',
        'text-4219048527',
        'text-3844543062',
        'text-1965358910',
      ],
    },
  ],
  sliderWrapper: 'slider-1976037433',
  sliderCards: [
    {
      row: 'row-497409351',
      col: 'col-2124065722',
      titleText: 'text-2426393134',
      gap: 'gap-1504813131',
      itemTexts: [
        'text-2857419147',
        'text-4275528809',
        'text-271558410',
        'text-609057464',
        'text-1403335197',
        'text-486502218',
        'text-2353194299',
      ],
    },
    {
      row: 'row-674862051',
      col: 'col-1290359911',
      titleText: 'text-2586431292',
      gap: 'gap-1548174592',
      itemTexts: [
        'text-1725427317',
        'text-2585126597',
        'text-1038688171',
        'text-3026934605',
        'text-2471223182',
        'text-1143386889',
        'text-1177740813',
      ],
    },
    {
      row: 'row-2076056571',
      rowClass: 'row align-equal hover_gra',
      col: 'col-1060787753',
      titleText: 'text-1474222443',
      gap: 'gap-684549068',
      itemTexts: [
        'text-902634206',
        'text-2085580014',
        'text-1167545474',
        'text-2416174111',
        'text-1790126402',
        'text-686264326',
        'text-3468535698',
      ],
    },
  ],
};

export const SERVICE_DETAIL_CARDS_IDS_WEBSITE_EN: ServiceDetailCardsIds = {
  section: 'section_720050151',
  headingRow: 'row-758903368',
  headingCol: 'col-1952769449',
  headingEyebrow: 'text-1499760673',
  headingTitle: 'text-516151424',
  gridRow: 'row-714537549',
  gridCards: [
    {
      col: 'col-1359166462',
      titleText: 'text-2622370424',
      gap: 'gap-1086004528',
      itemTexts: [
        'text-1614520789',
        'text-742811371',
        'text-2347822341',
        'text-2047015367',
        'text-3178043351',
        'text-801003899',
        'text-1217345706',
      ],
    },
    {
      col: 'col-912847152',
      titleText: 'text-1424492535',
      gap: 'gap-1521239104',
      itemTexts: [
        'text-1310382406',
        'text-2749343575',
        'text-821343611',
        'text-171325972',
        'text-179211488',
        'text-4242979008',
        'text-201318270',
      ],
    },
    {
      col: 'col-2085354630',
      titleText: 'text-4202630873',
      gap: 'gap-529248054',
      itemTexts: [
        'text-2372817881',
        'text-1950527604',
        'text-3671351337',
        'text-2112217375',
        'text-937021526',
        'text-1862579519',
        'text-244791935',
      ],
    },
  ],
  sliderWrapper: 'slider-1884506166',
  sliderCards: [
    {
      row: 'row-260142367',
      col: 'col-1582518658',
      titleText: 'text-1514289912',
      gap: 'gap-1737469584',
      itemTexts: [
        'text-2346365267',
        'text-1208172550',
        'text-3094706259',
        'text-52937089',
        'text-3881032034',
        'text-3793677485',
        'text-2685014656',
      ],
    },
    {
      row: 'row-596477572',
      col: 'col-1179635668',
      titleText: 'text-2562581441',
      gap: 'gap-1596921958',
      itemTexts: [
        'text-1318508156',
        'text-2935043096',
        'text-259202561',
        'text-2026997022',
        'text-102055848',
        'text-3522834524',
        'text-1022733857',
      ],
    },
    {
      row: 'row-1909714010',
      rowClass: 'row align-equal hover_gra',
      col: 'col-1006384877',
      titleText: 'text-2506306521',
      gap: 'gap-1157174072',
      itemTexts: [
        'text-2553774199',
        'text-80023855',
        'text-1376530472',
        'text-3644419902',
        'text-1228943975',
        'text-598944686',
        'text-1004364982',
      ],
    },
  ],
};


export const SERVICE_CAROUSEL_LABELS: Record<Locale, CarouselLabels> = {
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

export interface ServiceDetailCardsProps {
  copy?: SectionCopy;
  offerings: OfferingPanel[];
  subtractIcon?: AssetRef | null;
  ids: ServiceDetailCardsIds;
  labels: CarouselLabels;
  sliderClass?: string;
  dots?: boolean;
}

export function ServiceDetailCards({
  copy,
  offerings,
  subtractIcon,
  ids,
  labels,
  sliderClass,
  dots,
}: ServiceDetailCardsProps) {
  if (!offerings.length) return null;

  return (
    <section className="section" id={ids.section}>
      <div className="section-bg fill" />
      <div className="section-content relative">
        {copy && (
          <div className="row" id={ids.headingRow}>
            <div id={ids.headingCol} className="col small-12 large-12">
              <div className="col-inner">
                {copy.eyebrow && (
                  <div id={ids.headingEyebrow} className="text">
                    <h4 style={{ textAlign: 'center' }}>{copy.eyebrow}</h4>
                  </div>
                )}
                <div id={ids.headingTitle} className="text">
                  <h2 style={{ textAlign: 'center' }}>
                    {copy.titleLines && copy.titleLines.length > 1 ? (
                      copy.titleLines.map((line, idx) => (
                        <span key={idx}>
                          {line}
                          {idx < copy.titleLines!.length - 1 && <br />}
                        </span>
                      ))
                    ) : (
                      copy.title
                    )}
                  </h2>
                </div>
                <div className="text-center">
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
          </div>
        )}

        {/* Desktop Grid: hide-for-small (visible >= 550px) */}
        <div
          className="row align-equal hover_gra eras-table-price hide-for-small" // business-text-ok: source CSS class name
          id={ids.gridRow}
        >
          {offerings.map((offering, idx) => {
            const cardIds = ids.gridCards[idx];
            const items = offering.items ?? [];
            return (
              <div
                key={offering.id}
                id={cardIds?.col}
                className="col col-logo medium-4 small-12 large-4"
              >
                <div
                  className="col-inner"
                  style={{ backgroundColor: 'rgba(66, 66, 66, 0.3)' }}
                >
                  <div id={cardIds?.titleText} className="text">
                    <h3>{offering.title}</h3>
                  </div>
                  <div
                    id={cardIds?.gap}
                    className="gap-element clearfix"
                    style={{ display: 'block', height: 'auto' }}
                  />
                  {items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="icon-box featured-box icon-center-new icon-box-left text-left"
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
                        <div id={cardIds?.itemTexts[itemIdx]} className="text">
                          <p>
                            {item}
                            <br />
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Slider: show-for-small (visible <= 549px) */}
        <div
          id={ids.sliderWrapper}
          className={`slider-wrapper relative slide_mobi_new ${sliderClass ?? 'slide_tkap eras-table-price-slider'} show-for-small`} // business-text-ok: source CSS class name
        >
          <Carousel
            align="center"
            loop
            autoplayMs={6000}
            pauseOnHover
            arrows
            dots={dots}
            containScroll="trimSnaps"
            adaptiveHeight
            dragThreshold={10}
            labels={labels}
          >
            {offerings.map((offering, idx) => {
              const cardIds = ids.sliderCards[idx];
              const items = offering.items ?? [];
              return (
                <div className="row" id={cardIds?.row} key={offering.id}>
                  <div
                    id={cardIds?.col}
                    className="col col-logo medium-4 small-12 large-4"
                  >
                    <div
                      className="col-inner"
                      style={{ backgroundColor: 'rgba(66, 66, 66, 0.3)' }}
                    >
                      <div id={cardIds?.titleText} className="text">
                        <h3>{offering.title}</h3>
                      </div>
                      <div
                        id={cardIds?.gap}
                        className="gap-element clearfix"
                        style={{ display: 'block', height: 'auto' }}
                      />
                      {items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="icon-box featured-box icon-center-new icon-box-left text-left"
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
                            <div id={cardIds?.itemTexts[itemIdx]} className="text">
                              <p>
                                {item}
                                <br />
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
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
