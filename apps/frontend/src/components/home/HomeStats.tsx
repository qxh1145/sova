import { Fragment } from 'react';
import type { Locale, SectionCopy, Stat } from '@/types/content';
import { StatCounter } from './StatCounter';

export interface HomeStatsProps {
  stats: Stat[];
  copy: SectionCopy;
  locale: Locale;
}

export function HomeStats({ stats, copy, locale }: HomeStatsProps) {
  if (!stats.length) return null;

  const isEn = locale === 'en';
  const rowStatsId = isEn ? 'row-34630575' : 'row-560000867';
  const colStatsId = isEn ? 'col-95430941' : 'col-90889590';
  const rowAchievementsId = isEn ? 'row-1720363582' : 'row-1603758451';
  const colHeadingId = isEn ? 'col-497116769' : 'col-2018152776';
  const textTitleId = isEn ? 'text-1018257427' : 'text-3615603604';
  const textDescId = isEn ? 'text-3546826826' : 'text-718633786';
  const colLineId = isEn ? 'col-1096890536' : 'col-855219004';
  const rowGridId = isEn ? 'row-809501727' : 'row-92355582';

  return (
    <div className="row align-center home-stats-row" id={rowStatsId}>
      <div id={colStatsId} className="col col-thanhtuu small-12 large-12">
        <div className="col-inner" style={{ backgroundColor: 'rgb(0, 0, 0)' }}>
          <div className="row row-small" id={rowAchievementsId}>
            <div id={colHeadingId} className="col medium-5 small-12 large-5">
              <div className="col-inner">
                <div id={textTitleId} className="text">
                  <h2>
                    <strong>
                      {copy.titleLines
                        ? copy.titleLines.map((line, i) => (
                            <Fragment key={i}>
                              {i > 0 && <br />}
                              {line}
                              {i < (copy.titleLines?.length ?? 0) - 1 ? ' ' : ''}
                            </Fragment>
                          ))
                        : copy.title}
                    </strong>
                  </h2>
                </div>
                {copy.description && (
                  <div id={textDescId} className="text">
                    <p>{copy.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div id={colLineId} className="col medium-7 small-12 large-7">
              <div className="col-inner">
                <div className="row row-collapse align-middle" id={rowGridId}>
                  {stats.map((stat, idx) => (
                    <div key={stat.id ?? idx} className="col medium-6 small-12 large-6">
                      <div className="col-inner">
                        <div className="row row-small align-middle row-num">
                          <div className="col medium-6 small-6 large-6">
                            <div className="col-inner">
                              <div className="text count-num">
                                <p className="mb-0">
                                  <strong>
                                    <StatCounter value={stat.value} minDigits={2} />
                                  </strong>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="col medium-6 small-6 large-6">
                            <div className="col-inner">
                              <div className="text">
                                <p style={{ marginBottom: -10, marginTop: 5 }}>
                                  <strong>
                                    <span style={{ color: '#0065df', fontSize: 40 }}>
                                      {stat.suffix ?? '+'}
                                    </span>
                                  </strong>
                                </p>
                                <p style={{ marginBottom: 0 }}>{stat.label}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
