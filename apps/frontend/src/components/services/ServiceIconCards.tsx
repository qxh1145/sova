import { Fragment } from 'react';
import type { AssetRef, Feature, SectionCopy } from '@/types/content';
import { RichText } from '@/components/ui/RichText';

export interface ServiceIconCardIds {
  col: string;
  title: string;
  gap: string;
  body: string;
  /** `.icon-box-img` width in px; defaults to 78. */
  iconWidth?: number;
}

export interface ServiceIconCardsIds {
  section: string;
  topGap: string;
  headingRow: string;
  headingCol: string;
  eyebrowText: string;
  titleText: string;
  cardsRow: string;
  cards: ServiceIconCardIds[];
  /** `hide-for-small` gap closing the section (hosting). */
  bottomGap?: string;
}

export const SERVICE_ICON_CARDS_IDS_HOSTING_VI: ServiceIconCardsIds = {
  section: 'section_2022484527',
  topGap: 'gap-321365980',
  headingRow: 'row-525512148',
  headingCol: 'col-1150091695',
  eyebrowText: 'text-2735797680',
  titleText: 'text-3223517481',
  cardsRow: 'row-1734829222',
  cards: [
    {
      col: 'col-1391564529',
      title: 'text-1022521570',
      gap: 'gap-1305124403',
      body: 'text-89077090',
    },
    {
      col: 'col-1780416078',
      title: 'text-3019330186',
      gap: 'gap-961431367',
      body: 'text-2466185390',
    },
    {
      col: 'col-1992715682',
      title: 'text-1980406795',
      gap: 'gap-1242834847',
      body: 'text-2198112932',
    },
    {
      col: 'col-951063190',
      title: 'text-1401252567',
      gap: 'gap-1087460748',
      body: 'text-570512238',
    },
    {
      col: 'col-1382144940',
      title: 'text-2870938340',
      gap: 'gap-196925432',
      body: 'text-2210734612',
    },
    {
      col: 'col-1406155042',
      title: 'text-3994102220',
      gap: 'gap-1687090695',
      body: 'text-3988691114',
    },
  ],
  bottomGap: 'gap-36235187',
};

export const SERVICE_ICON_CARDS_IDS_HOSTING_EN: ServiceIconCardsIds = {
  section: 'section_1382323701',
  topGap: 'gap-2036005758',
  headingRow: 'row-1049779476',
  headingCol: 'col-2032903248',
  eyebrowText: 'text-493081627',
  titleText: 'text-3882819291',
  cardsRow: 'row-1036861100',
  cards: [
    {
      col: 'col-728512582',
      title: 'text-985887842',
      gap: 'gap-1553408179',
      body: 'text-2403594396',
    },
    {
      col: 'col-400806214',
      title: 'text-166837549',
      gap: 'gap-118419144',
      body: 'text-3940050225',
    },
    {
      col: 'col-729550342',
      title: 'text-101991288',
      gap: 'gap-1384041160',
      body: 'text-462181348',
    },
    {
      col: 'col-77853320',
      title: 'text-1870822417',
      gap: 'gap-1478019676',
      body: 'text-3456792784',
    },
    {
      col: 'col-1759907197',
      title: 'text-4005938621',
      gap: 'gap-134339464',
      body: 'text-4173222304',
    },
    {
      col: 'col-1249473885',
      title: 'text-2395253800',
      gap: 'gap-1997812513',
      body: 'text-3684243239',
    },
  ],
  bottomGap: 'gap-312162410',
};

export const SERVICE_ICON_CARDS_IDS_VPS_VI: ServiceIconCardsIds = {
  section: 'section_753586130',
  topGap: 'gap-497754928',
  headingRow: 'row-161153168',
  headingCol: 'col-422048132',
  eyebrowText: 'text-3080502325',
  titleText: 'text-3580303649',
  cardsRow: 'row-2055882853',
  cards: [
    {
      col: 'col-257346332',
      title: 'text-1059480702',
      gap: 'gap-2116511139',
      body: 'text-283207075',
    },
    {
      col: 'col-983056057',
      title: 'text-3014410459',
      gap: 'gap-861262678',
      body: 'text-278743657',
    },
    {
      col: 'col-311659895',
      title: 'text-96854900',
      gap: 'gap-1481348236',
      body: 'text-2217719742',
      iconWidth: 94,
    },
    {
      col: 'col-1532895588',
      title: 'text-724429596',
      gap: 'gap-844404605',
      body: 'text-2556519848',
      iconWidth: 79,
    },
    {
      col: 'col-2055174283',
      title: 'text-800529527',
      gap: 'gap-1055760616',
      body: 'text-2622731788',
      iconWidth: 80,
    },
    {
      col: 'col-799264595',
      title: 'text-2952772534',
      gap: 'gap-1985204226',
      body: 'text-430500262',
    },
  ],
};

export const SERVICE_ICON_CARDS_IDS_VPS_EN: ServiceIconCardsIds = {
  section: 'section_349332889',
  topGap: 'gap-920479968',
  headingRow: 'row-92252404',
  headingCol: 'col-642156072',
  eyebrowText: 'text-1728805658',
  titleText: 'text-1550670534',
  cardsRow: 'row-1330411492',
  cards: [
    {
      col: 'col-79011763',
      title: 'text-3472592389',
      gap: 'gap-1883913266',
      body: 'text-2771358072',
    },
    {
      col: 'col-1381178742',
      title: 'text-2351777135',
      gap: 'gap-1311415649',
      body: 'text-2483518824',
    },
    {
      col: 'col-535717536',
      title: 'text-1110411412',
      gap: 'gap-591398140',
      body: 'text-2758827398',
      iconWidth: 94,
    },
    {
      col: 'col-1240014598',
      title: 'text-3334442632',
      gap: 'gap-660001997',
      body: 'text-1962907688',
      iconWidth: 79,
    },
    {
      col: 'col-581439608',
      title: 'text-2579007313',
      gap: 'gap-206196107',
      body: 'text-3639828259',
      iconWidth: 80,
    },
    {
      col: 'col-546467495',
      title: 'text-3860827652',
      gap: 'gap-261246525',
      body: 'text-2565163780',
    },
  ],
};

export const SERVICE_ICON_CARDS_IDS_EMAIL_VI: ServiceIconCardsIds = {
  section: 'section_136281833',
  topGap: 'gap-1364641479',
  headingRow: 'row-346934960',
  headingCol: 'col-1550501874',
  eyebrowText: 'text-992473170',
  titleText: 'text-1144763253',
  cardsRow: 'row-1167421910',
  cards: [
    {
      col: 'col-1141403958',
      title: 'text-852335787',
      gap: 'gap-180605023',
      body: 'text-2876889789',
      iconWidth: 60,
    },
    {
      col: 'col-1204001545',
      title: 'text-2399578551',
      gap: 'gap-2137935284',
      body: 'text-4283565623',
      iconWidth: 60,
    },
    {
      col: 'col-78206038',
      title: 'text-2837002741',
      gap: 'gap-358573751',
      body: 'text-1208467542',
      iconWidth: 75,
    },
    {
      col: 'col-317232088',
      title: 'text-30817619',
      gap: 'gap-1157681380',
      body: 'text-708914999',
      iconWidth: 60,
    },
    {
      col: 'col-896913034',
      title: 'text-2199902645',
      gap: 'gap-1017448083',
      body: 'text-3800039018',
      iconWidth: 60,
    },
    {
      col: 'col-1393005518',
      title: 'text-423011978',
      gap: 'gap-653773283',
      body: 'text-3694642610',
      iconWidth: 60,
    },
  ],
};

export const SERVICE_ICON_CARDS_IDS_EMAIL_EN: ServiceIconCardsIds = {
  section: 'section_676662741',
  topGap: 'gap-1514023911',
  headingRow: 'row-832391331',
  headingCol: 'col-969420034',
  eyebrowText: 'text-59254589',
  titleText: 'text-3811370133',
  cardsRow: 'row-1937987832',
  cards: [
    {
      col: 'col-234083237',
      title: 'text-1376557375',
      gap: 'gap-405684514',
      body: 'text-2930920107',
      iconWidth: 60,
    },
    {
      col: 'col-710745342',
      title: 'text-671656355',
      gap: 'gap-2106350822',
      body: 'text-2619531297',
      iconWidth: 60,
    },
    {
      col: 'col-1056316208',
      title: 'text-4018043934',
      gap: 'gap-1620866741',
      body: 'text-4144741985',
      iconWidth: 75,
    },
    {
      col: 'col-577275401',
      title: 'text-1294996525',
      gap: 'gap-246876458',
      body: 'text-2257666443',
      iconWidth: 60,
    },
    {
      col: 'col-1927245720',
      title: 'text-2438175366',
      gap: 'gap-1488257935',
      body: 'text-516314287',
      iconWidth: 60,
    },
    {
      col: 'col-1686403941',
      title: 'text-920438534',
      gap: 'gap-111338782',
      body: 'text-3062435420',
      iconWidth: 60,
    },
  ],
};


export interface ServiceIconCardsProps {
  copy?: SectionCopy;
  benefits: Feature[];
  icons?: AssetRef[];
  bgImage?: AssetRef | null;
  ids: ServiceIconCardsIds;
}

/** Hosting/VPS `section.ss-ndv-seo`: heading plus a 2-column `row_ptien` grid of icon-box cards. */
export function ServiceIconCards({
  copy,
  benefits,
  icons = [],
  bgImage,
  ids,
}: ServiceIconCardsProps) {
  if (!benefits.length) return null;

  return (
    <section className="section ss-ndv-seo" id={ids.section}>
      <div className="section-bg fill">
        {bgImage && (
          <img
            decoding="async"
            width={bgImage.width}
            height={bgImage.height}
            src={bgImage.src}
            className="bg attachment-original size-original"
            alt={bgImage.alt}
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
        {copy && (
          <div className="row" id={ids.headingRow}>
            <div id={ids.headingCol} className="col small-12 large-12">
              <div className="col-inner">
                {copy.eyebrow && (
                  <div id={ids.eyebrowText} className="text">
                    <p>
                      <strong>{copy.eyebrow}</strong>
                      <br />
                    </p>
                  </div>
                )}
                <div id={ids.titleText} className="text">
                  <h2>
                    {(copy.titleLines ?? [copy.title]).map((line, i) => (
                      <Fragment key={i}>
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
                <div className="text-center">
                  <div
                    className="is-divider divider clearfix"
                    style={{ maxWidth: 133, height: 2, backgroundColor: 'rgb(0, 101, 223)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="row align-equal row_ptien" id={ids.cardsRow}>
          {benefits.map((benefit, idx) => {
            const cardIds = ids.cards[idx];
            const icon = icons.find((i) => i.id === benefit.iconId);
            // Source quirks, identical on all four pages: card 3 has no `icon-padding`, cards 1 and 3
            // carry no inline zero margin. Icon widths differ per page (VPS), so they live in the ids.
            return (
              <div key={benefit.id} id={cardIds?.col} className="col medium-6 small-12 large-6">
                <div className="col-inner" style={{ backgroundColor: 'rgba(66, 66, 66, 0.6)' }}>
                  <div
                    className={`icon-box featured-box icon-center-new${idx === 2 ? '' : ' icon-padding'} icon-box-left text-left`}
                    style={idx === 0 || idx === 2 ? undefined : { margin: '0px 0px 0px 0px' }}
                  >
                    <div className="icon-box-img" style={{ width: cardIds?.iconWidth ?? 78 }}>
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
                      <div id={cardIds?.title} className="text">
                        <h3 style={{ fontSize: 24 }}>{benefit.title}</h3>
                      </div>
                      <div
                        id={cardIds?.gap}
                        className="gap-element clearfix"
                        style={{ display: 'block', height: 'auto' }}
                      />
                      <div id={cardIds?.body} className="text" style={{ fontSize: 16 }}>
                        <RichText content={benefit.body} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
