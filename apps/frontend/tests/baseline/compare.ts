import fs from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
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

/**
 * Freeze `page` (already at its baseline viewport and URL) and return the share of pixels that differ
 * from baseline/<key>/<viewport>.png. Unlike toHaveScreenshot it tolerates a size mismatch: both
 * images are padded to the larger size, so the padding counts as different.
 */
export async function baselineDiffRatio(page: Page, key: string, viewport: number) {
  await freeze(page);
  const actual = await page.screenshot({ fullPage: true, animations: 'disabled', scale: 'css' });
  const expected = fs.readFileSync(test.info().snapshotPath(key, `${viewport}.png`));
  const scratch = await page.context().newPage();
  try {
    return await scratch.evaluate(
      async ([a, b]) => {
        const imgs = await Promise.all(
          [a, b].map((src) => {
            const img = new Image();
            img.src = `data:image/png;base64,${src}`;
            return img.decode().then(() => img);
          }),
        );
        const w = Math.max(...imgs.map((i) => i.width));
        const h = Math.max(...imgs.map((i) => i.height));
        const [pa, pb] = imgs.map((img) => {
          const ctx = Object.assign(document.createElement('canvas'), {
            width: w,
            height: h,
          }).getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          return ctx.getImageData(0, 0, w, h).data;
        });
        // Per-channel tolerance of 20%, close to toHaveScreenshot's default threshold (0.2).
        let diff = 0;
        for (let i = 0; i < pa.length; i += 4) {
          if (
            pa[i + 3] !== pb[i + 3] ||
            Math.abs(pa[i] - pb[i]) > 51 ||
            Math.abs(pa[i + 1] - pb[i + 1]) > 51 ||
            Math.abs(pa[i + 2] - pb[i + 2]) > 51
          )
            diff++;
        }
        return diff / (w * h);
      },
      [actual.toString('base64'), expected.toString('base64')],
    );
  } finally {
    await scratch.close();
  }
}
