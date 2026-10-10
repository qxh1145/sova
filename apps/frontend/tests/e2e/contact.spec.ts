import { expect, expectNoDuplicateIds, test } from './fixtures';
import { contactPages } from '../../src/data/pages/contact';
import { siteSettings } from '../../src/data/site';
import { getContactPreset } from '../../src/components/contact/contactIds';

test.describe('Contact Pages (Story Contact Page Layout and Map)', () => {
  for (const record of contactPages) {
    const locale = record.locale;
    const settings = siteSettings.find((s) => s.locale === locale)!;
    const preset = getContactPreset(locale);

    test(`Route ${record.path} renders 200 within shell with hero, 3 info cards, lazy map iframe, and no duplicate ids`, async ({
      page,
    }) => {
      const response = await page.goto(record.path);
      expect(response?.status()).toBe(200);

      // Metadata from record.seo
      expect(await page.title()).toBe(record.seo.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        record.seo.description!,
      );

      // Shell header and footer
      const header = page.locator('header#header');
      await expect(header).toBeVisible();
      const footer = page.locator('footer#footer');
      await expect(footer).toBeVisible();

      // Hero section, h1 and breadcrumb
      const heroSection = page.locator(`section#${preset.hero.sectionId}`);
      await expect(heroSection).toBeVisible();
      const h1 = heroSection.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1).toHaveText(record.title);

      const breadcrumb = heroSection.locator(`#${preset.hero.breadcrumbId} p`);
      await expect(breadcrumb).toBeVisible();
      const homeLink = breadcrumb.locator('a');
      await expect(homeLink).toHaveText(record.breadcrumb.homeLabel);
      await expect(homeLink).toHaveAttribute('href', locale === 'en' ? '/en/' : '/');
      const currentSpan = breadcrumb.locator('span');
      await expect(currentSpan).toHaveText(record.breadcrumb.current);

      // Section heading
      const headingEl = page.locator(`#${preset.main.headingTextId} h2 strong`);
      await expect(headingEl).toHaveText(record.sectionHeading);

      // 3 Image cards row
      const imageCardsRow = page.locator(`#${preset.main.imageCardsRowId}`);
      await expect(imageCardsRow).toBeVisible();
      await expect(
        imageCardsRow.locator(`#${preset.main.imageCards.zalo.imageId} a`),
      ).toHaveAttribute('href', settings.zaloHref);
      await expect(
        imageCardsRow.locator(`#${preset.main.imageCards.hotline.imageId} a`),
      ).toHaveAttribute('href', settings.phones[0].href);
      await expect(
        imageCardsRow.locator(`#${preset.main.imageCards.messenger.imageId} a`),
      ).toHaveAttribute('href', settings.messengerHref);

      // Info row
      const infoCol = page.locator(`#${preset.main.infoColId}`);
      await expect(infoCol).toBeVisible();
      await expect(infoCol.locator('h2 span')).toHaveText(record.heading);

      // 3 info cards with SiteSettings values
      await expect(infoCol).toContainText(settings.address);
      await expect(infoCol).toContainText(settings.phones[0].label);
      await expect(infoCol).toContainText(settings.email);

      const phoneLink = infoCol.locator(`a[href="${settings.phones[0].href}"]`);
      await expect(phoneLink).toBeVisible();
      const emailLink = infoCol.locator(`a[href="mailto:${settings.email}"]`);
      await expect(emailLink).toBeVisible();

      // Empty form column
      const formCol = page.locator(`#${preset.main.formColId}`);
      await expect(formCol).toBeVisible();

      // Exactly one map iframe with src = mapEmbedUrl and loading="lazy"
      const iframes = page.locator('iframe');
      await expect(iframes).toHaveCount(1);
      await expect(iframes).toHaveAttribute('src', settings.mapEmbedUrl);
      await expect(iframes).toHaveAttribute('loading', 'lazy');
      await expect(iframes).toHaveAttribute('height', '500');
      await expect(iframes).toHaveAttribute('title', settings.address);

      // No duplicate ids
      await expectNoDuplicateIds(page);
    });
  }
});
