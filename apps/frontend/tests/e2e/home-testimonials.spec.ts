import type { Locator, Page } from '@playwright/test';
import { dragSlider, expect, expectNoDuplicateIds, test } from './fixtures';
import { homePages } from '../../src/data/pages/home';
import { testimonials } from '../../src/data/testimonials';
import { assets } from '../../src/data/assets';

function selectedSlide(slides: Locator) {
  return slides.evaluateAll((els) => els.findIndex((e) => e.classList.contains('is-selected')));
}

async function tickSlide(page: Page, slides: Locator, ms: number) {
  await page.clock.runFor(ms);
  await page.waitForTimeout(50);
  return selectedSlide(slides);
}

async function openPausedHome(page: Page, url = '/') {
  await page.clock.install();
  await page.goto(url);
  const slider = page.locator('#slider-1717467276');
  await slider.scrollIntoViewIfNeeded();
  await expect(slider.locator('.flickity-slider').first()).toHaveAttribute('style', /translate/);
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 500));
}

test.describe('Testimonials section', () => {
  const testimonialMap = new Map(testimonials.map((t) => [`${t.locale}:${t.id}`, t]));
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  test('Testimonials section markup, classes, placements and copy on VI and EN home routes', async ({
    page,
  }) => {
    const cases = [
      {
        path: '/',
        sectionId: '#section_1900032435',
        sliderId: '#slider-1717467276',
        locale: 'vi' as const,
        localeIndex: 0,
        expectedEyebrow: 'Sova',
        expectedTitle: 'Khách hàng nhận xét về chúng tôi',
        slideIds: ['row-14011233', 'row-693377910', 'row-2021009934'],
      },
      {
        path: '/en/home/',
        sectionId: '#section_1228410742',
        sliderId: '#slider-283546209',
        locale: 'en' as const,
        localeIndex: 1,
        expectedEyebrow: 'Sova',
        expectedTitle: 'Customer Reviews',
        slideIds: ['row-1450896083', 'row-1154937134', 'row-1376163772'],
      },
    ];

    for (const c of cases) {
      await page.goto(c.path);

      const section = page.locator(c.sectionId);
      await expect(section).toBeVisible();
      await expect(section).toHaveClass(/ss-kh/);

      // Section copy
      const copy = homePages[c.localeIndex].sectionCopy.testimonials;
      if (copy.eyebrow) {
        await expect(section.locator('.col-inner h4 strong').first()).toHaveText(copy.eyebrow);
      }
      await expect(section.locator('.col-inner h2').first()).toHaveText(copy.title);
      await expect(section.locator('.col-inner h2').first().locator('br')).toHaveCount(
        (copy.titleLines?.length ?? 1) - 1,
      );

      // Decorative art resolved from the record's asset ids
      const art = homePages[c.localeIndex].testimonialArtIds;
      const artSrc = (id: string) => assetMap.get(id)!.src;
      await expect(section.locator('.img-inner img')).toHaveAttribute('src', artSrc(art.photoId));
      await expect(section.locator(`p:has(+ ${c.sliderId}) img`)).toHaveAttribute(
        'src',
        artSrc(art.quoteIconId),
      );

      // 3 cards in placement order
      const homeRecord = homePages[c.localeIndex];
      const placements = homeRecord.testimonialPlacements;
      const slides = section.locator(`${c.sliderId} .flickity-slider > .row`);
      await expect(slides).toHaveCount(3);

      for (let i = 0; i < placements.length; i++) {
        const item = testimonialMap.get(`${c.locale}:${placements[i].entityId}`)!;
        const slide = slides.nth(i);
        await expect(slide).toHaveAttribute('id', c.slideIds[i]);
        await expect(slide.locator('.nd-kh')).toHaveText(item.quote.html);
        await expect(slide.locator('.nd-kh + .text img')).toHaveAttribute(
          'src',
          artSrc(art.lineId),
        );
        await expect(slide.locator('.icon-box h3 strong')).toHaveText(item.person);
        await expect(slide.locator('.icon-box p')).toHaveText(item.role!);
        await expect(slide.locator('.icon-box-img img')).toHaveAttribute(
          'src',
          assetMap.get(item.avatarId!)!.src,
        );
      }

      await expectNoDuplicateIds(page);
    }
  });

  test('Autoplay advances every 6000ms, pauses on hover, and resumes after leave', async ({
    page,
  }) => {
    await openPausedHome(page, '/');
    const slider = '#slider-1717467276';
    const slides = page.locator(`${slider} .flickity-slider > *`);
    await expect(slides).toHaveCount(3);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Hover pauses
    await page.locator(`${slider} .flickity-prev-next-button.next`).hover();
    expect(await tickSlide(page, slides, 12000)).toBe(0);

    // Mouse leave resumes and advances every 6000ms
    await page.mouse.move(10, 10);
    expect(await tickSlide(page, slides, 5500)).toBe(0);
    expect(await tickSlide(page, slides, 600)).toBe(1);

    // Next slide advances at 6000ms
    expect(await tickSlide(page, slides, 5500)).toBe(1);
    expect(await tickSlide(page, slides, 600)).toBe(2);
  });

  test('Controls: clicking next, prev, or dot navigates to matching cell', async ({ page }) => {
    await openPausedHome(page, '/');
    const slider = '#slider-1717467276';
    const slides = page.locator(`${slider} .flickity-slider > *`);
    const region = page.getByRole('region', { name: 'Khách hàng nhận xét về chúng tôi' });
    const prevBtn = region.getByRole('button', { name: 'Trước' });
    const nextBtn = region.getByRole('button', { name: 'Tiếp theo' });

    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await nextBtn.click();
    await expect(slides.nth(1)).toHaveClass(/is-selected/);
    await prevBtn.click();
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await region.getByRole('button', { name: 'Chuyển tới slide 3' }).click();
    await expect(slides.nth(2)).toHaveClass(/is-selected/);
  });

  test('Drag: 5px does not advance; full drag advances', async ({ page }) => {
    // Flowing clock for drag release
    await page.clock.install();
    await page.goto('/');
    const slider = '#slider-1717467276';
    const viewport = page.locator(`${slider} .flickity-viewport`);
    await viewport.scrollIntoViewIfNeeded();
    const slides = page.locator(`${slider} .flickity-slider > *`);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // 5px under dragThreshold:10
    await dragSlider(page, viewport, 5, 5);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Full drag past threshold
    await dragSlider(page, viewport, 0.35);
    await expect(slides.nth(1)).toHaveClass(/is-selected/);
  });

  test('Adaptive height at 390px width follows selected cell', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openPausedHome(page, '/');
    const slider = '#slider-1717467276';
    const slides = page.locator(`${slider} .flickity-slider > *`);
    const viewport = page.locator(`${slider} .flickity-viewport`);
    const region = page.getByRole('region', { name: 'Khách hàng nhận xét về chúng tôi' });

    for (let i = 0; i < 3; i++) {
      await region.getByRole('button', { name: `Chuyển tới slide ${i + 1}` }).click();
      await expect(slides.nth(i)).toHaveClass(/is-selected/);
      await page.clock.runFor(1000);
      const cell = (await slides.nth(i).boundingBox())!.height;
      await expect.poll(async () => (await viewport.boundingBox())!.height).toBeCloseTo(cell, 0);
    }
  });
});
