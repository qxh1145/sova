import { expect, expectNoDuplicateIds, test } from './fixtures';
import { homePages } from '../../src/data/pages/home';
import { TESTIMONIALS_IDS } from '../../src/components/testimonials/testimonialsIds';

// Testimonials hidden (stakeholder review 2026-10-27): the quotes came from the source site's clients.
test.describe('Testimonials section', () => {
  for (const { path, locale } of [
    { path: '/', locale: 'vi' },
    { path: '/en/home/', locale: 'en' },
  ] as const) {
    test(`${locale.toUpperCase()} placements are empty, so ${path} renders no testimonials section or slider`, async ({
      page,
    }) => {
      expect(homePages.find((p) => p.locale === locale)!.testimonialPlacements).toEqual([]);

      await page.goto(path);

      await expect(page.locator(`#${TESTIMONIALS_IDS.home[locale].section}`)).toHaveCount(0);
      await expect(page.locator('.ss-kh, .slide-kh')).toHaveCount(0);

      // The neighbouring sections still render.
      await expect(page.locator('.col-thanhtuu')).toBeVisible();
      await expect(page.locator('.cs-moving_text_wrap')).toBeVisible();

      await expectNoDuplicateIds(page);
    });
  }
});
