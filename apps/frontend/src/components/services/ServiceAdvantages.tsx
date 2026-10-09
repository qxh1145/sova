import type { AssetRef, Feature, SectionCopy } from '@/types/content';
import { RichText } from '@/components/ui/RichText';

export interface ServiceAdvantageCardIds {
  col: string;
  titleText: string;
  gap: string;
  bodyText: string;
  iconWidth?: number;
}

export interface ServiceAdvantagesIds {
  section: string;
  /** 30px gap above the heading row. */
  topGap: string;
  topGapClass?: string;
  headingRow: string;
  headingCol: string;
  headingText: string;
  headingTag?: 'h2' | 'h3';
  emptyCol?: string;
  subtitleCol?: string;
  subtitleText?: string;
  decoCol: string;
  decoImg: string;
  bodyRow: string;
  photoCol?: string;
  photoImg?: string;
  /** Source `srcset` of the photo `<img>`; omitted when the source has none. */
  photoSrcSet?: string;
  videoCol?: string;
  videoBanner?: string;
  videoTextBox?: string;
  cardsCol: string;
  cardsRow: string;
  cards: ServiceAdvantageCardIds[];
}

const SEO_PHOTO_SRCSET =
  '/wp-content/uploads/2024/02/arthur-osipyan-5OyvN4Yx46E-unsplash.webp 1000w, /wp-content/uploads/2024/02/arthur-osipyan-5OyvN4Yx46E-unsplash-320x400.webp 320w, /wp-content/uploads/2024/02/arthur-osipyan-5OyvN4Yx46E-unsplash-640x800.webp 640w, /wp-content/uploads/2024/02/arthur-osipyan-5OyvN4Yx46E-unsplash-768x960.webp 768w';

export const SERVICE_ADVANTAGES_IDS_SEO_VI: ServiceAdvantagesIds = {
  section: 'section_922596210',
  topGap: 'gap-317319870',
  headingRow: 'row-1348957617',
  headingCol: 'col-1321606406',
  headingText: 'text-1694087428',
  emptyCol: 'col-1114956286',
  decoCol: 'col-1663871161',
  decoImg: 'image_815087003',
  bodyRow: 'row-19869988',
  photoCol: 'col-1242512278',
  photoImg: 'image_1758650088',
  photoSrcSet: SEO_PHOTO_SRCSET,
  cardsCol: 'col-239772777',
  cardsRow: 'row-2091606999',
  cards: [
    {
      col: 'col-1004405621',
      titleText: 'text-4020482493',
      gap: 'gap-811213438',
      bodyText: 'text-661092211',
    },
    {
      col: 'col-405458599',
      titleText: 'text-1253054858',
      gap: 'gap-335142353',
      bodyText: 'text-1793812432',
    },
    {
      col: 'col-1549880830',
      titleText: 'text-4257372446',
      gap: 'gap-1193197789',
      bodyText: 'text-3783495525',
    },
    {
      col: 'col-1627455047',
      titleText: 'text-758441135',
      gap: 'gap-1152063422',
      bodyText: 'text-4016468429',
    },
  ],
};

export const SERVICE_ADVANTAGES_IDS_SEO_EN: ServiceAdvantagesIds = {
  section: 'section_1367982414',
  topGap: 'gap-1060614001',
  headingRow: 'row-1716765680',
  headingCol: 'col-206688807',
  headingText: 'text-2321965541',
  emptyCol: 'col-1610683665',
  decoCol: 'col-840967355',
  decoImg: 'image_2057552245',
  bodyRow: 'row-1190004748',
  photoCol: 'col-1545747609',
  photoImg: 'image_996127523',
  photoSrcSet: SEO_PHOTO_SRCSET,
  cardsCol: 'col-862225993',
  cardsRow: 'row-1613739936',
  cards: [
    {
      col: 'col-1116748265',
      titleText: 'text-980115225',
      gap: 'gap-2077257392',
      bodyText: 'text-2621469381',
    },
    {
      col: 'col-1398655703',
      titleText: 'text-233624041',
      gap: 'gap-1795031388',
      bodyText: 'text-964664822',
    },
    {
      col: 'col-597429192',
      titleText: 'text-2660537588',
      gap: 'gap-1356146111',
      bodyText: 'text-2312787461',
    },
    {
      col: 'col-1129026964',
      titleText: 'text-1254857030',
      gap: 'gap-920738308',
      bodyText: 'text-104066011',
    },
  ],
};

export const SERVICE_ADVANTAGES_IDS_BRANDING_VI: ServiceAdvantagesIds = {
  section: 'section_1240484658',
  topGap: 'gap-1534842904',
  topGapClass: 'gap-element clearfix hide-for-small',
  headingRow: 'row-1559929790',
  headingCol: 'col-855511650',
  headingText: 'text-2661005078',
  headingTag: 'h2',
  subtitleCol: 'col-1569647061',
  subtitleText: 'text-1581880995',
  decoCol: 'col-1326286860',
  decoImg: 'image_1727408718',
  bodyRow: 'row-436213924',
  videoCol: 'col-604455658',
  videoBanner: 'banner-1710603312',
  videoTextBox: 'text-box-30098105',
  cardsCol: 'col-1005688820',
  cardsRow: 'row-866241373',
  cards: [
    {
      col: 'col-2137141414',
      iconWidth: 80,
      titleText: 'text-3883307467',
      gap: 'gap-1207970856',
      bodyText: 'text-1089134732',
    },
    {
      col: 'col-1449850737',
      iconWidth: 79,
      titleText: 'text-3306712038',
      gap: 'gap-714157089',
      bodyText: 'text-966016600',
    },
    {
      col: 'col-1623933965',
      iconWidth: 80,
      titleText: 'text-2408829993',
      gap: 'gap-2110858663',
      bodyText: 'text-3207918632',
    },
    {
      col: 'col-1611261011',
      iconWidth: 80,
      titleText: 'text-3397838642',
      gap: 'gap-1727674366',
      bodyText: 'text-1221595570',
    },
  ],
};

export const SERVICE_ADVANTAGES_IDS_BRANDING_EN: ServiceAdvantagesIds = {
  section: 'section_1111233762',
  topGap: 'gap-313452462',
  topGapClass: 'gap-element clearfix hide-for-small',
  headingRow: 'row-1898328253',
  headingCol: 'col-54327341',
  headingText: 'text-3737092904',
  headingTag: 'h2',
  subtitleCol: 'col-1767649827',
  subtitleText: 'text-3021092962',
  decoCol: 'col-1653993460',
  decoImg: 'image_1583733878',
  bodyRow: 'row-1635133784',
  videoCol: 'col-1059066968',
  videoBanner: 'banner-1221640554',
  videoTextBox: 'text-box-955101577',
  cardsCol: 'col-439343163',
  cardsRow: 'row-264186657',
  cards: [
    {
      col: 'col-815265702',
      iconWidth: 80,
      titleText: 'text-459149871',
      gap: 'gap-1047647397',
      bodyText: 'text-3193686016',
    },
    {
      col: 'col-2035926715',
      iconWidth: 79,
      titleText: 'text-607120311',
      gap: 'gap-1564692039',
      bodyText: 'text-2218327683',
    },
    {
      col: 'col-1754483910',
      iconWidth: 80,
      titleText: 'text-767047930',
      gap: 'gap-1120019101',
      bodyText: 'text-2030543088',
    },
    {
      col: 'col-1163761657',
      iconWidth: 80,
      titleText: 'text-3466760265',
      gap: 'gap-2016256232',
      bodyText: 'text-3201549338',
    },
  ],
};

export interface ServiceAdvantagesProps {
  copy: SectionCopy;
  benefits: Feature[];
  photo?: AssetRef | null;
  video?: AssetRef | null;
  deco?: AssetRef | null;
  icons?: AssetRef[];
  ids: ServiceAdvantagesIds;
  isEn?: boolean;
}

export function ServiceAdvantages({
  copy,
  benefits,
  photo,
  video,
  deco,
  icons = [],
  ids,
  isEn = false,
}: ServiceAdvantagesProps) {
  const iconMap = new Map(icons.map((icon) => [icon.id, icon]));

  return (
    <section className="section" id={ids.section}>
      <div className="section-bg fill" />

      <div className="section-content relative">
        <div
          id={ids.topGap}
          className={ids.topGapClass ?? 'gap-element clearfix'}
          style={{ display: 'block', height: 'auto' }}
        />
        <div className="row align-bottom" id={ids.headingRow}>
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
                {ids.headingTag === 'h2' ? (
                  <h2>{copy.title}</h2>
                ) : ids.headingTag === 'h3' ? (
                  <h3>
                    <strong>{copy.title}</strong>
                  </h3>
                ) : isEn ? (
                  <h3>
                    <strong>{copy.title}</strong>
                  </h3>
                ) : (
                  <h2>{copy.title}</h2>
                )}
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

          {ids.subtitleCol && ids.subtitleText && copy.description ? (
            <div id={ids.subtitleCol} className="col medium-6 small-12 large-6">
              <div className="col-inner">
                <div id={ids.subtitleText} className="text">
                  <p>
                    {copy.description}
                    <br />
                  </p>
                </div>
              </div>
            </div>
          ) : (
            ids.emptyCol && (
              <div
                id={ids.emptyCol}
                className="col hide-for-small medium-4 small-12 large-4"
              >
                <div className="col-inner" />
              </div>
            )
          )}

          <div
            id={ids.decoCol}
            className="col hide-for-small medium-2 small-12 large-2"
          >
            <div className="col-inner">
              {deco && (
                <div
                  className="img has-hover x md-x lg-x y md-y lg-y"
                  id={ids.decoImg}
                >
                  <div className="img-inner dark">
                    <img
                      decoding="async"
                      src={deco.src}
                      className="attachment-original size-original"
                      alt={deco.alt ?? ''}
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row" id={ids.bodyRow}>
          {ids.videoCol && ids.videoBanner && (
            <div id={ids.videoCol} className="col medium-6 small-12 large-6">
              <div className="col-inner">
                <div className="banner has-hover has-video" id={ids.videoBanner}>
                  <div className="banner-inner fill">
                    <div className="banner-bg fill">
                      <div className="video-overlay no-click fill visible" />
                      {video && (
                        <video
                          className="video-bg fill visible"
                          preload="auto"
                          playsInline
                          autoPlay
                          muted
                          loop
                        >
                          <source src={video.src} type="video/mp4" />
                        </video>
                      )}
                    </div>
                    <div className="banner-layers container">
                      <div className="fill banner-link" />
                      {ids.videoTextBox && (
                        <div
                          id={ids.videoTextBox}
                          className="text-box banner-layer x50 md-x50 lg-x50 y50 md-y50 lg-y50 res-text"
                        >
                          <div className="text-box-content text dark">
                            <div className="text-inner text-center" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ids.photoCol && (
            <div id={ids.photoCol} className="col medium-6 small-12 large-6">
              <div className="col-inner">
                {photo && (
                  <div
                    className="img has-hover x md-x lg-x y md-y lg-y"
                    id={ids.photoImg}
                  >
                    <div className="img-inner dark">
                      <img
                        decoding="async"
                        width={photo.width ?? 1000}
                        height={photo.height ?? 1250}
                        src={photo.src}
                        className="attachment-original size-original"
                        alt={photo.alt ?? ''}
                        srcSet={ids.photoSrcSet}
                        sizes={ids.photoSrcSet && 'auto, (max-width: 1000px) 100vw, 1000px'}
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div id={ids.cardsCol} className="col medium-6 small-12 large-6">
            <div className="col-inner">
              <div className="row align-equal" id={ids.cardsRow}>
                {benefits.slice(0, 4).map((benefit, idx) => {
                  const cardIds = ids.cards[idx];
                  const icon = benefit.iconId ? iconMap.get(benefit.iconId) : null;
                  const iconWidth = cardIds?.iconWidth ?? 80;

                  return (
                    <div
                      key={benefit.id}
                      id={cardIds?.col}
                      className="col small-12 large-12"
                    >
                      <div
                        className="col-inner"
                        style={{ backgroundColor: 'rgba(66, 66, 77, 0.259)' }}
                      >
                        <div
                          className="icon-box featured-box icon-center-new icon-box-left text-left"
                          style={{ margin: '0px 0px 0px 0px' }}
                        >
                          <div className="icon-box-img" style={{ width: iconWidth }}>
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
                            <div id={cardIds?.titleText} className="text">
                              <h3 style={{ fontSize: cardIds?.iconWidth ? 24 : idx === 0 ? 23 : 24 }}>
                                {benefit.title}
                              </h3>
                            </div>
                            <div
                              id={cardIds?.gap}
                              className="gap-element clearfix"
                              style={{ display: 'block', height: 'auto' }}
                            />
                            <div id={cardIds?.bodyText} className="text">
                              <RichText content={benefit.body} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
