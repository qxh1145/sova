/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Carousel } from '@/components/ui/Carousel';
import { TestimonialsSlider } from '@/components/testimonials/Testimonials';
import { getHomePage } from '@/lib/queries/pages';
import { mockRepository } from '@/lib/repositories/mock';
import { PricingCardsSlider, PRICING_CARDS_IDS_VI } from '@/components/pricing/PricingCards';
import { SUBTRACT_ICON_ID } from '@/lib/queries/services';
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
    const [assets, home] = await Promise.all([
      mockRepository.getAssets(list.map((t) => t.avatarId).filter(Boolean) as string[]),
      getHomePage('vi', mockRepository),
    ]);
    if (!home) notFound();
    const items = isSingle ? list.slice(0, 1) : list;

    return (
      <>
        <TestimonialsSlider
          testimonials={items}
          avatars={assets}
          lineArt={home.testimonialArt.line}
          id="slider-1717467276"
          labels={FIXTURE_CAROUSEL_LABELS}
        />
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
  const features = pricing && 'features' in pricing ? pricing.features : [];

  const [subtractIcon, ...planIcons] = await mockRepository.getAssets([
    SUBTRACT_ICON_ID,
    'asset-017f167e30',
    'asset-0284853c00',
    'asset-4314679580',
  ]);

  return (
    <PricingCardsSlider
      plans={items}
      features={features}
      sliderCards={PRICING_CARDS_IDS_VI.sliderCards}
      sliderWrapperId="slider-74016963"
      planIcons={planIcons}
      subtractIcon={subtractIcon}
      labels={FIXTURE_CAROUSEL_LABELS}
    />
  );
}

