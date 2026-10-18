import type { CompanyProfileContent } from '@/types/content';
import { getProfilePreset, type ProfilePreset } from './profileIds';

export interface ProfileViewProps {
  page: CompanyProfileContent;
  ids?: ProfilePreset;
}

export function ProfileView({ page, ids }: ProfileViewProps) {
  const config = ids ?? getProfilePreset(page.locale);

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
