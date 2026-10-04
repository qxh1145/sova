import { Fragment } from 'react';
import Link from 'next/link';

export interface FooterCTAProps {
  headingLines: string[];
  targetHref: string;
}

export function FooterCTA({ headingLines, targetHref }: FooterCTAProps) {
  return (
    <section className="section ss-last" id="section_539620154">
      <div className="section-bg fill" />
      <div className="section-content relative">
        <div
          id="gap-701964121"
          className="gap-element clearfix"
          style={{ display: 'block', height: 'auto', paddingTop: 78 }}
        />
        <div className="row align-middle align-center" id="row-2042733711">
          <div id="col-395461297" className="col medium-9 small-9 large-9">
            <div className="col-inner">
              <div id="text-43480091" className="text">
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

          <div id="col-1563444768" className="col medium-3 small-3 large-3">
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
