/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { AssetRef } from '@/types/content';

export interface LogoLinkProps {
  logoAsset?: AssetRef | null;
  wordmark: string;
  homeHref: string;
  companyName: string;
  isFooter?: boolean;
}

export function LogoLink({
  logoAsset,
  wordmark,
  homeHref,
  companyName,
  isFooter = false,
}: LogoLinkProps) {
  const hasLocalLogo = logoAsset && logoAsset.status === 'local';

  if (isFooter) {
    return (
      <div
        className="img has-hover x md-x lg-x y md-y lg-y"
        id="image_1587030259"
        style={{ width: '55%' }}
      >
        <div className="img-inner dark">
          {hasLocalLogo ? (
            <img
              src={logoAsset.src}
              alt={logoAsset.alt}
              className="attachment-original size-original"
              decoding="async"
              loading="lazy"
            />
          ) : (
            <Link href={homeHref} rel="home" className="footer-wordmark">
              <span>{wordmark}</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <Link href={homeHref} title={companyName} rel="home">
      {hasLocalLogo ? (
        <img
          width={376}
          height={120}
          src={logoAsset.src}
          className="header_logo header-logo"
          alt={logoAsset.alt}
        />
      ) : (
        <span className="header-wordmark">{wordmark}</span>
      )}
    </Link>
  );
}
