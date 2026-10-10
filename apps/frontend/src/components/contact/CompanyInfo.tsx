import type { AssetRef, SiteSettings } from '@/types/content';
import type { ContactPreset } from './contactIds';

export interface CompanyInfoProps {
  settings: SiteSettings;
  icons: {
    address: AssetRef;
    phone: AssetRef;
    email: AssetRef;
  };
  preset: ContactPreset;
}

export function CompanyInfo({ settings, icons, preset }: CompanyInfoProps) {
  const hasAddress = Boolean(settings.address);
  const hasPhones = Boolean(settings.phones && settings.phones.length > 0);
  const hasEmail = Boolean(settings.email);

  const phoneLabel = hasPhones ? settings.phones.map((p) => p.label).join(' - ') : '';
  const phoneHref = hasPhones ? settings.phones[0].href : '';

  return (
    <>
      {/* Address */}
      {hasAddress && (
        <a className="plain">
          <div className="icon-box featured-box icon-box-left text-left">
            <div className="icon-box-img" style={{ width: 25 }}>
              <div className="icon">
                <div className="icon-inner">
                  <img
                    decoding="async"
                    width={icons.address.width ?? 1}
                    height={icons.address.height ?? 1}
                    src={icons.address.src}
                    className="attachment-medium size-medium"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <div className="icon-box-text last-reset">
              <p>{settings.address}</p>
            </div>
          </div>
        </a>
      )}

      {/* Gap between address and next card */}
      {hasAddress && (hasPhones || hasEmail) && (
        <div
          id={preset.main.gapAddressToPhoneId}
          className="gap-element clearfix"
          style={{ display: 'block', height: 'auto' }}
        />
      )}

      {/* Phone */}
      {hasPhones && (
        <>
          <a className="plain" href={phoneHref}>
            <div className="icon-box featured-box icon-box-left text-left">
              <div className="icon-box-img" style={{ width: 25 }}>
                <div className="icon">
                  <div className="icon-inner">
                    <img
                      decoding="async"
                      width={icons.phone.width ?? 1}
                      height={icons.phone.height ?? 1}
                      src={icons.phone.src}
                      className="attachment-medium size-medium"
                      alt=""
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
              <div className="icon-box-text last-reset">
                <p>{phoneLabel}</p>
              </div>
            </div>
          </a>

          {hasEmail && (
            <div
              id={preset.main.gapPhoneToEmailId}
              className="gap-element clearfix"
              style={{ display: 'block', height: 'auto' }}
            />
          )}
        </>
      )}

      {/* Email */}
      {hasEmail && (
        <a className="plain" href={`mailto:${settings.email}`}>
          <div className="icon-box featured-box icon-box-left text-left">
            <div className="icon-box-img" style={{ width: 25 }}>
              <div className="icon">
                <div className="icon-inner">
                  <img
                    decoding="async"
                    width={icons.email.width ?? 25}
                    height={icons.email.height ?? 25}
                    src={icons.email.src}
                    className="attachment-medium size-medium"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <div className="icon-box-text last-reset">
              <p>{settings.email}</p>
            </div>
          </div>
        </a>
      )}
    </>
  );
}
