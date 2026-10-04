import { expect, test } from './fixtures';

test.describe('Carousel contract checks', () => {
  test('Testimonials autoplay: advances every 6000ms, wraps last to first, and adapts height', async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto('/dev-fixtures/carousel/testimonials');

    const slides = page.locator('#slider-1717467276 .flickity-slider > .flickity-cell');
    const dots = page.locator('#slider-1717467276 .flickity-page-dots .dot');

    await expect(slides).toHaveCount(3);
    await expect(dots).toHaveCount(3);

    // Initial state: slide 0
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await expect(dots.nth(0)).toHaveClass(/is-selected/);

    // After 6000ms: slide 1
    await page.clock.fastForward(6000);
    await expect(slides.nth(1)).toHaveClass(/is-selected/);
    await expect(dots.nth(1)).toHaveClass(/is-selected/);

    // After another 6000ms: slide 2
    await page.clock.fastForward(6000);
    await expect(slides.nth(2)).toHaveClass(/is-selected/);
    await expect(dots.nth(2)).toHaveClass(/is-selected/);

    // After another 6000ms: wraps around to slide 0
    await page.clock.fastForward(6000);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await expect(dots.nth(0)).toHaveClass(/is-selected/);

    // Viewport adapts height to the active slide
    const viewport = page.locator('#slider-1717467276 .flickity-viewport');
    const viewportBox = await viewport.boundingBox();
    expect(viewportBox).not.toBeNull();
    expect(viewportBox!.height).toBeGreaterThan(50);
  });

  test('THP gallery autoplay: advances every 3000ms, center align with 80% cells and peeking neighbours', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1320, height: 800 });
    await page.goto('/dev-fixtures/carousel/thp-gallery');
    await page.clock.install();

    const slider = page.locator('#slider-duan .slider');
    const slides = page.locator('#slider-duan .flickity-slider > .flickity-cell');
    const dots = page.locator('#slider-duan .flickity-page-dots .dot');

    await expect(slides).toHaveCount(2);
    await expect(dots).toHaveCount(2);

    // Allow initial animation frame and layout to settle under fake clock
    await page.clock.runFor(100);

    // Verify slide width is capped at 1050px (~80% of 1320px container)
    const sliderBox = await slider.boundingBox();
    const slideBox = await slides.nth(0).boundingBox();
    expect(sliderBox).not.toBeNull();
    expect(slideBox).not.toBeNull();

    // 1050 / 1320 is ~0.795
    const ratio = slideBox!.width / sliderBox!.width;
    expect(ratio).toBeGreaterThan(0.75);
    expect(ratio).toBeLessThan(0.85);

    // Verify center alignment: slide center aligns closely with slider center
    const sliderCenter = sliderBox!.x + sliderBox!.width / 2;
    const slideCenter = slideBox!.x + slideBox!.width / 2;
    expect(Math.abs(sliderCenter - slideCenter)).toBeLessThan(5);

    // Slide 0 selected initially
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Advance 3000ms -> slide 1 selected
    await page.clock.fastForward(3000);
    await expect(slides.nth(1)).toHaveClass(/is-selected/);
    await expect(dots.nth(1)).toHaveClass(/is-selected/);

    // Advance 3000ms -> wraps to slide 0
    await page.clock.fastForward(3000);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await expect(dots.nth(0)).toHaveClass(/is-selected/);
  });

  test('Mobile pricing: 85% cells at 390px, advances every 6000ms, hidden at >=550px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.clock.install();
    await page.goto('/dev-fixtures/carousel/pricing-mobile');

    const wrapper = page.locator('#slider-74016963');
    await expect(wrapper).toBeVisible();

    const slider = page.locator('#slider-74016963 .slider');
    const slides = page.locator('#slider-74016963 .flickity-slider > .flickity-cell');

    const sliderBox = await slider.boundingBox();
    const slideBox = await slides.nth(0).boundingBox();
    expect(sliderBox).not.toBeNull();
    expect(slideBox).not.toBeNull();

    // Max width 85% of slider
    const ratio = slideBox!.width / sliderBox!.width;
    expect(ratio).toBeGreaterThan(0.8);
    expect(ratio).toBeLessThanOrEqual(0.86);

    // Autoplay advances every 6000ms
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await page.clock.fastForward(6000);
    await expect(slides.nth(1)).toHaveClass(/is-selected/);

    // When resized to >= 550px, show-for-small hides the wrapper
    await page.setViewportSize({ width: 600, height: 800 });
    await expect(wrapper).toBeHidden();
  });

  test('Hover pause: pauses on hover and resumes after leave', async ({ page }) => {
    await page.clock.install();
    await page.goto('/dev-fixtures/carousel/testimonials');

    const slides = page.locator('#slider-1717467276 .flickity-slider > .flickity-cell');
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Hover over viewport
    const viewport = page.locator('#slider-1717467276 .flickity-viewport');
    await viewport.hover();

    // Fast-forward 12000ms (2 autoplay intervals): should remain on slide 0
    await page.clock.fastForward(12000);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Move pointer away outside viewport
    const box = await viewport.boundingBox();
    await page.mouse.move(0, (box?.y ?? 0) + (box?.height ?? 100) + 100);

    // Fast-forward 6000ms: should advance to slide 1
    await page.clock.fastForward(6000);
    await expect(slides.nth(1)).toHaveClass(/is-selected/);
  });

  test('Controls: click and keyboard navigation on next, prev, and dots', async ({ page }) => {
    await page.goto('/dev-fixtures/carousel/testimonials');

    const slides = page.locator('#slider-1717467276 .flickity-slider > .flickity-cell');
    const prevBtn = page.locator('#slider-1717467276 .flickity-prev-next-button.previous');
    const nextBtn = page.locator('#slider-1717467276 .flickity-prev-next-button.next');
    const dots = page.locator('#slider-1717467276 .flickity-page-dots .dot');

    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Click next button
    await nextBtn.click();
    await expect(slides.nth(1)).toHaveClass(/is-selected/);

    // Click prev button
    await prevBtn.click();
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Click dot 2 (3rd slide)
    await dots.nth(2).click();
    await expect(slides.nth(2)).toHaveClass(/is-selected/);

    // Keyboard navigation: focus next button and press Enter
    await nextBtn.focus();
    await page.keyboard.press('Enter');
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Keyboard navigation: focus dot 1 and press Enter
    await dots.nth(1).focus();
    await page.keyboard.press('Enter');
    await expect(slides.nth(1)).toHaveClass(/is-selected/);
  });

  test('Drag: sub-threshold drag does not advance; drag past threshold advances', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/carousel/testimonials');

    const viewport = page.locator('#slider-1717467276 .flickity-viewport');
    const slides = page.locator('#slider-1717467276 .flickity-slider > .flickity-cell');
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    const box = (await viewport.boundingBox())!;
    const startX = box.x + box.width * 0.4;
    const startY = box.y + box.height / 2;

    // Sub-threshold drag: 5px horizontally (threshold is 10)
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 5, startY, { steps: 5 });
    await page.mouse.up();

    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Drag past threshold and distance (> 50% slide width): moves to next slide
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - Math.round(box.width * 0.35), startY, { steps: 15 });
    await page.mouse.up();

    await expect(slides.nth(1)).toHaveClass(/is-selected/);
  });

  test('Single child: no arrows, no dots, no autoplay', async ({ page }) => {
    await page.goto('/dev-fixtures/carousel/testimonials?single=1');
    await page.clock.install();

    const slides = page.locator('#slider-1717467276 .flickity-slider > .flickity-cell');
    await expect(slides).toHaveCount(1);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // No arrows and no dots
    await expect(page.locator('#slider-1717467276 .flickity-prev-next-button')).toHaveCount(0);
    await expect(page.locator('#slider-1717467276 .flickity-page-dots')).toHaveCount(0);

    // No autoplay advance
    await page.clock.fastForward(12000);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
  });

  test('Navigation away: destroys instances and timers with no console errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await page.clock.install();
    await page.goto('/dev-fixtures/carousel/testimonials');
    await page.clock.fastForward(1000);

    // Navigate to another carousel variant while autoplay is running
    await page.goto('/dev-fixtures/carousel/thp-gallery');
    await page.clock.fastForward(1000);

    // Navigate back
    await page.goto('/dev-fixtures/carousel/testimonials');
    await page.clock.fastForward(2000);

    expect(consoleErrors).toEqual([]);
  });

  test('Unknown variant returns 404', async ({ page }) => {
    const response = await page.goto('/dev-fixtures/carousel/nope');
    expect(response?.status()).toBe(404);
  });
});
