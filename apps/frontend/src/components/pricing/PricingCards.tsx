import type { AssetRef, PricingFeature, PricingPlan, SectionCopy } from '@/types/content';
import { Carousel, type CarouselLabels } from '@/components/ui/Carousel';

export interface PricingCardIds {
  col: string;
  nameText: string;
  saleText?: string;
  gaps: string[];
  itemTexts: string[];
  ctaText: string;
}

export interface PricingSlideIds {
  row: string;
  rowClass?: string;
  col: string;
  nameText: string;
  saleText?: string;
  gaps: string[];
  itemTexts: string[];
  ctaText: string;
}

export interface PricingCardsIds {
  section: string;
  sectionClass?: string;
  headingRow: string;
  headingCol: string;
  eyebrowText?: string;
  titleText: string;
  gridRow: string;
  gridCards: PricingCardIds[];
  sliderWrapper: string;
  sliderCards: PricingSlideIds[];
}

export const PRICING_CARDS_IDS_VI: PricingCardsIds = {
  section: 'section_1346750226',
  sectionClass: 'section ss_bgia',
  headingRow: 'row-601203134',
  headingCol: 'col-707291879',
  eyebrowText: 'text-1256755714',
  titleText: 'text-2155772029',
  gridRow: 'row-1975763604',
  gridCards: [
    {
      col: 'col-1193132698',
      nameText: 'text-618526668',
      saleText: 'text-2033414474',
      gaps: [
        'gap-934927989',
        'gap-2020121822',
        'gap-332696654',
        'gap-1589512444',
        'gap-266387439',
        'gap-1448436429',
        'gap-850637184',
        'gap-1820139491',
        'gap-939408004',
        'gap-1678118147',
        'gap-1516483533',
      ],
      itemTexts: [
        'text-616953601',
        'text-1277389209',
        'text-261944541',
        'text-971865888',
        'text-2246523944',
        'text-1686741625',
        'text-2738812565',
        'text-4230181446',
        'text-4065384248',
      ],
      ctaText: 'text-249967277',
    },
    {
      col: 'col-1616678916',
      nameText: 'text-3905067836',
      saleText: 'text-1237160424',
      gaps: [
        'gap-703815946',
        'gap-1668647484',
        'gap-2122424788',
        'gap-988901678',
        'gap-1092087263',
        'gap-1478116953',
        'gap-820771722',
        'gap-1946720798',
        'gap-806217736',
        'gap-877980300',
        'gap-365612587',
      ],
      itemTexts: [
        'text-4063997536',
        'text-3051382146',
        'text-3229660995',
        'text-2308725802',
        'text-1326466784',
        'text-3092258725',
        'text-4104442027',
        'text-1004708176',
        'text-836039675',
      ],
      ctaText: 'text-3722064831',
    },
    {
      col: 'col-1845410733',
      nameText: 'text-2610280572',
      saleText: 'text-3727827596',
      gaps: [
        'gap-928114875',
        'gap-341512643',
        'gap-2033595343',
        'gap-1584894707',
        'gap-1459604366',
        'gap-1244812812',
        'gap-747707284',
        'gap-1849636970',
        'gap-144113672',
        'gap-135343918',
        'gap-1091972004',
      ],
      itemTexts: [
        'text-3543487458',
        'text-3233579015',
        'text-605253744',
        'text-1369554211',
        'text-1396278646',
        'text-3155796504',
        'text-2171265076',
        'text-2683774768',
        'text-2173836353',
      ],
      ctaText: 'text-1080230112',
    },
  ],
  sliderWrapper: 'slider-74016963',
  sliderCards: [
    {
      row: 'row-1979029428',
      col: 'col-802448555',
      nameText: 'text-3066342010',
      saleText: 'text-858924070',
      gaps: [
        'gap-423665532',
        'gap-1442760950',
        'gap-300578889',
        'gap-835924633',
        'gap-1866897279',
        'gap-57782086',
        'gap-186752315',
        'gap-1241124405',
        'gap-693382484',
        'gap-1223406201',
        'gap-733400339',
      ],
      itemTexts: [
        'text-2665357354',
        'text-2924874121',
        'text-1944338864',
        'text-1232442065',
        'text-620934015',
        'text-3306630566',
        'text-2835122316',
        'text-2713562600',
        'text-2494789849',
      ],
      ctaText: 'text-2871033536',
    },
    {
      row: 'row-505963079',
      col: 'col-1984606080',
      nameText: 'text-810231181',
      saleText: 'text-2664077248',
      gaps: [
        'gap-2066164970',
        'gap-1321054149',
        'gap-1121987849',
        'gap-1178486733',
        'gap-91765138',
        'gap-467914099',
        'gap-498899048',
        'gap-458762694',
        'gap-1258162591',
        'gap-1409172111',
        'gap-1556015951',
      ],
      itemTexts: [
        'text-369788820',
        'text-3072039313',
        'text-1333421421',
        'text-2005118776',
        'text-4198944142',
        'text-3292868379',
        'text-143678567',
        'text-1527007439',
        'text-1275385238',
      ],
      ctaText: 'text-3274271576',
    },
    {
      row: 'row-1317170984',
      rowClass: 'row align-equal hover_gra',
      col: 'col-1872224934',
      nameText: 'text-3265646724',
      saleText: 'text-1810219378',
      gaps: [
        'gap-727557260',
        'gap-1490562293',
        'gap-1612558284',
        'gap-2106043711',
        'gap-21337938',
        'gap-245946967',
        'gap-1959161835',
        'gap-126380378',
        'gap-1439273908',
        'gap-978224037',
        'gap-1809228546',
      ],
      itemTexts: [
        'text-2682356215',
        'text-3772882834',
        'text-567259298',
        'text-2801906086',
        'text-3396672341',
        'text-859765619',
        'text-931054064',
        'text-2829178141',
        'text-959485763',
      ],
      ctaText: 'text-2616016794',
    },
  ],
};

export const PRICING_CARDS_IDS_EN: PricingCardsIds = {
  section: 'section_1856214289',
  sectionClass: 'section',
  headingRow: 'row-1651920418',
  headingCol: 'col-2087406719',
  eyebrowText: 'text-2535450801',
  titleText: 'text-990738754',
  gridRow: 'row-308766213',
  gridCards: [
    {
      col: 'col-1404357043',
      nameText: 'text-3338143957',
      gaps: [
        'gap-402808006',
        'gap-216393598',
        'gap-584182767',
        'gap-532791673',
        'gap-715514475',
        'gap-1156850303',
        'gap-519743589',
        'gap-1631953478',
        'gap-74090071',
        'gap-825299862',
        'gap-359108839',
      ],
      itemTexts: [
        'text-1530554368',
        'text-3651507773',
        'text-2711608492',
        'text-2010358678',
        'text-1245615957',
        'text-794731643',
        'text-1530116617',
        'text-1737225572',
        'text-3952829532',
      ],
      ctaText: 'text-2771970062',
    },
    {
      col: 'col-1611905751',
      nameText: 'text-1054214040',
      gaps: [
        'gap-1842672675',
        'gap-1550037622',
        'gap-1189096400',
        'gap-1763203457',
        'gap-1271194900',
        'gap-739082650',
        'gap-1310536191',
        'gap-235725628',
        'gap-2025135512',
        'gap-759526346',
        'gap-333752572',
      ],
      itemTexts: [
        'text-1224350755',
        'text-11240041',
        'text-1887790806',
        'text-3016164002',
        'text-1566564316',
        'text-657859261',
        'text-3532048479',
        'text-3090214681',
        'text-859965960',
      ],
      ctaText: 'text-2115848735',
    },
    {
      col: 'col-474346414',
      nameText: 'text-849536401',
      gaps: [
        'gap-388775905',
        'gap-628094809',
        'gap-123280130',
        'gap-774763607',
        'gap-1789388297',
        'gap-1232963230',
        'gap-586656085',
        'gap-1581847332',
        'gap-1455431206',
        'gap-329519309',
        'gap-1649488327',
      ],
      itemTexts: [
        'text-4000326537',
        'text-3277279985',
        'text-2269648510',
        'text-4114044857',
        'text-3907382456',
        'text-3518483769',
        'text-299368860',
        'text-2712251261',
        'text-3604532734',
      ],
      ctaText: 'text-814523304',
    },
  ],
  sliderWrapper: 'slider-1604990153',
  sliderCards: [
    {
      row: 'row-1485987383',
      col: 'col-2136415075',
      nameText: 'text-3699749362',
      gaps: [
        'gap-817553804',
        'gap-931443053',
        'gap-620189608',
        'gap-2138291034',
        'gap-357864653',
        'gap-254314028',
        'gap-535357277',
        'gap-248119345',
        'gap-2055001889',
        'gap-210625387',
        'gap-347248245',
      ],
      itemTexts: [
        'text-3461175523',
        'text-1863729879',
        'text-2030535822',
        'text-583362782',
        'text-925977145',
        'text-3506412088',
        'text-4062071185',
        'text-233412753',
        'text-3484328604',
      ],
      ctaText: 'text-326963127',
    },
    {
      row: 'row-1382515263',
      col: 'col-36583368',
      nameText: 'text-579737648',
      gaps: [
        'gap-1335742673',
        'gap-1262428389',
        'gap-408196158',
        'gap-1081427064',
        'gap-494781021',
        'gap-1744512658',
        'gap-900307224',
        'gap-722800124',
        'gap-431237580',
        'gap-206727025',
        'gap-1824520651',
      ],
      itemTexts: [
        'text-3033053916',
        'text-543265617',
        'text-3595582879',
        'text-3182562199',
        'text-2066372475',
        'text-2932393018',
        'text-635235389',
        'text-442953415',
        'text-1830939332',
      ],
      ctaText: 'text-1210989508',
    },
    {
      row: 'row-624010035',
      rowClass: 'row align-equal hover_gra',
      col: 'col-658105411',
      nameText: 'text-2435859454',
      gaps: [
        'gap-1002685138',
        'gap-67325995',
        'gap-2068808841',
        'gap-1879318908',
        'gap-376174786',
        'gap-493010979',
        'gap-1700062339',
        'gap-748695914',
        'gap-806783353',
        'gap-1321968595',
        'gap-576962462',
      ],
      itemTexts: [
        'text-2504228754',
        'text-1962000018',
        'text-1794056488',
        'text-577067347',
        'text-1291209963',
        'text-3911509382',
        'text-49660572',
        'text-3190930820',
        'text-1199422696',
      ],
      ctaText: 'text-1693989780',
    },
  ],
};

function renderCardName(plan: PricingPlan, isSlider: boolean) {
  if (plan.price && plan.originalPrice) {
    if (isSlider) {
      return (
        <>
          <h3>{plan.name}</h3>
          <p className="gia_giam">{plan.originalPrice.displayText}</p>
          <h3>
            {plan.recommended ? (
              <span style={{ color: '#0065df', fontSize: '140%' }}>{plan.price.displayText}</span>
            ) : (
              <span style={{ fontSize: '140%' }}>
                {plan.id.includes('professional') ? `+${plan.price.displayText}` : plan.price.displayText}
              </span>
            )}
          </h3>
        </>
      );
    }
    return (
      <>
        <h3 style={{ fontSize: 24 }}>{plan.name}</h3>
        <p className="gia_giam">{plan.originalPrice.displayText}</p>
        <h3 style={{ fontSize: 30 }}>
          {plan.recommended ? (
            <span style={{ color: '#0065df' }}>{plan.price.displayText}</span>
          ) : plan.id.includes('professional') ? (
            `+${plan.price.displayText}`
          ) : (
            plan.price.displayText
          )}
        </h3>
      </>
    );
  }

  return isSlider ? <h3>{plan.name}</h3> : <h3 style={{ fontSize: 24 }}>{plan.name}</h3>;
}

export function PricingCardInner({
  plan,
  features,
  cardIds,
  icon,
  subtractIcon,
  isSlider = false,
}: {
  plan: PricingPlan;
  features: PricingFeature[];
  cardIds: PricingCardIds;
  icon?: AssetRef | null;
  subtractIcon?: AssetRef | null;
  isSlider?: boolean;
}) {
  const planFeatures = plan.featureIds.map((id) => features.find((f) => f.id === id)?.label ?? id);

  return (
    <div className="col-inner" style={{ backgroundColor: 'rgba(66, 66, 66, 0.3)' }}>
      <div
        className="is-border"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          borderWidth: '2px 2px 2px 2px',
        }}
      />
      <div className="icon-box featured-box icon-tke icon-box-center text-center">
        <div className="icon-box-img" style={{ width: 100 }}>
          <div className="icon">
            <div className="icon-inner">
              {icon && (
                <img
                  decoding="async"
                  width={icon.width ?? 1}
                  height={icon.height ?? 1}
                  src={icon.src}
                  className="attachment-medium size-medium"
                  alt={icon.alt ?? ''}
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
        <div className="icon-box-text last-reset">
          <div id={cardIds.nameText} className="text">
            {renderCardName(plan, isSlider)}
          </div>
          {cardIds.saleText && plan.discountLabel && (
            <div id={cardIds.saleText} className="text text_sale">
              <h3>{plan.discountLabel}</h3>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <div
          className="is-divider divider clearfix"
          style={{ maxWidth: 133, height: 2, backgroundColor: 'rgb(0, 101, 223)' }}
        />
      </div>

      {planFeatures.map((label, idx) => (
        <div key={idx}>
          <div
            id={cardIds.gaps[idx]}
            className="gap-element clearfix"
            style={{ display: 'block', height: 'auto' }}
          />
          <div className="icon-box featured-box icon-center icon-box-left text-left">
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
              <div id={cardIds.itemTexts[idx]} className="text">
                <p>
                  {label}
                  <br />
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {cardIds.gaps[9] && (
        <div
          id={cardIds.gaps[9]}
          className="gap-element clearfix"
          style={{ display: 'block', height: 'auto' }}
        />
      )}
      {cardIds.gaps[10] && (
        <div
          id={cardIds.gaps[10]}
          className="gap-element clearfix"
          style={{ display: 'block', height: 'auto' }}
        />
      )}

      <div id={cardIds.ctaText} className="text">
        <p>
          <a
            className="but-lh"
            style={{ borderRadius: 12 }}
            href={plan.cta.href}
            target={plan.cta.external ? '_blank' : undefined}
            rel={plan.cta.external ? 'noopener' : undefined}
          >
            {plan.cta.label}
          </a>
          <br />
        </p>
      </div>
    </div>
  );
}

export interface PricingCardsSliderProps {
  plans: PricingPlan[];
  features?: PricingFeature[];
  sliderCards: PricingSlideIds[];
  sliderWrapperId: string;
  planIcons?: (AssetRef | null | undefined)[];
  subtractIcon?: AssetRef | null;
  labels: CarouselLabels;
}

export function PricingCardsSlider({
  plans,
  features = [],
  sliderCards,
  sliderWrapperId,
  planIcons = [],
  subtractIcon,
  labels,
}: PricingCardsSliderProps) {
  return (
    <div
      className="slider-wrapper relative slide_mobi_new slide_tke1 eras-table-price-slider show-for-small" // business-text-ok: source CSS class name
      id={sliderWrapperId}
    >
      <Carousel
        className="slider slider-nav-circle slider-nav-large slider-nav-light slider-style-container"
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
        {plans.map((plan, idx) => {
          const slide = sliderCards[idx];
          if (!slide) return null;
          const colClass = `col col-logo-tke ${plan.recommended ? 'col-blur-blue ' : ''}medium-4 small-12 large-4`;
          return (
            <div key={plan.id} className={slide.rowClass ?? 'row'} id={slide.row}>
              <div id={slide.col} className={colClass}>
                <PricingCardInner
                  plan={plan}
                  features={features}
                  cardIds={slide}
                  icon={planIcons[idx]}
                  subtractIcon={subtractIcon}
                  isSlider
                />
              </div>
            </div>
          );
        })}
      </Carousel>
    </div>
  );
}

export interface PricingCardsProps {
  copy?: SectionCopy;
  plans: PricingPlan[];
  features: PricingFeature[];
  planIcons?: (AssetRef | null | undefined)[];
  subtractIcon?: AssetRef | null;
  ids: PricingCardsIds;
  labels: CarouselLabels;
}

export function PricingCards({
  copy,
  plans,
  features,
  planIcons = [],
  subtractIcon,
  ids,
  labels,
}: PricingCardsProps) {
  const isEn = ids.sliderWrapper === 'slider-1604990153';

  const headingContent = (
    <div className="row" id={ids.headingRow}>
      <div id={ids.headingCol} className="col small-12 large-12">
        <div className="col-inner">
          {copy?.eyebrow && (
            <div id={ids.eyebrowText} className="text">
              <h4 style={{ textAlign: 'center' }}>{copy.eyebrow}</h4>
            </div>
          )}
          <div id={ids.titleText} className="text">
            <h2 style={{ textAlign: 'center' }}>{copy?.title}</h2>
          </div>
          <div className="text-center">
            <div
              className="is-divider divider clearfix"
              style={{ maxWidth: 133, height: 2, backgroundColor: 'rgb(0, 101, 223)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const gridContent = (
    <div
      className="row align-equal hover_gra hover_border eras-table-price hide-for-small" // business-text-ok: source CSS class name
      id={ids.gridRow}
    >
      {plans.map((plan, idx) => {
        const cardIds = ids.gridCards[idx];
        if (!cardIds) return null;
        const colClass = `col col-logo-tke ${plan.recommended ? 'col-blur-blue ' : ''}medium-4 small-12 large-4`;
        return (
          <div key={plan.id} id={cardIds.col} className={colClass}>
            <PricingCardInner
              plan={plan}
              features={features}
              cardIds={cardIds}
              icon={planIcons[idx]}
              subtractIcon={subtractIcon}
            />
          </div>
        );
      })}
    </div>
  );

  const sliderComponent = (
    <PricingCardsSlider
      plans={plans}
      features={features}
      sliderCards={ids.sliderCards}
      sliderWrapperId={ids.sliderWrapper}
      planIcons={planIcons}
      subtractIcon={subtractIcon}
      labels={labels}
    />
  );

  if (isEn) {
    return (
      <>
        <section className={ids.sectionClass ?? 'section'} id={ids.section}>
          <div className="section-bg fill" />
          <div className="section-content relative">
            {headingContent}
            {gridContent}
          </div>
        </section>
        {sliderComponent}
      </>
    );
  }

  return (
    <section className={ids.sectionClass ?? 'section'} id={ids.section}>
      <div className="section-bg fill" />
      <div className="section-content relative">
        {headingContent}
        {gridContent}
        {sliderComponent}
      </div>
    </section>
  );
}
