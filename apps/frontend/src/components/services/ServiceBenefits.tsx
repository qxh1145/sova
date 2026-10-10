import type { AssetRef, Feature, SectionCopy } from '@/types/content';
import { RichText } from '@/components/ui/RichText';

export interface ServiceBenefitCardIds {
  col: string;
  text1: string;
  gap: string;
  text2: string;
}

export interface ServiceBenefitsIds {
  section: string;
  headingRow: string;
  headingCol: string;
  headingTitle: string;
  contentRow: string;
  videoCol: string;
  videoBanner: string;
  videoTextBox: string;
  cardsCol: string;
  cardsRow: string;
  cards: ServiceBenefitCardIds[];
}

export const SERVICE_BENEFITS_IDS_MOBILE_VI: ServiceBenefitsIds = {
  section: 'section_734451128',
  headingRow: 'row-1905776699',
  headingCol: 'col-1013246810',
  headingTitle: 'text-3729328113',
  contentRow: 'row-2107013568',
  videoCol: 'col-689451356',
  videoBanner: 'banner-80263306',
  videoTextBox: 'text-box-720240919',
  cardsCol: 'col-290694641',
  cardsRow: 'row-1049225699',
  cards: [
    {
      col: 'col-1107898238',
      text1: 'text-3606964785',
      gap: 'gap-1241612579',
      text2: 'text-3528444686',
    },
    {
      col: 'col-1234901397',
      text1: 'text-1529037088',
      gap: 'gap-72988933',
      text2: 'text-3418330489',
    },
    {
      col: 'col-1341407356',
      text1: 'text-3138313917',
      gap: 'gap-1621309933',
      text2: 'text-3958435307',
    },
    {
      col: 'col-1953284001',
      text1: 'text-4042866426',
      gap: 'gap-1644773139',
      text2: 'text-4224952890',
    },
  ],
};

export const SERVICE_BENEFITS_IDS_MOBILE_EN: ServiceBenefitsIds = {
  section: 'section_1647811100',
  headingRow: 'row-956911836',
  headingCol: 'col-1590075551',
  headingTitle: 'text-2187874961',
  contentRow: 'row-22236430',
  videoCol: 'col-127694410',
  videoBanner: 'banner-890056098',
  videoTextBox: 'text-box-1486004339',
  cardsCol: 'col-1688871749',
  cardsRow: 'row-1686488490',
  cards: [
    {
      col: 'col-1028564725',
      text1: 'text-1075051457',
      gap: 'gap-2047972399',
      text2: 'text-3882033988',
    },
    {
      col: 'col-52466821',
      text1: 'text-878573774',
      gap: 'gap-1331237475',
      text2: 'text-2811376062',
    },
    {
      col: 'col-76368244',
      text1: 'text-318033016',
      gap: 'gap-1576401530',
      text2: 'text-3293090217',
    },
    {
      col: 'col-165769692',
      text1: 'text-4092833135',
      gap: 'gap-248676304',
      text2: 'text-3159529508',
    },
  ],
};

export interface ServiceBenefitsProps {
  copy?: SectionCopy;
  benefits: Feature[];
  video?: AssetRef | null;
  icons?: AssetRef[];
  ids: ServiceBenefitsIds;
}

export function ServiceBenefits({
  copy,
  benefits,
  video,
  icons = [],
  ids,
}: ServiceBenefitsProps) {
  if (!benefits.length && !video) return null;

  return (
    <section className="section" id={ids.section}>
      <div className="section-bg fill" />
      <div className="section-content relative">
        {copy && (
          <div className="row" id={ids.headingRow}>
            <div id={ids.headingCol} className="col medium-8 small-12 large-8">
              <div className="col-inner">
                {copy.eyebrow && (
                  <p>
                    <strong>
                      <span style={{ color: '#0065df' }}>{copy.eyebrow}</span>
                    </strong>
                  </p>
                )}
                <div id={ids.headingTitle} className="text">
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

        <div className="row" id={ids.contentRow}>
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
                    <div
                      id={ids.videoTextBox}
                      className="text-box banner-layer x50 md-x50 lg-x50 y50 md-y50 lg-y50 res-text"
                    >
                      <div className="text-box-content text dark">
                        <div className="text-inner text-center" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id={ids.cardsCol} className="col medium-6 small-12 large-6">
            <div className="col-inner">
              <div className="row align-equal row_ptien" id={ids.cardsRow}>
                {benefits.map((benefit, idx) => {
                  const cardIds = ids.cards[idx];
                  const icon = icons.find((i) => i.id === benefit.iconId);
                  return (
                    <div
                      key={benefit.id}
                      id={cardIds?.col}
                      className="col medium-6 small-12 large-6"
                    >
                      <div
                        className="col-inner"
                        style={{ backgroundColor: 'rgba(66, 66, 77, 0.259)' }}
                      >
                        <div
                          className="icon-box featured-box icon-box-left text-left"
                          style={{ margin: '0px 0px 0px 0px' }}
                        >
                          <div className="icon-box-img" style={{ width: 70 }}>
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
                            <div id={cardIds?.text1} className="text">
                              <h3>{benefit.title}</h3>
                            </div>
                            <div
                              id={cardIds?.gap}
                              className="gap-element clearfix"
                              style={{ display: 'block', height: 'auto' }}
                            />
                            {benefit.body && (
                              <div id={cardIds?.text2} className="text">
                                <RichText content={benefit.body} />
                              </div>
                            )}
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
