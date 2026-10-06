import type { AssetRef, HomePageContent, Locale, ProjectCategory } from '@/types/content';
import { HomeHero } from './HomeHero';
import { HomeStats } from './HomeStats';
import { ServicesList } from '@/components/services/ServicesList';
import { ServicesAccordion } from '@/components/services/ServicesAccordion';
import { Marquee } from '@/components/motion/Marquee';
import { FeaturedProjects } from '@/components/projects/FeaturedProjects';
import { PartnerLogos } from '@/components/partners/PartnerLogos';
import {
  Testimonials,
  TESTIMONIALS_IDS_EN,
  TESTIMONIALS_IDS_VI,
  TESTIMONIALS_LABELS,
} from '@/components/testimonials/Testimonials';

export interface HomeViewProps {
  content: HomePageContent | null;
  locale: Locale;
  videoAsset?: AssetRef | null;
  projectAssets?: AssetRef[];
  projectCategories?: ProjectCategory[];
  partnerAssets?: AssetRef[];
  testimonialAssets?: AssetRef[];
}

export function HomeView({
  content,
  locale,
  videoAsset,
  projectAssets,
  projectCategories,
  partnerAssets,
  testimonialAssets,
}: HomeViewProps) {
  if (!content) {
    return <main id="main" />;
  }

  const isEn = locale === 'en';

  return (
    <main id="main">
      <HomeHero hero={content.hero} locale={locale} videoAsset={videoAsset} />
      <HomeStats stats={content.stats} copy={content.sectionCopy.achievements} locale={locale} />
      {content.services.length > 0 && (
        <section className="section" id={isEn ? 'section_2119007658' : 'section_1856001238'}>
          <div className="section-bg fill" />
          <div className="section-content relative">
            <div
              className="row row-large row-full-width"
              id={isEn ? 'row-1752206630' : 'row-1518221527'}
            >
              <div
                id={isEn ? 'col-1171642283' : 'col-602084510'}
                className="col small-12 large-12"
              >
                <div className="col-inner">
                  <div
                    id={isEn ? 'text-1345580034' : 'text-1534689410'}
                    className="text tt_dvu"
                  >
                    <p>
                      {content.sectionCopy.services.eyebrow}
                      <br />
                    </p>
                  </div>
                  <div id={isEn ? 'text-1753471996' : 'text-2074594647'} className="text">
                    <h2>{content.sectionCopy.services.title}</h2>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="row row-large row-full-width"
              id={isEn ? 'row-1177757984' : 'row-503017543'}
            >
              <div
                id={isEn ? 'col-1679088702' : 'col-2040376977'}
                className="col small-12 large-12"
              >
                <div className="col-inner">
                  <ServicesList
                    services={content.services}
                    id={isEn ? 'text-363933116' : 'text-76027534'}
                  />
                  <ServicesAccordion
                    services={content.services}
                    id={isEn ? 'text-699740449' : 'text-2320367842'}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      {content.marqueeText.length > 0 && (
        <section className="section" id={isEn ? 'section_2114423796' : 'section_1648741915'}>
          <div className="section-bg fill" />
          <div className="section-content relative">
            <Marquee items={content.marqueeText} separator={content.marqueeSeparator} />
          </div>
        </section>
      )}
      <FeaturedProjects
        projects={content.projects}
        copy={content.sectionCopy.projects}
        assets={projectAssets}
        categories={projectCategories}
      />
      {content.partners.length > 0 && (
        <>
          <section
            className="section"
            id={isEn ? 'section_841675174' : 'section_62935602'}
          >
            <div className="section-bg fill">
              <div className="section-bg-overlay absolute fill" />
            </div>
            <div className="section-content relative">
              <div
                id={isEn ? 'gap-114722093' : 'gap-1982869342'}
                className="gap-element clearfix"
                style={{ display: 'block', height: 'auto' }}
              />
              <div
                className="row row-large row-full-width"
                id={isEn ? 'row-1673184946' : 'row-1813769469'}
              >
                <div
                  id={isEn ? 'col-1052681053' : 'col-1695365300'}
                  className="col small-12 large-12"
                >
                  <div className="col-inner">
                    {content.sectionCopy.partners.eyebrow && (
                      <div
                        id={isEn ? 'text-3114286333' : 'text-2149017180'}
                        className="text"
                      >
                        <h4>{content.sectionCopy.partners.eyebrow}</h4>
                      </div>
                    )}
                    <div
                      id={isEn ? 'text-3018448185' : 'text-1007250049'}
                      className="text"
                    >
                      <h2>{content.sectionCopy.partners.title}</h2>
                    </div>
                    <div
                      className="is-divider divider clearfix"
                      style={{
                        maxWidth: 118,
                        height: 2,
                        backgroundColor: '#0065df',
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                className="row row-large row-full-width row-doitac"
                id={isEn ? 'row-83126080' : 'row-1538697688'}
              >
                <div
                  id={isEn ? 'col-1549395658' : 'col-170547989'}
                  className="col medium-9 small-12 large-9"
                >
                  <div className="col-inner">
                    <PartnerLogos
                      partners={content.partners}
                      assets={partnerAssets ?? []}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div
            id={isEn ? 'gap-974238391' : 'gap-1743500161'}
            className="gap-element clearfix"
            style={{ display: 'block', height: 'auto' }}
          />
        </>
      )}
      <Testimonials
        testimonials={content.testimonials}
        avatars={testimonialAssets}
        copy={content.sectionCopy.testimonials}
        art={content.testimonialArt}
        ids={isEn ? TESTIMONIALS_IDS_EN : TESTIMONIALS_IDS_VI}
        labels={TESTIMONIALS_LABELS[locale]}
      />
    </main>
  );
}
