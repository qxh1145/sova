import type { AssetRef, HeroContent, Locale } from '@/types/content';
import { Button } from '@/components/ui/Button';

export interface HomeHeroProps {
  hero: HeroContent;
  locale: Locale;
  videoAsset?: AssetRef | null;
}

export function HomeHero({ hero, locale, videoAsset }: HomeHeroProps) {
  const isEn = locale === 'en';
  const bannerId = isEn ? 'banner-1274327306' : 'banner-1767683074';
  const textBoxId = isEn ? 'text-box-1959633488' : 'text-box-1471599896';
  const textHeadingId = isEn ? 'text-1976758016' : 'text-4215652146';
  const ctaWrapperId = isEn ? 'text-1541895380' : 'text-3520526105';
  const gapId1 = isEn ? 'gap-1761289960' : 'gap-1931009694';
  const gapId2 = isEn ? 'gap-704649320' : 'gap-1261674524';


  return (
    <div className="banner has-hover has-video" id={bannerId}>
      <div className="banner-inner fill">
        <div className="banner-bg fill">
          <div className="video-overlay no-click fill visible" />
          {videoAsset && (
            <video className="video-bg fill visible" preload="auto" playsInline autoPlay muted loop>
              <source src={videoAsset.src} type="video/mp4" />
            </video>
          )}
        </div>

        <div className="banner-layers container">
          <div className="fill banner-link" />
          <div
            id={textBoxId}
            className="text-box banner-layer x50 md-x0 lg-x0 y20 md-y20 lg-y20 res-text"
          >
            <div className="text-box-content text dark">
              <div className="text-inner text-center">
                <div
                  id={gapId1}
                  className="gap-element clearfix hide-for-small"
                  style={{ display: 'block', height: 'auto' }}
                />
                <div id={textHeadingId} className="text kanit-font home_text_go">
                  <h1 className="home-hero-heading">
                    {hero.headingLines.map((line, idx) => (
                      <span
                        key={idx}
                        className="typewriter"
                        style={idx === 2 ? { color: '#0065df' } : undefined}
                      >
                        <strong>{line}</strong>
                      </span>
                    ))}
                  </h1>
                </div>
                <div
                  id={gapId2}
                  className="gap-element clearfix hide-for-small"
                  style={{ display: 'block', height: 'auto' }}
                />
                {hero.cta && (
                  <div id={ctaWrapperId} className="text link_banner">
                    <p>
                      <Button href={hero.cta.href} variant="link" className="home-hero-cta">
                        {hero.cta.label}
                      </Button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
