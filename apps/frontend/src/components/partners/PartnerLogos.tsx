/* eslint-disable @next/next/no-img-element */
import type { AssetRef, Partner } from '@/types/content';

export interface PartnerLogosProps {
  partners: Partner[];
  assets: AssetRef[];
}

export function PartnerLogos({ partners, assets }: PartnerLogosProps) {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));

  return (
    <div className="row gal-doitac large-columns-6 medium-columns-3 small-columns-3 row-small">
      {partners.map((partner) => {
        const asset = assetMap.get(partner.logoId);
        if (!asset) {
          throw new Error(
            `Partner logo asset "${partner.logoId}" was not resolved for partner "${partner.id}"`,
          );
        }

        return (
          <div key={partner.id} className="gallery-col col">
            <div className="col-inner">
              <div className="box has-hover gallery-box box-none">
                <div className="box-image image-color image-zoom" style={{ width: '80%' }}>
                  <img
                    decoding="async"
                    width={asset.width ?? 480}
                    height={asset.height ?? 325}
                    src={asset.src}
                    className="gal-doitac"
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div className="box-text text-left">
                  <p />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
