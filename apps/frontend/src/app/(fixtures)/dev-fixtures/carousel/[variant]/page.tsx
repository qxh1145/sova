/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Carousel } from '@/components/ui/Carousel';
import { TestimonialCard } from '@/components/testimonials/TestimonialCard';
import { mockRepository } from '@/lib/repositories/mock';
import { FIXTURE_CAROUSEL_LABELS } from './constants';
import '@/styles/legacy/sections/route-root.css';
import '@/styles/legacy/sections/route-thiet-ke-website.css';
import '@/styles/legacy/sections/route-featured_item--cong-ty-co-phan-phat-trien-cong-nghe-thp.css';

export const dynamic = 'force-dynamic';

const VALID_VARIANTS = ['testimonials', 'thp-gallery', 'pricing-mobile'] as const;
type Variant = (typeof VALID_VARIANTS)[number];

function isVariant(v: string): v is Variant {
  return (VALID_VARIANTS as readonly string[]).includes(v);
}

export default async function FixtureCarouselPage({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams?: Promise<{ single?: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;
  if (!isVariant(variant)) {
    notFound();
  }

  const { single } = (await searchParams) ?? {};
  const isSingle = single === '1';

  if (variant === 'testimonials') {
    const list = await mockRepository.getTestimonials(
      ['testimonial-feedback-ten', 'testimonial-feedback-dong-a', 'testimonial-feedback-vinatex'],
      'vi',
    );
    const avatarIds = list.map((t) => t.avatarId).filter(Boolean) as string[];
    const assets = await mockRepository.getAssets(avatarIds);
    const assetMap = new Map(assets.map((a) => [a.id, a]));
    const items = isSingle ? list.slice(0, 1) : list;

    return (
      <>
        <div className="slider-wrapper relative slide-kh" id="slider-1717467276">
          <Carousel
            className="slider slider-nav-simple slider-nav-large slider-nav-light slider-style-normal slider-show-nav"
            align="center"
            loop
            autoplayMs={6000}
            pauseOnHover
            adaptiveHeight
            arrows
            dots
            dragThreshold={10}
            labels={FIXTURE_CAROUSEL_LABELS}
          >
            {items.map((t) => (
              <TestimonialCard
                key={t.id}
                testimonial={t}
                avatar={t.avatarId ? assetMap.get(t.avatarId) : undefined}
              />
            ))}
          </Carousel>
        </div>
        {/* Client-side navigation target for the unmount/cleanup e2e check. */}
        <Link href="/dev-fixtures/carousel/thp-gallery" data-testid="fixture-client-nav" />
      </>
    );
  }

  if (variant === 'thp-gallery') {
    const project = await mockRepository.getProject('cong-ty-co-phan-phat-trien-cong-nghe-thp');
    const galleryAssets = await mockRepository.getAssets(project?.galleryIds ?? []);
    const items = isSingle ? galleryAssets.slice(0, 1) : galleryAssets;

    // Source page context: `.portfolio-page-wrapper.portfolio-single-page` scopes the mobile 80% cell rule (11-custom.css, max-width:549px).
    return (
      <div className="portfolio-page-wrapper portfolio-single-page">
        <div className="slider-wrapper relative" id="slider-duan">
          <Carousel
            className="slider slider-nav-circle slider-nav-large slider-nav-dark slider-style-focus slider-show-nav"
            align="center"
            loop
            autoplayMs={3000}
            arrows
            dots
            containScroll={false}
            labels={FIXTURE_CAROUSEL_LABELS}
          >
            {items.map((asset) => (
              <div key={asset.id} className="img col">
                <div className="img-inner">
                  <img src={asset.src} alt={asset.alt} style={{ borderRadius: '12px' }} />
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    );
  }

  const pricing = await mockRepository.getPricing('pricing-website', 'vi');
  const plans = pricing?.plans ?? [];
  const items = isSingle ? plans.slice(0, 1) : plans;

  return (
    <div
      className="slider-wrapper relative slide_mobi_new slide_tke1 eras-table-price-slider show-for-small" // business-text-ok: source CSS class name
      id="slider-74016963"
    >
      <Carousel
        className="slider slider-nav-circle slider-nav-large slider-nav-light slider-style-container"
        align="center"
        loop
        autoplayMs={6000}
        pauseOnHover
        adaptiveHeight
        arrows
        dots
        dragThreshold={10}
        labels={FIXTURE_CAROUSEL_LABELS}
      >
        {items.map((plan) => (
          <div key={plan.id} className="row" id={`plan-${plan.id}`}>
            <div className="col col-logo-tke medium-4 small-12 large-4">
              <div className="col-inner" style={{ backgroundColor: 'rgba(66, 66, 66, 0.3)' }}>
                <div className="icon-box-text last-reset">
                  <div className="text">
                    <h3>
                      <strong>{plan.name}</strong>
                    </h3>
                  </div>
                  {plan.discountLabel && (
                    <div className="text text_sale">
                      <h3>{plan.discountLabel}</h3>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
