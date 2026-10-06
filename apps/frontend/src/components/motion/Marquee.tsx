/* eslint-disable @next/next/no-img-element */
import { Fragment } from 'react';
import type { AssetRef } from '@/types/content';

export interface MarqueeProps {
  items: string[];
  separator?: AssetRef;
  className?: string;
}

export function Marquee({ items, separator, className = '' }: MarqueeProps) {
  if (!items.length) return null;

  const renderTrack = (ariaHidden?: boolean) => (
    <div className="cs-moving_text" aria-hidden={ariaHidden ? 'true' : undefined}>
      {items.map((item, idx) => (
        <Fragment key={idx}>
          {item}{' '}
          {separator?.src ? (
            <img
              decoding="async"
              src={separator.src}
              alt=""
              width={separator.width}
              height={separator.height}
            />
          ) : null}{' '}
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className={`cs-moving_text_wrap cs-bold cs-primary_font ${className}`.trim()}>
      <div className="cs-moving_text_in">
        {renderTrack()}
        {renderTrack(true)}
      </div>
    </div>
  );
}
