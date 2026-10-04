import type { Locator, Page } from '@playwright/test';
import { expect, test } from './fixtures';

const TESTIMONIALS = '#slider-1717467276';

/** Hydrate on a running fake clock, wait for Embla, then freeze time so only runFor() moves it. */
async function openPaused(page: Page, url: string) {
  await page.clock.install();
  await page.goto(url);
  await expect(page.locator('.flickity-slider').first()).toHaveAttribute('style', /translate/);
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 500));
}

function selected(slides: Locator) {
  return slides.evaluateAll((els) => els.findIndex((e) => e.classList.contains('is-selected')));
}

/** Advance the paused clock and let React commit before reading the selection. */
async function tick(page: Page, slides: Locator, ms: number) {
  await page.clock.runFor(ms);
  await page.waitForTimeout(50); // real time for React's microtask/MessageChannel flush
  return selected(slides);
}

/** Move the pointer to the empty bottom edge of the fixture page (fires mouseleave). */
async function leaveSlider(page: Page) {
  const { width, height } = page.viewportSize()!;
  await page.mouse.move(width / 2, height - 5);
}

const STEP = 250;

/**
 * Sync to an autoplay advance (known to within STEP), then prove the next one lands at `delay`:
 * no advance at delay - 2*STEP, advance by delay. A slower or faster interval fails.
 */
async function expectAutoplayEvery(page: Page, slides: Locator, delay: number) {
  const count = await slides.count();
  let current = await selected(slides);
  for (let waited = 0; ; waited += STEP) {
    expect(waited, 'first autoplay advance').toBeLessThanOrEqual(delay);
    const next = await tick(page, slides, STEP);
    if (next !== current) {
      expect(next).toBe((current + 1) % count);
      current = next;
      break;
    }
  }
  for (let i = 0; i < count; i++) {
    expect(await tick(page, slides, delay - 2 * STEP), 'advanced too early').toBe(current);
    const next = await tick(page, slides, 2 * STEP);
    expect(next, 'did not advance on time').toBe((current + 1) % count);
    current = next;
  }
}

test.describe('Carousel contract checks', () => {
  test('Testimonials autoplay: advances every 6000ms and wraps last to first', async ({ page }) => {
    await openPaused(page, '/dev-fixtures/carousel/testimonials');
    const slides = page.locator(`${TESTIMONIALS} .flickity-slider > *`);
    const dots = page.locator(`${TESTIMONIALS} .flickity-page-dots .dot`);
    await expect(slides).toHaveCount(3);
    await expect(dots).toHaveCount(3);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await expect(dots.nth(0)).toHaveClass(/is-selected/);

    // Loops through all 3 slides, so it covers the last -> first wrap.
    await expectAutoplayEvery(page, slides, 6000);
  });

  test('Testimonials adaptive height: viewport follows the selected slide', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openPaused(page, '/dev-fixtures/carousel/testimonials');
    const slides = page.locator(`${TESTIMONIALS} .flickity-slider > *`);
    const viewport = page.locator(`${TESTIMONIALS} .flickity-viewport`);
    const region = page.getByRole('region', { name: 'Carousel' });

    const heights: number[] = [];
    for (let i = 0; i < 3; i++) {
      await region.getByRole('button', { name: `Go to slide ${i + 1}` }).click();
      await expect(slides.nth(i)).toHaveClass(/is-selected/);
      await page.clock.runFor(1000); // settle height transition
      const cell = (await slides.nth(i).boundingBox())!.height;
      await expect.poll(async () => (await viewport.boundingBox())!.height).toBeCloseTo(cell, 0);
      heights.push(cell);
    }
    // Cells keep their own height (no stretch to the tallest), so the quotes measure differently.
    expect(new Set(heights.map(Math.round)).size).toBeGreaterThan(1);
  });

  test('THP gallery autoplay: advances every 3000ms, 1050px centred cells with peeking neighbours', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1320, height: 800 });
    await openPaused(page, '/dev-fixtures/carousel/thp-gallery');

    const slider = page.locator('#slider-duan .slider');
    const slides = page.locator('#slider-duan .flickity-slider > *');
    await expect(slides).toHaveCount(2);
    await expect(page.locator('#slider-duan .flickity-page-dots .dot')).toHaveCount(2);

    const sliderBox = (await slider.boundingBox())!;
    const slideBox = (await slides.nth(0).boundingBox())!;
    // Desktop: `.slider-style-focus .flickity-slider>*{max-width:1050px}`; the page-scoped 80% rule is mobile-only.
    expect(slideBox.width).toBeCloseTo(1050, 0);
    expect(slideBox.width).toBeLessThan(sliderBox.width);
    const sliderCenter = sliderBox.x + sliderBox.width / 2;
    expect(Math.abs(sliderCenter - (slideBox.x + slideBox.width / 2))).toBeLessThan(5);

    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await expectAutoplayEvery(page, slides, 3000);
  });

  test('Mobile pricing: 85% cells at 390px, advances every 6000ms, hidden at >=550px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openPaused(page, '/dev-fixtures/carousel/pricing-mobile');

    const wrapper = page.locator('#slider-74016963');
    await expect(wrapper).toBeVisible();
    const slider = page.locator('#slider-74016963 .slider');
    const slides = page.locator('#slider-74016963 .flickity-slider > *');

    const sliderBox = (await slider.boundingBox())!;
    const slideBox = (await slides.nth(0).boundingBox())!;
    expect(slideBox.width / sliderBox.width).toBeCloseTo(0.85, 1);

    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await expectAutoplayEvery(page, slides, 6000);

    await page.setViewportSize({ width: 600, height: 800 });
    await expect(wrapper).toBeHidden();
  });

  test('Hover pause: pauses on hover and resumes after leave', async ({ page }) => {
    await openPaused(page, '/dev-fixtures/carousel/testimonials');
    const slides = page.locator(`${TESTIMONIALS} .flickity-slider > *`);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Hovering a control counts too: Flickity pauses on the whole slider.
    await page.locator(`${TESTIMONIALS} .flickity-prev-next-button.next`).hover();
    expect(await tick(page, slides, 12000)).toBe(0);

    await leaveSlider(page);
    expect(await tick(page, slides, 5500)).toBe(0); // timer restarts on leave
    expect(await tick(page, slides, 500)).toBe(1);
  });

  test('Controls: labelled buttons work by click and keyboard, then autoplay stops', async ({
    page,
  }) => {
    await openPaused(page, '/dev-fixtures/carousel/testimonials');
    const slides = page.locator(`${TESTIMONIALS} .flickity-slider > *`);
    const region = page.getByRole('region', { name: 'Carousel' });
    const prevBtn = region.getByRole('button', { name: 'Previous' });
    const nextBtn = region.getByRole('button', { name: 'Next' });

    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await nextBtn.click();
    await expect(slides.nth(1)).toHaveClass(/is-selected/);
    await prevBtn.click();
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await region.getByRole('button', { name: 'Go to slide 3' }).click();
    await expect(slides.nth(2)).toHaveClass(/is-selected/);

    await nextBtn.focus();
    await page.keyboard.press('Enter');
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await region.getByRole('button', { name: 'Go to slide 2' }).focus();
    await page.keyboard.press('Enter');
    await expect(slides.nth(1)).toHaveClass(/is-selected/);

    // Flickity parity: interaction stops autoplay, even after the pointer leaves.
    await leaveSlider(page);
    expect(await tick(page, slides, 12000)).toBe(1);
  });

  test('Drag: sub-threshold drag does not advance; a real drag advances and stops autoplay', async ({
    page,
  }) => {
    // Embla's drag release settles on animation frames, so the gesture runs on a flowing clock.
    await page.clock.install();
    await page.goto('/dev-fixtures/carousel/testimonials');
    const viewport = page.locator(`${TESTIMONIALS} .flickity-viewport`);
    const slides = page.locator(`${TESTIMONIALS} .flickity-slider > *`);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    const box = (await viewport.boundingBox())!;
    const startX = box.x + box.width * 0.4;
    const startY = box.y + box.height / 2;

    // 5px is under dragThreshold:10
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 5, startY, { steps: 5 });
    await page.mouse.up();
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // 35% of the viewport width: past the threshold and far enough to snap to the next slide
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - Math.round(box.width * 0.35), startY, { steps: 15 });
    await page.mouse.up();
    await expect(slides.nth(1)).toHaveClass(/is-selected/);

    await leaveSlider(page);
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 500));
    expect(await tick(page, slides, 12000)).toBe(1);
  });

  test('Single child: no arrows, no dots, no autoplay', async ({ page }) => {
    await openPaused(page, '/dev-fixtures/carousel/testimonials?single=1');
    const slides = page.locator(`${TESTIMONIALS} .flickity-slider > *`);
    await expect(slides).toHaveCount(1);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await expect(page.locator(`${TESTIMONIALS} .flickity-prev-next-button`)).toHaveCount(0);
    await expect(page.locator(`${TESTIMONIALS} .flickity-page-dots`)).toHaveCount(0);
    expect(await tick(page, slides, 12000)).toBe(0);
  });

  test('Navigation away: client-side unmount leaves no running carousel or console errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await openPaused(page, '/dev-fixtures/carousel/testimonials');
    await page.clock.runFor(1000);

    // Client-side route change (React unmount, not a document reload).
    await page.clock.resume();
    await page.getByTestId('fixture-client-nav').evaluate((el) => (el as HTMLElement).click());
    await expect(page).toHaveURL(/\/thp-gallery\/?$/);
    await expect(page.locator(TESTIMONIALS)).toHaveCount(0);
    const thpSlides = page.locator('#slider-duan .flickity-slider > *');
    await expect(thpSlides.nth(0)).toHaveClass(/is-selected/);

    // A leaked testimonials timer would fire on a destroyed instance here.
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 500));
    await page.clock.runFor(12000);

    await page.clock.resume();
    await page.goBack();
    const slides = page.locator(`${TESTIMONIALS} .flickity-slider > *`);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await page.clock.fastForward(6500);
    await expect(slides.nth(1)).toHaveClass(/is-selected/);

    expect(consoleErrors).toEqual([]);
  });

  test('Unknown variant returns 404', async ({ page }) => {
    const response = await page.goto('/dev-fixtures/carousel/nope');
    expect(response?.status()).toBe(404);
  });
});
