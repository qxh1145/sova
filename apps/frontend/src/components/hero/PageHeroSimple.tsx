/* eslint-disable @next/next/no-img-element */
export interface PageHeroSimpleIds {
  banner: string;
  textBox: string;
}

export interface PageHeroSimpleProps {
  title: string;
  ids: PageHeroSimpleIds;
  headingClass?: string;
  emphasis?: 'b' | 'strong';
  headingWrap?: {
    row: string;
    col: string;
  };
  bgImageSrc?: string;
}

export function PageHeroSimple({
  title,
  ids,
  headingClass = 'uppercase',
  emphasis = 'b',
  headingWrap,
  bgImageSrc = '/wp-content/uploads/2024/03/contact_hero_bg.jpg',
}: PageHeroSimpleProps) {
  const headingInner = emphasis === 'strong' ? <strong>{title}</strong> : <b>{title}</b>;

  return (
    <div className="banner has-hover" id={ids.banner}>
      <div className="banner-inner fill">
        <div className="banner-bg fill">
          <img
            decoding="async"
            width={1020}
            height={344}
            src={bgImageSrc}
            className="bg attachment-large size-large"
            alt=""
            loading="lazy"
          />
        </div>

        <div className="banner-layers container">
          <div className="fill banner-link" />
          <div
            id={ids.textBox}
            className="text-box banner-layer x50 md-x50 lg-x50 y50 md-y50 lg-y50 res-text"
          >
            <div className="text-box-content text dark">
              <div className="text-inner text-center">
                {headingWrap ? (
                  <div className="row" id={headingWrap.row}>
                    <div id={headingWrap.col} className="col small-12 large-12">
                      <div className="col-inner">
                        <h2 className={headingClass}>{headingInner}</h2>
                      </div>
                    </div>
                  </div>
                ) : (
                  <h2 className={headingClass}>{headingInner}</h2>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
