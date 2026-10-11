import { expect, expectNoDuplicateIds, test } from './fixtures';
import { legalPages } from '../../src/data/pages/legal';
import { getLegalPreset } from '../../src/components/legal/legalIds';

test.describe('Legal Pages (Story Legal Pages Tracer)', () => {
  for (const record of legalPages) {
    test(`Route ${record.path} renders 200 within shell with correct banner heading, body, and DOM structure`, async ({
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

      // Banner id and exactly one h2 heading
      const preset = getLegalPreset(record.path);
      const banner = page.locator(`#${preset.heroIds.banner}`);
      await expect(banner).toBeVisible();

      const h2 = banner.locator('h2');
      await expect(h2).toHaveCount(1);
      await expect(h2).toHaveText(record.title);

      // Emphasis tag
      if (preset.emphasis === 'strong') {
        await expect(h2.locator('strong')).toHaveText(record.title);
      } else {
        await expect(h2.locator('b')).toHaveText(record.title);
      }

      // Heading wrapper for terms
      if (preset.headingWrap) {
        const wrapRow = banner.locator(`#${preset.headingWrap.row}`);
        await expect(wrapRow).toBeVisible();
        const wrapCol = wrapRow.locator(`#${preset.headingWrap.col}`);
        await expect(wrapCol).toBeVisible();
      }

      // Body row, col, and snippet from record body
      const bodyCol = page.locator(`#${preset.bodyIds.row} #${preset.bodyIds.col} .col-inner`);
      await expect(bodyCol).toBeVisible();

      const plainTextSnippet = record.body.html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 40);
      await expect(bodyCol).toContainText(plainTextSnippet);

      // No duplicate ids
      await expectNoDuplicateIds(page);
    });
  }
});
