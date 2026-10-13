import { Fragment } from 'react';
import Link from 'next/link';

import type { Locale } from '@/types/content';
import { FOOTER_CTA_IDS } from './footerCtaIds';

export interface FooterCTAProps {
  headingLines: string[];
  targetHref: string;
  locale?: Locale;
}

export function FooterCTA({ headingLines, targetHref, locale = 'vi' }: FooterCTAProps) {
  const ids = FOOTER_CTA_IDS[locale];

  return (
    <section className="section ss-last" id={ids.section}>
      <div className="section-bg fill" />
      <div className="section-content relative">
        <div
          id={ids.gap}
          className="gap-element clearfix"
          style={{ display: 'block', height: 'auto', paddingTop: 78 }}
        />
        <div className="row align-middle align-center" id={ids.row}>
          <div id={ids.colLeft} className="col medium-9 small-9 large-9">
            <div className="col-inner">
              <div id={ids.text} className="text">
                <h1>
                  <Link href={targetHref} style={{ display: 'block' }}>
                    {headingLines.map((line, i) => (
                      <Fragment key={i}>
                        {i > 0 && <br />}
                        {line}
                      </Fragment>
                    ))}
                  </Link>
                </h1>
              </div>
            </div>
          </div>

          <div id={ids.colRight} className="col medium-3 small-3 large-3">
            <div className="col-inner text-right">
              <Link className="plain" href={targetHref}>
                <div className="icon-box featured-box icon-box-footer icon-box-right text-right">
                  <div className="icon-box-img" style={{ width: 60 }}>
                    <div className="icon">
                      <div className="icon-inner">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="36"
                          height="28"
                          viewBox="0 0 36 28"
                          fill="none"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M20.9393 0.93934C21.5251 0.353553 22.4749 0.353553 23.0607 0.93934L35.0607 12.9393C35.6464 13.5251 35.6464 14.4749 35.0607 15.0607L23.0607 27.0607C22.4749 27.6464 21.5251 27.6464 20.9393 27.0607C20.3536 26.4749 20.3536 25.5251 20.9393 24.9393L30.3787 15.5H2C1.17157 15.5 0.5 14.8284 0.5 14C0.5 13.1716 1.17157 12.5 2 12.5H30.3787L20.9393 3.06066C20.3536 2.47487 20.3536 1.52513 20.9393 0.93934Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="icon-box-text last-reset" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
