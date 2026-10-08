import type { AssetRef } from '@/types/content';

export interface ProjectHeroProps {
  title: string;
  heroImage: AssetRef | null;
}

export function ProjectHero({ title, heroImage }: ProjectHeroProps) {
  return (
    <section className="section" id="section_1523637276">
      <div className="section-bg fill" />

      <div className="section-content relative">
        <div className="banner has-hover" id="banner-1027010616">
          <div className="banner-inner fill">
            <div className="banner-bg fill">
              {heroImage ? (
                <img
                  width={heroImage.width ?? 2000}
                  height={heroImage.height ?? 1125}
                  src={heroImage.src}
                  className="bg attachment-original size-original"
                  alt={heroImage.alt ?? ''}
                  decoding="async"
                  fetchPriority="high"
                  loading="lazy"
                />
              ) : null}
            </div>

            <div className="banner-layers container">
              <div className="fill banner-link" />

              <div
                id="text-box-1343770611"
                className="text-box banner-layer x50 md-x50 lg-x50 y85 md-y50 lg-y50 res-text"
              >
                <div className="text-box-content text dark">
                  <div className="text-inner text-center">
                    <div className="row" id="row-814428364">
                      <div id="col-345468821" className="col medium-11 small-12 large-11">
                        <div className="col-inner">
                          <div id="text-2719039642" className="text kanit-font">
                            <h1 className="current-post-title">{title}</h1>
                          </div>

                          <div id="text-3814173174" className="text">
                            <p style={{ textAlign: 'center' }}>
                              <span style={{ color: '#808080' }}>
                                Trang chủ | Dự án |{/* business-text-ok: source plain text breadcrumb */}
                                <span style={{ color: '#ffffff' }}> Chi tiết</span>{/* business-text-ok: source plain text breadcrumb */}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
