import Link from 'next/link';
import type { ContactPageContent, ShellContent, SiteSettings } from '@/types/content';
import type { ContactAssets } from '@/lib/queries/pages';
import { RichText } from '@/components/ui/RichText';
import { CompanyInfo } from './CompanyInfo';
import { ContactMap } from './ContactMap';
import { getContactPreset } from './contactIds';

export interface ContactViewProps {
  page: ContactPageContent;
  settings: SiteSettings;
  assets: ContactAssets;
  /** Accessible names for the image-card links, shared with the floating contact menu. */
  cardLabels: ShellContent['floatingContacts'];
}

export function ContactView({ page, settings, assets, cardLabels }: ContactViewProps) {
  const preset = getContactPreset(page.locale);
  const homeHref = page.locale === 'en' ? '/en/' : '/';

  return (
    <div id="content" role="main">
      {/* Hero Section */}
      <section className="section" id={preset.hero.sectionId}>
        <div className="section-bg fill">
          <img
            decoding="async"
            width={assets.heroImage.width ?? 1919}
            height={assets.heroImage.height ?? 647}
            src={assets.heroImage.src}
            className="bg attachment-original size-original"
            alt=""
            loading="lazy"
          />
        </div>

        <div className="section-content relative">
          <div className="row" id={preset.hero.rowId}>
            <div id={preset.hero.colId} className="col small-12 large-12">
              <div className="col-inner">
                <div id={preset.hero.titleId} className="text">
                  <h1>{page.title}</h1>
                </div>

                <div id={preset.hero.breadcrumbId} className="text">
                  <p style={{ textAlign: 'center' }}>
                    <Link
                      style={{ color: '#808080', fontWeight: 400, paddingRight: '5px' }}
                      href={homeHref}
                    >
                      {page.breadcrumb.homeLabel}
                    </Link>{' '}
                    <span
                      style={{
                        color: '#ffffff',
                        borderLeft: '1px solid #fff',
                        paddingLeft: '10px',
                      }}
                    >
                      {' '}
                      {page.breadcrumb.current}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section: Heading + Image Cards + Info / Form + Map */}
      <section className="section" id={preset.main.sectionId}>
        <div className="section-bg fill" />

        <div className="section-content relative">
          {/* Section Heading & Image Cards */}
          <div className="row" id={preset.main.headingRowId}>
            <div id={preset.main.headingColId} className="col small-12 large-12">
              <div className="col-inner">
                <div
                  className="is-border"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: '0px 0px 0.8px 0px',
                  }}
                />

                <div id={preset.main.headingTextId} className="text">
                  <h2>
                    <strong>{page.sectionHeading}</strong>
                  </h2>
                </div>

                <div className="row" id={preset.main.imageCardsRowId}>
                  {/* Zalo Card */}
                  <div
                    id={preset.main.imageCards.zalo.colId}
                    className="col medium-4 small-12 large-4"
                  >
                    <div className="col-inner">
                      <div
                        className="img has-hover img_contact x md-x lg-x y md-y lg-y"
                        id={preset.main.imageCards.zalo.imageId}
                      >
                        <a
                          className=""
                          href={settings.zaloHref}
                          aria-label={cardLabels.zalo}
                          target="_blank"
                          rel="noopener"
                        >
                          <div
                            className="img-inner image-cover dark"
                            style={{ paddingTop: '40%' }}
                          />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Hotline Card */}
                  <div
                    id={preset.main.imageCards.hotline.colId}
                    className="col medium-4 small-12 large-4"
                  >
                    <div className="col-inner">
                      <div
                        className="img has-hover img_contact x md-x lg-x y md-y lg-y"
                        id={preset.main.imageCards.hotline.imageId}
                      >
                        <a
                          className=""
                          href={settings.phones[0]?.href ?? ''}
                          aria-label={cardLabels.hotline}
                          target="_blank"
                          rel="noopener"
                        >
                          <div
                            className="img-inner image-cover dark"
                            style={{ paddingTop: '40%' }}
                          />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Messenger Card */}
                  <div
                    id={preset.main.imageCards.messenger.colId}
                    className="col medium-4 small-12 large-4"
                  >
                    <div className="col-inner">
                      <div
                        className="img has-hover img_contact x md-x lg-x y md-y lg-y"
                        id={preset.main.imageCards.messenger.imageId}
                      >
                        <a
                          className=""
                          href={settings.messengerHref}
                          aria-label={cardLabels.messenger}
                          target="_blank"
                          rel="noopener"
                        >
                          <div
                            className="img-inner image-cover dark"
                            style={{ paddingTop: '40%' }}
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gap between heading section and info row */}
          <div
            id={preset.main.gapHeadingToInfoId}
            className="gap-element clearfix"
            style={{ display: 'block', height: 'auto' }}
          />

          {/* Info & Form Row */}
          <div className="row" id={preset.main.infoRowId}>
            {/* Info Column */}
            <div id={preset.main.infoColId} className="col medium-6 small-12 large-6">
              <div className="col-inner">
                <h2>
                  <span style={{ color: '#ffffff', fontSize: '40px' }}>{page.heading}</span>
                </h2>
                <div
                  id={preset.main.gapTitleToIntroId}
                  className="gap-element clearfix"
                  style={{ display: 'block', height: 'auto' }}
                />
                <RichText content={page.introduction} />
                <CompanyInfo settings={settings} icons={assets.infoIcons} preset={preset} />
              </div>
            </div>

            {/* Empty Form Column (story 5) */}
            <div id={preset.main.formColId} className="col medium-6 small-12 large-6">
              <div className="col-inner" />
            </div>
          </div>

          {/* Map iframe */}
          <ContactMap embedUrl={settings.mapEmbedUrl} title={settings.address} />
        </div>
      </section>
    </div>
  );
}
