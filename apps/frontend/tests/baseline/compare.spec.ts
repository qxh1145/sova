import { expect, test } from '@playwright/test';
import { compareToBaseline } from './compare';
import manifest from './manifest.json';
import { hasSource, missingSourceMessage, openSource } from './source';

const row = manifest.rows.find((r) => r.key === 'home-vi')!;
const width = 1440;

// No skip on a missing baseline PNG: `updateSnapshots: 'none'` makes the comparison fail.
test.skip(!hasSource, missingSourceMessage);

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width, height: manifest.viewportHeight });
  await openSource(page, row);
});

test('source page matches its own baseline', async ({ page }) => {
  await compareToBaseline(page, row.key, width);
});

test('altered page fails the comparison', async ({ page }) => {
  await page.evaluate(() => {
    const block = document.createElement('div');
    block.style.cssText =
      'position:absolute;top:0;left:0;width:600px;height:600px;background:#f0f;z-index:99999';
    document.body.prepend(block);
  });
  await expect(compareToBaseline(page, row.key, width)).rejects.toThrow(
    /Screenshot comparison failed|pixels \(ratio .*\) are different/,
  );
});
