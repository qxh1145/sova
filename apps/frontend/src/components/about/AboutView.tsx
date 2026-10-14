/* eslint-disable @next/next/no-img-element */
import { Fragment } from 'react';
import type { AboutPageContent, Locale, RichContent } from '@/types/content';
import type { AboutAssets } from '@/lib/queries/pages';
import { PageHero } from '@/components/hero/PageHero';
import { ABOUT_HERO_IDS_EN, ABOUT_HERO_IDS_VI } from './aboutHeroIds';
import { ABOUT_IDS_EN, ABOUT_IDS_VI } from './aboutIds';
import { StatCounter } from '@/components/ui/StatCounter';
import { Marquee } from '@/components/motion/Marquee';
import { Carousel } from '@/components/ui/Carousel';
import { Testimonials, TESTIMONIALS_IDS } from '@/components/testimonials/Testimonials';

/** Inner HTML of a single-paragraph block, for rendering inside the source's own `<p>`. */
const paragraphHtml = (content: RichContent) => ({ __html: content.html.replace(/<\/?p>/g, '') });

/** `<li>` inner HTML of a sanitized `<ul>` list. */
const listItemsHtml = (content: RichContent) =>
  content.html
    .replace(/<\/?ul>/g, '')
    .split('</li>')
    .map((s) => s.replace(/<li>/, '').trim())
    .filter(Boolean);

export interface AboutViewProps {
  page: AboutPageContent;
  assets: AboutAssets;
  locale: Locale;
}

export function AboutView({ page, assets, locale }: AboutViewProps) {
  const isVi = locale === 'vi';
  const heroIds = isVi ? ABOUT_HERO_IDS_VI : ABOUT_HERO_IDS_EN;
  const ids = isVi ? ABOUT_IDS_VI : ABOUT_IDS_EN;
  const testimonialIds = TESTIMONIALS_IDS.about[locale];
  const labels = page.carouselLabels;

  return (
    <div id="content" role="main">
      {/* 1. PageHero */}
      <PageHero hero={page.hero} bgImage={assets.heroBgImage} ids={heroIds} />

      {/* 2. Section ss-target (Stats + Goals) */}
      <section className="section ss-target" id={ids.targetSection}>
        <div className="section-bg fill" />
        <div className="section-content relative">
          {/* Stats Box */}
          <div className="row align-center" id={ids.statsRow}>
            <div id={ids.statsCol} className="col col-thanhtuu small-12 large-12">
              <div className="col-inner" style={{ backgroundColor: 'rgb(0, 0, 0)' }}>
                <div className="row" id={ids.achievementsRow}>
                  <div id={ids.achievementsTextCol} className="col medium-5 small-12 large-5">
                    <div className="col-inner">
                      <div id={ids.achievementsTitleText} className="text">
                        <h2 style={{ fontWeight: 500 }}>
                          <strong>{page.sectionCopy.achievements.title}</strong>
                        </h2>
                      </div>
                      <div id={ids.achievementsDescText} className="text">
                        <p>{page.sectionCopy.achievements.description}</p>
                      </div>
                    </div>
                  </div>

                  <div id={ids.statsLineCol} className="col col-line medium-7 small-12 large-7">
                    <div className="col-inner">
                      <div className="row row-collapse" id={ids.statsRowCollapse}>
                        {/* 4 stats */}
                        {page.stats.map((stat) => (
                          <div key={stat.id} className="col medium-6 small-12 large-6">
                            <div className="col-inner">
                              <div className="row row-small">
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
                                      <p
                                        style={{
                                          marginBottom: '-10px',
                                          marginTop: '5px',
                                        }}
                                      >
                                        <strong>
                                          <span
                                            style={{
                                              color: '#0065df',
                                              fontSize: '45px',
                                            }}
                                          >
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

          <div
            id={ids.gapStatsGoals}
            className="gap-element clearfix"
            style={{ display: 'block', height: 'auto' }}
          />

          {/* Desktop Goals Grid (hide-for-small) */}
          <div
            className="row row-collapse align-equal row_muctieu hide-for-small"
            id={ids.goalsRow}
          >
            <div id={ids.goalsCol} className="col col-no-hover medium-6 small-12 large-6">
              <div className="col-inner">
                <p>
                  <strong>
                    <span style={{ color: '#0065df' }}>{page.sectionCopy.goals.eyebrow}</span>
                  </strong>
                </p>
                <div id={ids.goalsTitleText} className="text">
                  <h2>{page.sectionCopy.goals.title}</h2>
                </div>
                <div
                  className="is-divider divider clearfix"
                  style={{
                    maxWidth: '133px',
                    height: '2px',
                    backgroundColor: 'rgb(0, 101, 223)',
                  }}
                />
                <div
                  id={ids.goalsGap}
                  className="gap-element clearfix"
                  style={{ display: 'block', height: 'auto' }}
                />
                <div id={ids.goalsDescText} className="text text-target1">
                  <p>
                    {page.sectionCopy.goals.descriptionLines
                      ? page.sectionCopy.goals.descriptionLines.map((line, lIdx) => (
                          <Fragment key={lIdx}>
                            {line}
                            {lIdx < page.sectionCopy.goals.descriptionLines!.length - 1 && <br />}
                          </Fragment>
                        ))
                      : page.sectionCopy.goals.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 6 Goal Cards */}
            {page.goals.map((goal, idx) => {
              const icon = assets.goalIcons[idx];
              const numStr = String(idx + 1).padStart(2, '0');
              return (
                <div key={goal.id} className="col medium-3 small-12 large-3">
                  <div className="col-inner" style={{ backgroundColor: 'rgb(24, 24, 24)' }}>
                    <div
                      className="is-border"
                      style={{
                        borderColor: 'rgb(64, 64, 64)',
                        borderWidth: idx === 0 ? '1px 1px 0px 1px' : '1px 1px 0px 0px',
                      }}
                    />
                    <div className="icon-box featured-box icon-1 icon-box-center text-center">
                      <div className="icon-box-img" style={{ width: idx === 0 ? '100px' : '70px' }}>
                        <div className="icon">
                          <div className="icon-inner">
                            <img
                              decoding="async"
                              width={icon.width ?? 150}
                              height={icon.height ?? 150}
                              src={icon.src}
                              className="attachment-medium size-medium"
                              alt=""
                              loading="lazy"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="icon-box-text last-reset">
                        <div
                          className="gap-element clearfix"
                          style={{
                            display: 'block',
                            height: 'auto',
                            paddingTop: idx === 0 ? '50px' : '64px',
                          }}
                        />
                        <div className="text">
                          <p style={{ marginBottom: 0 }}>
                            <span style={{ fontSize: '110%' }}>{numStr}</span>
                          </p>
                          <h3>{goal.title}</h3>
                        </div>
                        <div className="text-center">
                          <div
                            className="is-divider divider clearfix"
                            style={{
                              maxWidth: '133px',
                              height: '1px',
                              backgroundColor: '#0065df',
                            }}
                          />
                        </div>
                        <div
                          className="gap-element clearfix"
                          style={{
                            display: 'block',
                            height: 'auto',
                            paddingTop: '10px',
                          }}
                        />
                      </div>
                    </div>
                    <div className="text mota_mt">
                      <p
                        style={{ textAlign: 'center' }}
                        dangerouslySetInnerHTML={paragraphHtml(goal.body)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Goals Carousel (show-for-small) */}
          <div className="show-for-small">
            <Carousel
              id={ids.goalsSlider}
              className="slider-wrapper relative slide_mobi_new slide_gth show-for-small"
              align="start"
              loop
              autoplayMs={6000}
              pauseOnHover
              arrows
              dots
              dragThreshold={10}
              adaptiveHeight
              containScroll="keepSnaps"
              labels={labels}
            >
              {page.goals.map((goal, idx) => {
                const icon = assets.goalIcons[idx];
                const numStr = String(idx + 1).padStart(2, '0');
                return (
                  <div key={goal.id} className="row">
                    <div className="col medium-3 small-12 large-3">
                      <div className="col-inner" style={{ backgroundColor: 'rgb(24, 24, 24)' }}>
                        <div
                          className="is-border"
                          style={{
                            borderColor: 'rgb(64, 64, 64)',
                            borderWidth: '1px 1px 1px 1px',
                          }}
                        />
                        <div className="icon-box featured-box icon-1 icon-box-center text-center">
                          <div
                            className="icon-box-img"
                            style={{ width: idx === 0 ? '100px' : '70px' }}
                          >
                            <div className="icon">
                              <div className="icon-inner">
                                <img
                                  decoding="async"
                                  width={icon.width ?? 150}
                                  height={icon.height ?? 150}
                                  src={icon.src}
                                  className="attachment-medium size-medium"
                                  alt=""
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="icon-box-text last-reset">
                            <div className="text">
                              <p style={{ marginBottom: 0 }}>
                                <span style={{ fontSize: '110%' }}>{numStr}</span>
                              </p>
                              <h3>{goal.title}</h3>
                            </div>
                            <div className="text-center">
                              <div
                                className="is-divider divider clearfix"
                                style={{
                                  maxWidth: '133px',
                                  height: '1px',
                                  backgroundColor: '#0065df',
                                }}
                              />
                            </div>
                            <div
                              className="gap-element clearfix"
                              style={{
                                display: 'block',
                                height: 'auto',
                                paddingTop: '10px',
                              }}
                            />
                          </div>
                        </div>
                        <div className="text mota_mt">
                          <p
                            style={{ textAlign: 'center' }}
                            dangerouslySetInnerHTML={paragraphHtml(goal.body)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Carousel>
          </div>
        </div>
      </section>

      <div
        id={ids.gapAfterTarget}
        className="gap-element clearfix hide-for-small"
        style={{ display: 'block', height: 'auto' }}
      />

      {/* 3. Section Purpose (4 Panels with Background Image) */}
      <section className="section" id={ids.purposeSection}>
        <div className="section-bg fill">
          <img
            decoding="async"
            width={page.purposeImage.width ?? 2000}
            height={page.purposeImage.height ?? 1498}
            src={page.purposeImage.src}
            className="bg attachment-original size-original"
            alt=""
            loading="lazy"
          />
          <div className="section-bg-overlay absolute fill" />
        </div>

        <div className="section-content relative">
          <div
            id={ids.purposeGapTop}
            className="gap-element clearfix"
            style={{ display: 'block', height: 'auto' }}
          />

          <div className="row align-middle" id={ids.purposeRow}>
            <div id={ids.purposeColText} className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <div id={ids.purposeTitleText} className="text">
                  <h2>
                    {page.sectionCopy.purpose.titleLines
                      ? page.sectionCopy.purpose.titleLines.map((line, i) => (
                          <Fragment key={i}>
                            {i > 0 && <br />}
                            {line}
                          </Fragment>
                        ))
                      : page.sectionCopy.purpose.title}
                  </h2>
                </div>
                <div id={ids.purposeDescText} className="text">
                  <p>{page.sectionCopy.purpose.description}</p>
                </div>
              </div>
            </div>

            <div id={ids.purposeColSpacer} className="col hide-for-small medium-1 small-12 large-1">
              <div className="col-inner" />
            </div>

            <div id={ids.purposeColPanels} className="col medium-7 small-12 large-7">
              <div className="col-inner">
                <div className="row align-equal row_cacsp" id={ids.purposeRowPanels}>
                  {page.purposePanels.map((panel, idx) => (
                    <div key={idx} className="col col-line-top medium-6 small-12 large-6">
                      <div
                        className="col-inner"
                        style={{ backgroundColor: 'rgba(66, 66, 66, 0.3)' }}
                      >
                        <div
                          className="is-border"
                          style={{
                            borderColor: '#0065df',
                            borderWidth: '1px 0px 0px 0px',
                          }}
                        />
                        <div className="text">
                          <h3>
                            <span style={{ fontSize: '120%' }}>{panel.title}</span>
                          </h3>
                          <p dangerouslySetInnerHTML={paragraphHtml(panel.content)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            id={ids.purposeGapBottom}
            className="gap-element clearfix hide-for-small"
            style={{ display: 'block', height: 'auto' }}
          />
        </div>
      </section>

      {/* 4. Timeline Section */}
      <section className="section" id={ids.timelineHeaderSection}>
        <div className="section-bg fill" />
        <div className="section-content relative">
          <div
            id={ids.timelineHeaderGap}
            className="gap-element clearfix"
            style={{ display: 'block', height: 'auto' }}
          />
          <div className="row" id={ids.timelineHeaderRow}>
            <div id={ids.timelineHeaderCol} className="col small-12 large-12">
              <div className="col-inner">
                <div id={ids.timelineHeaderText} className="text">
                  <h2>{page.sectionCopy.timeline.title}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section hinhthanh-phattrien" id={ids.timelineItemsSection}>
        <div className="section-bg fill" />
        <div className="section-content relative timeline-track-wrap">
          <div className="timeline-track">
            {/* Primary set of 9 items */}
            {page.timeline.map((item) => (
              <div key={item.id} className="timeline-item row row-collapse row-full-width">
                <div className="col small-12 large-12">
                  <div className="col-inner">
                    <div className="text text-border">
                      <p style={{ marginBottom: 0 }}>
                        <img
                          decoding="async"
                          className="alignnone wp-image-3335 size-full"
                          role="img"
                          src={page.timelineDot.src}
                          alt=""
                          width={page.timelineDot.width ?? 25}
                          height={page.timelineDot.height ?? 24}
                        />
                      </p>
                    </div>
                    <div className="text">
                      <h3>
                        <span style={{ color: '#0065df', fontSize: '120%' }}>{item.year}</span>
                      </h3>
                      <h3>
                        <span style={{ fontSize: '110%' }}>{item.title}</span>
                      </h3>
                      <p dangerouslySetInnerHTML={paragraphHtml(item.body)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicated set for seamless CSS loop (aria-hidden) */}
            {page.timeline.map((item) => (
              <div
                key={`dup-${item.id}`}
                aria-hidden="true"
                className="timeline-item row row-collapse row-full-width"
              >
                <div className="col small-12 large-12">
                  <div className="col-inner">
                    <div className="text text-border">
                      <p style={{ marginBottom: 0 }}>
                        <img
                          decoding="async"
                          className="alignnone wp-image-3335 size-full"
                          role="img"
                          src={page.timelineDot.src}
                          alt=""
                          width={page.timelineDot.width ?? 25}
                          height={page.timelineDot.height ?? 24}
                        />
                      </p>
                    </div>
                    <div className="text">
                      <h3>
                        <span style={{ color: '#0065df', fontSize: '120%' }}>{item.year}</span>
                      </h3>
                      <h3>
                        <span style={{ fontSize: '110%' }}>{item.title}</span>
                      </h3>
                      <p dangerouslySetInnerHTML={paragraphHtml(item.body)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Section Pillars (3 columns x 9 cards = 27 icon cards) */}
      <section className="section ss-ndv" id={ids.pillarsSection}>
        <div className="section-bg fill" />
        <div className="section-content relative">
          <div className="row" id={ids.pillarsHeaderRow}>
            <div id={ids.pillarsHeaderCol} className="col medium-4 small-12 large-4">
              <div className="col-inner">
                <p>
                  <strong>
                    <span style={{ color: '#0065df' }}>{page.sectionCopy.pillars.eyebrow}</span>
                  </strong>
                </p>
                <div id={ids.pillarsTitleText} className="text">
                  <h2>
                    {page.sectionCopy.pillars.titleLines
                      ? page.sectionCopy.pillars.titleLines.map((line, i) => (
                          <Fragment key={i}>
                            {i > 0 && <br />}
                            {line}
                          </Fragment>
                        ))
                      : page.sectionCopy.pillars.title}
                  </h2>
                </div>
                <div
                  className="is-divider divider clearfix"
                  style={{
                    maxWidth: '133px',
                    height: '2px',
                    backgroundColor: 'rgb(0, 101, 223)',
                  }}
                />
                <div id={ids.pillarsDescText} className="text">
                  <p style={{ padding: '0 30px 0 0' }}>{page.sectionCopy.pillars.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Pillars Carousel (show-for-small) */}
          <div className="show-for-small">
            <Carousel
              id={ids.pillarsSlider}
              className="slider-wrapper relative slide_gthieu show-for-small"
              align="center"
              loop
              autoplayMs={6000}
              pauseOnHover
              arrows
              dots
              dragThreshold={10}
              adaptiveHeight
              containScroll="keepSnaps"
              labels={labels}
            >
              {page.capabilities.map((cap) => {
                const items = listItemsHtml(cap.content);

                return (
                  <div key={cap.id} className="row hover_gra">
                    <div className="col col-logo medium-4 small-12 large-4">
                      <div
                        className="col-inner"
                        style={{ backgroundColor: 'rgba(66, 66, 66, 0.3)' }}
                      >
                        <div className="text">
                          <h3>{cap.title}</h3>
                        </div>
                        <div
                          className="gap-element clearfix"
                          style={{
                            display: 'block',
                            height: 'auto',
                            paddingTop: '20px',
                          }}
                        />

                        {items.map((itemText, itemIdx) => (
                          <Fragment key={itemIdx}>
                            <div className="icon-box featured-box icon-center icon-box-left text-left">
                              <div className="icon-box-img" style={{ width: '22px' }}>
                                <div className="icon">
                                  <div className="icon-inner">
                                    <img
                                      decoding="async"
                                      width={1}
                                      height={1}
                                      src={assets.subtractIcon.src}
                                      className="attachment-medium size-medium"
                                      alt=""
                                      loading="lazy"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="icon-box-text last-reset">
                                <div className="text">
                                  <p dangerouslySetInnerHTML={{ __html: itemText }} />
                                </div>
                              </div>
                            </div>
                            <div
                              className="gap-element clearfix"
                              style={{
                                display: 'block',
                                height: 'auto',
                                paddingTop: '10px',
                              }}
                            />
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Carousel>
          </div>

          {/* Desktop Pillars Row (hide-for-small, 3 columns x 9 cards) */}
          <div className="row hover_gra hide-for-small" id={ids.pillarsDesktopRow}>
            {page.capabilities.map((cap) => {
              const items = listItemsHtml(cap.content);

              return (
                <div key={cap.id} className="col col-logo medium-4 small-12 large-4">
                  <div className="col-inner" style={{ backgroundColor: 'rgba(66, 66, 66, 0.3)' }}>
                    <div className="text">
                      <h3>{cap.title}</h3>
                    </div>
                    <div
                      className="gap-element clearfix"
                      style={{
                        display: 'block',
                        height: 'auto',
                        paddingTop: '20px',
                      }}
                    />

                    {items.map((itemText, itemIdx) => (
                      <Fragment key={itemIdx}>
                        <div className="icon-box featured-box icon-center icon-box-left text-left">
                          <div className="icon-box-img" style={{ width: '22px' }}>
                            <div className="icon">
                              <div className="icon-inner">
                                <img
                                  decoding="async"
                                  width={1}
                                  height={1}
                                  src={assets.subtractIcon.src}
                                  className="attachment-medium size-medium"
                                  alt=""
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="icon-box-text last-reset">
                            <div className="text">
                              <p dangerouslySetInnerHTML={{ __html: itemText }} />
                            </div>
                          </div>
                        </div>
                        <div
                          className="gap-element clearfix"
                          style={{
                            display: 'block',
                            height: 'auto',
                            paddingTop: '10px',
                          }}
                        />
                      </Fragment>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gap before marquee */}
      <div
        id={ids.marqueeGapBefore}
        className="gap-element clearfix"
        style={{ display: 'block', height: 'auto' }}
      />

      {/* Marquee */}
      <Marquee items={page.marqueeText} separator={page.marqueeSeparator} />

      {/* Gap after marquee */}
      <div
        id={ids.marqueeGapAfter}
        className="gap-element clearfix"
        style={{ display: 'block', height: 'auto' }}
      />

      {/* 6. Testimonials Section (No partner section) */}
      <Testimonials
        testimonials={page.testimonials}
        copy={page.sectionCopy.testimonials}
        art={page.testimonialArt}
        ids={testimonialIds}
        labels={labels}
      />
    </div>
  );
}
