import type { AssetRef, Feature, SectionCopy } from '@/types/content';
import { RichText } from '@/components/ui/RichText';

export interface ServiceAdvantageCardIds {
  col: string;
  titleText: string;
  gap: string;
  bodyText: string;
}

export interface ServiceAdvantagesIds {
  section: string;
  /** 30px gap above the heading row. */
  topGap: string;
  headingRow: string;
  headingCol: string;
  headingText: string;
  emptyCol: string;
  decoCol: string;
  decoImg: string;
  bodyRow: string;
  photoCol: string;
  photoImg: string;
  /** Source `srcset` of the photo `<img>`; omitted when the source has none. */
  photoSrcSet?: string;
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

export interface ServiceAdvantagesProps {
  copy: SectionCopy;
  benefits: Feature[];
  photo?: AssetRef | null;
  deco?: AssetRef | null;
  icons?: AssetRef[];
  ids: ServiceAdvantagesIds;
  isEn?: boolean;
}

export function ServiceAdvantages({
  copy,
  benefits,
  photo,
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
          className="gap-element clearfix"
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
                {isEn ? (
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

          <div
            id={ids.emptyCol}
            className="col hide-for-small medium-4 small-12 large-4"
          >
            <div className="col-inner" />
          </div>

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

          <div id={ids.cardsCol} className="col medium-6 small-12 large-6">
            <div className="col-inner">
              <div className="row align-equal" id={ids.cardsRow}>
                {benefits.slice(0, 4).map((benefit, idx) => {
                  const cardIds = ids.cards[idx];
                  const icon = benefit.iconId ? iconMap.get(benefit.iconId) : null;

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
                          <div className="icon-box-img" style={{ width: 80 }}>
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
                              <h3 style={{ fontSize: idx === 0 ? 23 : 24 }}>
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
