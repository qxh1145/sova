import type { CompanyProfileContent } from '@/types/content';

export interface ProfileViewProps {
  page: CompanyProfileContent;
}

const CONFIG = {
  vi: {
    bannerId: 'banner-1559052784',
    textBoxId: 'text-box-205491153',
    gapId: 'gap-1482944867',
    rowId: 'row-143567771',
    colId: 'col-1684974797',
    colClass: 'col medium-7 small-12 large-7',
    textId: 'text-1019941480',
  },
  en: {
    bannerId: 'banner-151127649',
    textBoxId: 'text-box-137215681',
    gapId: 'gap-430848395',
    rowId: 'row-14294543',
    colId: 'col-20498190',
    colClass: 'col medium-6 small-12 large-6',
    textId: 'text-3247181948',
  },
} as const;

export function ProfileView({ page }: ProfileViewProps) {
  const config = CONFIG[page.locale];

  return (
    <div id="content" role="main">
      <div className="banner has-hover" id={config.bannerId}>
        <div className="banner-inner fill">
          <div className="banner-bg fill">
            <img
              decoding="async"
              width="1900"
              height="958"
              src="/wp-content/uploads/2024/02/xzc-zcx-cx_.webp"
              className="bg attachment-original size-original"
              alt=""
              loading="lazy"
            />
          </div>
          <div className="banner-layers container">
            <div className="fill banner-link" />
            <div
              id={config.textBoxId}
              className="text-box banner-layer x50 md-x50 lg-x50 y20 md-y50 lg-y50 res-text"
            >
              <div className="text-box-content text dark">
                <div className="text-inner text-center">
                  <div
                    id={config.gapId}
                    className="gap-element clearfix"
                    style={{ display: 'block', height: 'auto' }}
                  />
                  <div className="row align-middle" id={config.rowId}>
                    <div id={config.colId} className={config.colClass}>
                      <div className="col-inner">
                        <div id={config.textId} className="text kanit-font">
                          <h2>{page.title}</h2>
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
  );
}
