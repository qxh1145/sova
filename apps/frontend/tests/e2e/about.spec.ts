import { expect, expectNoDuplicateIds, test } from './fixtures';
import { aboutPages } from '../../src/data/pages/about';
import { stats } from '../../src/data/stats';

const ABOUT_ROUTES = [
  {
    locale: 'vi',
    path: '/gioi-thieu/',
    bannerId: 'banner-588612431',
    targetSectionId: 'section_1141404686',
    purposeSectionId: 'section_131774738',
    timelineHeadingSectionId: 'section_1028360740',
    timelineSectionId: 'section_1917554661',
    pillarsSectionId: 'section_409269634',
    testimonialsSectionId: 'section_1376011757',
    headingLines: ['Kiến tạo & Nâng tầm', 'thương hiệu'],
    ctaHref: '/ho-so-nang-luc-eras-vietnam/',
    expectedTestimonials: [
      {
        person: 'Anh Bình',
        quoteSnippet: 'Tôi đã tham khảo khá nhiều các đơn vị thiết kế website khác nhau',
      },
      {
        person: 'ĐỖ MỸ LINH',
        quoteSnippet: 'Là đối tác lâu năm với Sova',
      },
      {
        person: 'Anh Đức Anh',
        quoteSnippet: 'Với sự ăn ý trong lần hợp tác đầu tiên về dự án website của Công ty',
      },
    ],
  },
  {
    locale: 'en',
    path: '/en/about-us/',
    bannerId: 'banner-1388775398',
    targetSectionId: 'section_797840299',
    purposeSectionId: 'section_919330019',
    timelineHeadingSectionId: 'section_754352421',
    timelineSectionId: 'section_1904563230',
    pillarsSectionId: 'section_683818777',
    testimonialsSectionId: 'section_229177142',
    headingLines: ['Strategically Building', 'Elevating Brand Value'],
    ctaHref: '/en/porfolio-eras-vietnam/',
    expectedTestimonials: [
      {
        person: 'Mr Binh',
        quoteSnippet: 'I have consulted with many different website design companies',
      },
      {
        person: 'Ms Do My Linh',
        quoteSnippet: 'As a long-term partner with Sova',
      },
      {
        person: 'Mr Duc Anh',
        quoteSnippet: 'With the seamless collaboration on the first website project',
      },
    ],
  },
];

test.describe('About Pages (Story 5.10)', () => {
  for (const config of ABOUT_ROUTES) {
    const record = aboutPages.find((p) => p.locale === config.locale)!;

    test(`Sections render in source order on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const sectionIds = await page.evaluate(() => {
        const main = document.querySelector('div#content[role="main"]');
        if (!main) return [];
        const elements = main.querySelectorAll(':scope > .banner, :scope > section');
        return Array.from(elements).map((el) => el.id);
      });

      expect(sectionIds).toEqual([
        config.bannerId,
        config.targetSectionId,
        config.purposeSectionId,
        config.timelineHeadingSectionId,
        config.timelineSectionId,
        config.pillarsSectionId,
        config.testimonialsSectionId,
      ]);

      await expectNoDuplicateIds(page);
    });

    test(`Exactly one main h1 with two lines on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const h1s = page.locator('div#content[role="main"] h1');
      await expect(h1s).toHaveCount(1);

      const typewriterSpans = page.locator('div#content[role="main"] h1 .typewriter');
      await expect(typewriterSpans).toHaveCount(config.headingLines.length);
      await expect(typewriterSpans).toHaveText(config.headingLines);
    });

    test(`Pre-hydration stats render final values on ${config.path}`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(config.path);

      const countUps = page.locator('.col-thanhtuu span.count-up');
      await expect(countUps).toHaveCount(4);
      const values = await countUps.allInnerTexts();
      expect(values).toEqual(
        record.statIds.map((id) =>
          String(stats.find((s) => s.id === id)!.value).padStart(2, '0'),
        ),
      );

      await context.close();
    });

    test(`Timeline section contains 9 milestones on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const timelineItems = page.locator(
        `#${config.timelineSectionId} .timeline-track > .timeline-item:not([aria-hidden="true"])`,
      );
      await expect(timelineItems).toHaveCount(9);
    });

    test(`Timeline stacks without duplicates at 390px on ${config.path}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(config.path);

      const track = page.locator(`#${config.timelineSectionId} .timeline-track`);
      await expect(track.locator('> .timeline-item[aria-hidden="true"]').first()).toBeHidden();
      await expect(track.locator('> .timeline-item:visible')).toHaveCount(9);
    });

    test(`Timeline stops and scrolls under reduced motion on ${config.path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(config.path);

      const wrap = page.locator(`#${config.timelineSectionId} .timeline-track-wrap`);
      const track = wrap.locator('.timeline-track');
      await expect(track).toHaveCSS('animation-name', 'none');
      await expect(track.locator('> .timeline-item[aria-hidden="true"]').first()).toBeHidden();
      await expect(wrap).toHaveCSS('overflow-x', 'auto');
      expect(await wrap.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    });

    test(`Goals grid and purpose panels follow data on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const goalTitles = page.locator(`#${config.targetSectionId} .row_muctieu.hide-for-small h3`);
      await expect(goalTitles).toHaveCount(record.goals.length);
      await expect(goalTitles).toHaveText(record.goals.map((g) => g.title));

      const panels = page.locator(`#${config.purposeSectionId} .row_cacsp .col-line-top`);
      await expect(panels).toHaveCount(record.purposePanels.length);
      await expect(panels.locator('h3')).toHaveText(record.purposePanels.map((p) => p.title));
    });

    test(`Section headings follow data line breaks on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const copy = record.sectionCopy;
      const headings = [
        [`#${config.targetSectionId} .col-thanhtuu h2`, copy.achievements],
        [`#${config.targetSectionId} .row_muctieu.hide-for-small h2`, copy.goals],
        [`#${config.purposeSectionId} h2`, copy.purpose],
        [`#${config.timelineHeadingSectionId} h2`, copy.timeline],
        [`#${config.pillarsSectionId} h2`, copy.pillars],
      ] as const;
      for (const [selector, section] of headings) {
        const lines = section.titleLines ?? [section.title];
        const h2 = page.locator(selector);
        await expect(h2).toHaveCount(1);
        // textContent with <br> as newline: innerText would apply CSS text-transform.
        const text = await h2.evaluate((el) => {
          const copy = el.cloneNode(true) as HTMLElement;
          copy.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
          return copy.textContent;
        });
        expect(text).toBe(lines.join('\n'));
        await expect(h2.locator('br')).toHaveCount(lines.length - 1);
      }
    });

    test(`Pillars section renders 3 category columns and 27 items on ${config.path}`, async ({
      page,
    }) => {
      await page.goto(config.path);

      const gridCols = page.locator(
        `#${config.pillarsSectionId} .hover_gra.hide-for-small .col-logo`,
      );
      await expect(gridCols).toHaveCount(3);

      const gridItems = page.locator(
        `#${config.pillarsSectionId} .hover_gra.hide-for-small .icon-box`,
      );
      await expect(gridItems).toHaveCount(27);

      const sliderCols = page.locator(
        `#${config.pillarsSectionId} .slide_gthieu .col-logo`,
      );
      await expect(sliderCols).toHaveCount(3);

      const sliderItems = page.locator(
        `#${config.pillarsSectionId} .slide_gthieu .icon-box`,
      );
      await expect(sliderItems).toHaveCount(27);

      // Sanitized HTML renders as markup: entities decode, none print literally.
      await expect(page.locator(`#${config.pillarsSectionId}`)).not.toContainText('&amp;');
    });

    test(`Responsive sliders vs grids toggle correctly at viewport breakpoints on ${config.path}`, async ({
      page,
    }) => {
      const targetGrid = page.locator(`#${config.targetSectionId} .row_muctieu.hide-for-small`);
      const targetSlider = page.locator(
        `#${config.targetSectionId} .slide_gth.show-for-small`,
      );

      const pillarsGrid = page.locator(
        `#${config.pillarsSectionId} .hover_gra.hide-for-small`,
      );
      const pillarsSlider = page.locator(
        `#${config.pillarsSectionId} .slide_gthieu.show-for-small`,
      );

      // Mobile 390px
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(config.path);
      await expect(targetGrid).toBeHidden();
      await expect(targetSlider).toBeVisible();
      await expect(pillarsGrid).toBeHidden();
      await expect(pillarsSlider).toBeVisible();

      // Mobile 549px
      await page.setViewportSize({ width: 549, height: 844 });
      await expect(targetGrid).toBeHidden();
      await expect(targetSlider).toBeVisible();
      await expect(pillarsGrid).toBeHidden();
      await expect(pillarsSlider).toBeVisible();

      // Desktop 550px
      await page.setViewportSize({ width: 550, height: 844 });
      await expect(targetGrid).toBeVisible();
      await expect(targetSlider).toBeHidden();
      await expect(pillarsGrid).toBeVisible();
      await expect(pillarsSlider).toBeHidden();

      // Desktop 1280px
      await page.setViewportSize({ width: 1280, height: 844 });
      await expect(targetGrid).toBeVisible();
      await expect(targetSlider).toBeHidden();
      await expect(pillarsGrid).toBeVisible();
      await expect(pillarsSlider).toBeHidden();
    });

    test(`Testimonials render 3 reviews and no partner section on ${config.path}`, async ({
      page,
    }) => {
      await page.goto(config.path);

      const testimonialSlides = page.locator(
        `#${config.testimonialsSectionId} .slide-kh .flickity-slider > *`,
      );
      await expect(testimonialSlides).toHaveCount(3);

      for (let i = 0; i < config.expectedTestimonials.length; i++) {
        const slide = testimonialSlides.nth(i);
        const expected = config.expectedTestimonials[i];
        await expect(slide.locator('h3 strong')).toHaveText(expected.person);
        await expect(slide.locator('.nd-kh')).toContainText(expected.quoteSnippet);
      }

      // Verify no partner section
      const partners = page.locator('section.section-partner, .row-partner, .col-partner');
      await expect(partners).toHaveCount(0);

      // Verify CTA target href
      const cta = page.locator(`#${config.bannerId} a.but-lh`);
      await expect(cta).toHaveAttribute('href', config.ctaHref);
    });
  }
});
