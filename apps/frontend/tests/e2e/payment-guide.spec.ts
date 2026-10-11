import { expect, expectNoDuplicateIds, test } from './fixtures';
import { paymentGuides } from '../../src/data/pages/legal';
import { getPaymentPreset } from '../../src/components/legal/PaymentGuideView';

test.describe('Payment Guide Pages', () => {
  for (const record of paymentGuides) {
    test(`Route ${record.path} (${record.locale}) renders 200 with shell, single banner h2, accounts in order, missing QR slot and no duplicate IDs`, async ({
      page,
    }) => {
      const requestedUrls: string[] = [];
      page.on('request', (req) => {
        requestedUrls.push(req.url());
      });

      const response = await page.goto(record.path);
      expect(response?.status()).toBe(200);

      // Metadata from record.seo
      expect(await page.title()).toBe(record.seo.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        record.seo.description!,
      );

      // Shell header and footer
      await expect(page.locator('header#header')).toBeVisible();
      await expect(page.locator('footer#footer')).toBeVisible();

      // Banner id and exactly one h2 heading
      const preset = getPaymentPreset(record.path);
      const banner = page.locator(`#${preset.heroIds.banner}`);
      await expect(banner).toBeVisible();

      const h2 = banner.locator('h2');
      await expect(h2).toHaveCount(1);
      await expect(h2).toHaveText(record.title);
      await expect(h2.locator('b')).toHaveText(record.title);

      // Guide main column and cards row
      const guideRow = page.locator(`#${preset.guideIds.row}`);
      await expect(guideRow).toBeVisible();
      const guideCol = page.locator(`#${preset.guideIds.col}`);
      await expect(guideCol).toBeVisible();
      const cardsRow = page.locator(`#${preset.guideIds.cardsRow}`);
      await expect(cardsRow).toBeVisible();

      // Accounts render in order
      const cards = cardsRow.locator(':scope > .col');
      await expect(cards).toHaveCount(record.accounts.length);

      for (let i = 0; i < record.accounts.length; i++) {
        const account = record.accounts[i];
        const card = cards.nth(i);
        await expect(card).toBeVisible();

        // Account labels, bank, number, holder
        await expect(card).toContainText(account.bank);
        await expect(card).toContainText(account.accountNumber);
        await expect(card).toContainText(account.holder);
        await expect(card).toContainText(record.labels.accountNumber);
        await expect(card).toContainText(record.labels.holder);

        // QR slot has data-media-status="missing" in .img-inner and no <img>
        const qrSlot = card.locator('.img-inner [data-media-status="missing"]');
        await expect(qrSlot).toBeVisible();
        await expect(card.locator('img')).toHaveCount(0);
      }

      // Intro, step-2 instructions and e-wallet copy render in the guide column
      const firstText = (html: string) =>
        html
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 30);
      await expect(guideCol).toContainText(firstText(record.introduction.html));
      await expect(guideCol).toContainText(firstText(record.instructions.html));
      const walletRow = page.locator(`#${preset.walletIds.row}`);
      await expect(walletRow).toContainText(firstText(record.wallet.intro.html));
      await expect(walletRow).toContainText(firstText(record.wallet.steps.html));
      await expect(
        walletRow.locator(`#${preset.walletIds.imageId} .img-inner [data-media-status="missing"]`),
      ).toBeVisible();
      await expect(guideCol.locator('img')).toHaveCount(0);

      // No request to source QR images
      const forbiddenQrRequest = requestedUrls.find((url) =>
        /\/wp-content\/uploads\/.*(z44\d+|z45\d+|e4cb\w+)/.test(url),
      );
      expect(forbiddenQrRequest).toBeUndefined();

      // No duplicate ids
      await expectNoDuplicateIds(page);
    });
  }
});
