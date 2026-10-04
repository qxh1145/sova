import { expect, test } from './fixtures';
import {
  freeze,
  hasSource,
  missingSourceMessage,
  openSource,
} from '../baseline/source';

test.describe('Carousel source parity comparison', () => {
  test.beforeEach(() => {
    test.skip(!hasSource, missingSourceMessage);
  });

  test('Testimonials prototype geometry comparison against eras-clone source', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Measure eras-clone source
    await openSource(page, {
      key: 'home-testimonials',
      url: '/',
      file: 'index.html',
      family: 'home',
      locale: 'vi',
      reason: 'parity',
    });
    await freeze(page);

    const sourceMetrics = await page.evaluate(() => {
      const slider = document.querySelector('#slider-1717467276');
      const firstSlide = document.querySelector('#slider-1717467276 .row');
      const sRect = slider?.getBoundingClientRect();
      const fRect = firstSlide?.getBoundingClientRect();
      return {
        slider: sRect ? { width: sRect.width, height: sRect.height } : null,
        firstSlide: fRect ? { width: fRect.width, height: fRect.height } : null,
      };
    });

    // Measure Sova Carousel fixture
    await page.goto('/dev-fixtures/carousel/testimonials');
    await freeze(page);

    const sovaMetrics = await page.evaluate(() => {
      const slider = document.querySelector('#slider-1717467276');
      const firstSlide = document.querySelector(
        '#slider-1717467276 .flickity-slider > .flickity-cell',
      );
      const prevBtn = document.querySelector(
        '#slider-1717467276 .flickity-prev-next-button.previous',
      );
      const nextBtn = document.querySelector(
        '#slider-1717467276 .flickity-prev-next-button.next',
      );
      const dot = document.querySelector('#slider-1717467276 .flickity-page-dots .dot');

      const sRect = slider?.getBoundingClientRect();
      const fRect = firstSlide?.getBoundingClientRect();
      const pRect = prevBtn?.getBoundingClientRect();
      const nRect = nextBtn?.getBoundingClientRect();
      const dRect = dot?.getBoundingClientRect();

      return {
        slider: sRect ? { width: sRect.width, height: sRect.height } : null,
        firstSlide: fRect ? { width: fRect.width, height: fRect.height } : null,
        prevButton: pRect ? { width: pRect.width, height: pRect.height } : null,
        nextButton: nRect ? { width: nRect.width, height: nRect.height } : null,
        dot: dRect ? { width: dRect.width, height: dRect.height } : null,
      };
    });

    // Record comparison numbers
    const record = {
      variant: 'testimonials',
      sourceMetrics,
      sovaMetrics,
      widthRatioSovaToSource:
        sourceMetrics.firstSlide && sovaMetrics.firstSlide
          ? sovaMetrics.firstSlide.width / sourceMetrics.firstSlide.width
          : null,
    };

    test.info().annotations.push({
      type: 'parity-measurement',
      description: JSON.stringify(record, null, 2),
    });

    console.log('PARITY RECORD [testimonials]:', JSON.stringify(record, null, 2));

    expect(sovaMetrics.slider).not.toBeNull();
    expect(sovaMetrics.firstSlide).not.toBeNull();
    expect(sovaMetrics.prevButton).not.toBeNull();
    expect(sovaMetrics.nextButton).not.toBeNull();
    expect(sovaMetrics.dot).not.toBeNull();
  });

  test('THP project gallery geometry comparison against eras-clone source', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Measure eras-clone source
    await openSource(page, {
      key: 'thp-gallery',
      url: '/featured_item/cong-ty-co-phan-phat-trien-cong-nghe-thp/',
      file: 'featured_item/cong-ty-co-phan-phat-trien-cong-nghe-thp/index.html',
      family: 'project',
      locale: 'vi',
      reason: 'parity',
    });
    await freeze(page);

    const sourceMetrics = await page.evaluate(() => {
      const slider = document.querySelector('#slider-duan');
      const firstSlide = document.querySelector('#slider-duan .img.col');
      const sRect = slider?.getBoundingClientRect();
      const fRect = firstSlide?.getBoundingClientRect();
      return {
        slider: sRect ? { width: sRect.width, height: sRect.height } : null,
        firstSlide: fRect ? { width: fRect.width, height: fRect.height } : null,
      };
    });

    // Measure Sova Carousel fixture
    await page.goto('/dev-fixtures/carousel/thp-gallery');
    await freeze(page);

    const sovaMetrics = await page.evaluate(() => {
      const slider = document.querySelector('#slider-duan');
      const firstSlide = document.querySelector('#slider-duan .flickity-slider > .flickity-cell');
      const prevBtn = document.querySelector('#slider-duan .flickity-prev-next-button.previous');
      const nextBtn = document.querySelector('#slider-duan .flickity-prev-next-button.next');
      const dot = document.querySelector('#slider-duan .flickity-page-dots .dot');

      const sRect = slider?.getBoundingClientRect();
      const fRect = firstSlide?.getBoundingClientRect();
      const pRect = prevBtn?.getBoundingClientRect();
      const nRect = nextBtn?.getBoundingClientRect();
      const dRect = dot?.getBoundingClientRect();

      return {
        slider: sRect ? { width: sRect.width, height: sRect.height } : null,
        firstSlide: fRect ? { width: fRect.width, height: fRect.height } : null,
        prevButton: pRect ? { width: pRect.width, height: pRect.height } : null,
        nextButton: nRect ? { width: nRect.width, height: nRect.height } : null,
        dot: dRect ? { width: dRect.width, height: dRect.height } : null,
      };
    });

    const record = {
      variant: 'thp-gallery',
      sourceMetrics,
      sovaMetrics,
      firstSlideWidthRatio:
        sourceMetrics.firstSlide && sovaMetrics.firstSlide
          ? sovaMetrics.firstSlide.width / sourceMetrics.firstSlide.width
          : null,
    };

    test.info().annotations.push({
      type: 'parity-measurement',
      description: JSON.stringify(record, null, 2),
    });

    console.log('PARITY RECORD [thp-gallery]:', JSON.stringify(record, null, 2));

    expect(sovaMetrics.slider).not.toBeNull();
    expect(sovaMetrics.firstSlide).not.toBeNull();
    expect(sovaMetrics.firstSlide!.width).toBeCloseTo(1050, -1);
  });

  test('Mobile pricing geometry comparison against eras-clone source', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Measure eras-clone source
    await openSource(page, {
      key: 'pricing-mobile',
      url: '/thiet-ke-website/',
      file: 'thiet-ke-website/index.html',
      family: 'service',
      locale: 'vi',
      reason: 'parity',
    });
    await freeze(page);

    const sourceMetrics = await page.evaluate(() => {
      const slider = document.querySelector('#slider-74016963');
      const firstSlide = document.querySelector('#slider-74016963 .row');
      const sRect = slider?.getBoundingClientRect();
      const fRect = firstSlide?.getBoundingClientRect();
      return {
        slider: sRect ? { width: sRect.width, height: sRect.height } : null,
        firstSlide: fRect ? { width: fRect.width, height: fRect.height } : null,
      };
    });

    // Measure Sova Carousel fixture
    await page.goto('/dev-fixtures/carousel/pricing-mobile');
    await freeze(page);

    const sovaMetrics = await page.evaluate(() => {
      const slider = document.querySelector('#slider-74016963');
      const firstSlide = document.querySelector(
        '#slider-74016963 .flickity-slider > .flickity-cell',
      );
      const prevBtn = document.querySelector(
        '#slider-74016963 .flickity-prev-next-button.previous',
      );
      const nextBtn = document.querySelector('#slider-74016963 .flickity-prev-next-button.next');
      const dot = document.querySelector('#slider-74016963 .flickity-page-dots .dot');

      const sRect = slider?.getBoundingClientRect();
      const fRect = firstSlide?.getBoundingClientRect();
      const pRect = prevBtn?.getBoundingClientRect();
      const nRect = nextBtn?.getBoundingClientRect();
      const dRect = dot?.getBoundingClientRect();

      return {
        slider: sRect ? { width: sRect.width, height: sRect.height } : null,
        firstSlide: fRect ? { width: fRect.width, height: fRect.height } : null,
        prevButton: pRect ? { width: pRect.width, height: pRect.height } : null,
        nextButton: nRect ? { width: nRect.width, height: nRect.height } : null,
        dot: dRect ? { width: dRect.width, height: dRect.height } : null,
      };
    });

    const record = {
      variant: 'pricing-mobile',
      sourceMetrics,
      sovaMetrics,
      firstSlideWidthRatio:
        sourceMetrics.firstSlide && sovaMetrics.firstSlide
          ? sovaMetrics.firstSlide.width / sourceMetrics.firstSlide.width
          : null,
    };

    test.info().annotations.push({
      type: 'parity-measurement',
      description: JSON.stringify(record, null, 2),
    });

    console.log('PARITY RECORD [pricing-mobile]:', JSON.stringify(record, null, 2));

    expect(sovaMetrics.slider).not.toBeNull();
    expect(sovaMetrics.firstSlide).not.toBeNull();
    expect(sovaMetrics.firstSlide!.width / sovaMetrics.slider!.width).toBeCloseTo(0.85, 1);
  });
});
