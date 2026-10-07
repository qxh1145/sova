import { expect, expectNoDuplicateIds, test } from './fixtures';

const SERVICES_ROUTES = [
  {
    locale: 'vi',
    path: '/thiet-ke-app-mobile/',
    heroBannerId: 'banner-2067401347',
    benefitsId: 'section_734451128',
    whyChooseUsId: 'section_1129413203',
    decorId: 'section_667104485',
    testimonialsId: 'section_611504284',
    faqId: 'section_2067065940',
    headingLines: ['Thiết kế App mobile', 'Chuyên Nghiệp'],
    faqCount: 8,
    breadcrumbId: 'text-2027656733',
    breadcrumb: { home: 'Trang chủ', homeHref: '/', text: 'Trang chủ / Dịch vụ / Thiết kế App Mobile' },
    imageWrapperId: 'image_984856161',
    sampleItem: 'Tăng tính tiện lợi, cạnh tranh',
  },
  {
    locale: 'en',
    path: '/en/app-mobile-development/',
    heroBannerId: 'banner-476138808',
    benefitsId: 'section_1647811100',
    whyChooseUsId: 'section_1411013231',
    decorId: 'section_2081583834',
    testimonialsId: 'section_1896637792',
    faqId: 'section_703582263',
    headingLines: ['Professional', 'Mobile App Design'],
    faqCount: 9,
    breadcrumbId: 'text-1919501786',
    breadcrumb: { home: 'Home', homeHref: '/en/home/', text: 'Home / Services / App Mobile Development' },
    imageWrapperId: 'image_1568157091',
    sampleItem: 'Increased Convenience & Competitiveness',
  },
];

test.describe('Mobile App Service Pages Tracer (Story 5.1)', () => {
  for (const config of SERVICES_ROUTES) {
    test(`Sections render in source order on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      // Section order verification inside main
      const sectionIds = await page.evaluate(() => {
        const main = document.querySelector('main#main');
        if (!main) return [];
        const elements = main.querySelectorAll(':scope > .banner, :scope > section');
        return Array.from(elements).map((el) => el.id);
      });

      expect(sectionIds).toEqual([
        config.heroBannerId,
        config.benefitsId,
        config.whyChooseUsId,
        config.decorId,
        config.testimonialsId,
        config.faqId,
      ]);

      await expectNoDuplicateIds(page);
    });

    test(`Exactly one main h1 with two lines on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const h1s = page.locator('main h1');
      await expect(h1s).toHaveCount(1);

      const typewriterSpans = page.locator('main h1 .typewriter');
      await expect(typewriterSpans).toHaveCount(config.headingLines.length);
      await expect(typewriterSpans).toHaveText(config.headingLines);
    });

    test(`FAQ items count per locale (${config.faqCount}) on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const faqItems = page.locator(`#${config.faqId} .accordion-item`);
      await expect(faqItems).toHaveCount(config.faqCount);

      // First item is open by default
      const firstTrigger = faqItems.first().locator('.accordion-title');
      await expect(firstTrigger).toHaveClass(/active/);

      // Duplicate question ID verification on EN (orders 2 and 3 have unique IDs)
      if (config.locale === 'en') {
        const itemIds = await faqItems.evaluateAll((items) => items.map((i) => i.id));
        const uniqueIds = new Set(itemIds);
        expect(uniqueIds.size).toBe(config.faqCount);
      }
    });

    test(`Hero, benefits and why-choose-us assets render on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const hero = page.locator(`#${config.heroBannerId}`);
      await expect(hero.locator('img.bg[src*="svzd-zdfvx-scaled-1.webp"]')).toHaveCount(1);
      await expect(page.locator(`#${config.imageWrapperId} img`)).toHaveCount(1);

      const breadcrumb = page.locator(`#${config.breadcrumbId}`);
      await expect(breadcrumb).toHaveText(config.breadcrumb.text);
      await expect(breadcrumb.getByRole('link', { name: config.breadcrumb.home })).toHaveAttribute(
        'href',
        config.breadcrumb.homeHref,
      );

      const benefits = page.locator(`#${config.benefitsId}`);
      await expect(benefits.locator('video source[src*="cybervpn.mp4"]')).toHaveCount(1);
      await expect(benefits.locator('.row_ptien .icon-box-img img')).toHaveCount(4);

      const gridCards = page.locator(`#${config.whyChooseUsId} .eras-table-price.hide-for-small > .col`);
      await expect(gridCards).toHaveCount(3);
      for (const card of await gridCards.all()) {
        await expect(card.locator('h3')).not.toBeEmpty();
        await expect(card.locator('.icon-box')).toHaveCount(7);
        await expect(card.locator('.icon-box img[src*="Subtract.svg"]')).toHaveCount(7);
        await expect(card.locator('.icon-box-text p')).toHaveCount(7);
      }
      await expect(
        page.locator(`#${config.whyChooseUsId} .eras-table-price.hide-for-small`),
      ).toContainText(config.sampleItem);
    });

    test(`Responsive why-choose-us slider vs grid toggle on ${config.path}`, async ({ page }) => {
      const slider = page.locator('.eras-table-price-slider.slide_tkap');
      const grid = page.locator('.eras-table-price.hide-for-small');

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(config.path);
      await expect(slider).toBeVisible();
      await expect(grid).toBeHidden();

      await page.setViewportSize({ width: 549, height: 844 });
      await expect(slider).toBeVisible();
      await expect(grid).toBeHidden();

      await page.setViewportSize({ width: 550, height: 844 });
      await expect(grid).toBeVisible();
      await expect(slider).toBeHidden();

      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(grid).toBeVisible();
      await expect(slider).toBeHidden();
    });

    test(`Testimonials renders 3 cards on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const testimonialSlides = page.locator(
        `#${config.testimonialsId} .slide-kh .flickity-slider > *`,
      );
      await expect(testimonialSlides).toHaveCount(3);
    });

    test(`No tab UI ([role=tablist]) on service page on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const tablists = page.locator('[role=tablist]');
      await expect(tablists).toHaveCount(0);
    });
  }

  test('EN duplicate FAQ items open independently without key warnings', async ({ page }) => {
    const keyWarnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && /same key/i.test(msg.text())) keyWarnings.push(msg.text());
    });

    await page.goto('/en/app-mobile-development/');
    const items = page.locator('#section_703582263 .accordion-item');
    const second = items.nth(1).locator('.accordion-title');
    const third = items.nth(2).locator('.accordion-title');

    await expect(second).toHaveText(await third.innerText());

    await second.click();
    await expect(second).toHaveClass(/active/);
    await expect(third).not.toHaveClass(/active/);

    await third.click();
    await expect(third).toHaveClass(/active/);
    await expect(second).not.toHaveClass(/active/);

    expect(keyWarnings).toEqual([]);
  });
});
