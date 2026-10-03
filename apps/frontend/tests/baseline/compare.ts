import { expect, type Page } from '@playwright/test';
import manifest from './manifest.json';
import { freeze } from './source';

/** Set the baseline viewport, freeze `page` (already at its URL) and pixel-diff it against baseline/<key>/<viewport>.png. */
export async function compareToBaseline(page: Page, key: string, viewport: number) {
  const size = { width: viewport, height: manifest.viewportHeight };
  const current = page.viewportSize();
  // Capture sizes before goto; a resize after load leaves layout from the old size, so reload.
  if (current?.width !== size.width || current?.height !== size.height) {
    await page.setViewportSize(size);
    await page.reload({ waitUntil: 'load' });
  }
  await freeze(page);
  await expect(page).toHaveScreenshot([key, `${viewport}.png`], {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
}
