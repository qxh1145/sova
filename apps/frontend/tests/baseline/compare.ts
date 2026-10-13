import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import { expect, test } from '../e2e/fixtures';
import manifest from './manifest.json';
import { freeze, rowViewports, type ManifestRow } from './source';

/** Dynamic Sova regions (Carousel renders `.flickity-enabled`; videos; map iframes), masked in Sova shots. */
export const SOVA_MASK = ['.flickity-enabled', 'video', 'iframe'];
/** Allowed run-to-run move of a logged cell's diff ratio around its measured value. */
export const SLACK = 0.005;
const SOVA_SNAPSHOT_DIR = path.resolve(__dirname, '../../baseline-sova');

type Cell = { cls: 'accepted' | 'regression' | 'source-missing'; measured: number };

/**
 * Sova-only settle step after freeze(); kept out of freeze() so source shots stay unchanged.
 * - freeze() disables ScrollTriggers without reverting, so a pin-spacer stays or goes depending on
 *   whether a late ScrollTrigger.refresh() fires; refresh so every run ends unpinned.
 * - The full-page shot can paint a decoded `decoding="async"` image blank; sync decoding paints it.
 */
async function settleSova(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { ScrollTrigger?: { refresh(): void } }).ScrollTrigger?.refresh();
    document.querySelectorAll('img').forEach((img) => (img.decoding = 'sync'));
  });
}

/** Freeze and settle a Sova page, then take a full-page shot with SOVA_MASK applied. */
async function sovaShot(page: Page) {
  await freeze(page);
  await settleSova(page);
  return page.screenshot({
    fullPage: true,
    animations: 'disabled',
    scale: 'css',
    mask: SOVA_MASK.map((s) => page.locator(s)),
  });
}

/**
 * Set the baseline viewport, freeze `page` (already at its URL) and pixel-diff it against
 * baseline/<key>/<viewport>.png. `sova` adds the Sova settle step (no mask: the source shot is unmasked).
 */
export async function compareToBaseline(page: Page, key: string, viewport: number, sova = false) {
  const size = { width: viewport, height: manifest.viewportHeight };
  const current = page.viewportSize();
  // Capture sizes before goto; a resize after load leaves layout from the old size, so reload.
  if (current?.width !== size.width || current?.height !== size.height) {
    await page.setViewportSize(size);
    await page.reload({ waitUntil: 'load' });
  }
  await freeze(page);
  if (sova) await settleSova(page);
  await expect(page).toHaveScreenshot([key, `${viewport}.png`], {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
}

/**
 * Share of differing pixels between two PNGs. Unlike toHaveScreenshot it tolerates a size
 * mismatch: both images are padded to the larger size, so the padding counts as different.
 */
async function diffRatio(page: Page, actual: Buffer, expected: Buffer): Promise<number> {
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

/** Freeze a Sova `page` (at its baseline viewport and URL) and return its diff ratio vs baseline/<key>/<viewport>.png. */
export async function baselineDiffRatio(page: Page, key: string, viewport: number) {
  const actual = await sovaShot(page);
  return diffRatio(page, actual, fs.readFileSync(test.info().snapshotPath(key, `${viewport}.png`)));
}

/**
 * Strict (0.01) compare of a Sova `page` against its own snapshot baseline-sova/<key>/<viewport>.png,
 * for cells whose source is broken. BASELINE_SOVA_UPDATE=1 writes the snapshot instead.
 */
export async function selfSnapshot(page: Page, key: string, viewport: number) {
  const file = path.join(SOVA_SNAPSHOT_DIR, key, `${viewport}.png`);
  const actual = await sovaShot(page);
  if (process.env.BASELINE_SOVA_UPDATE === '1') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, actual);
    return;
  }
  if (!fs.existsSync(file)) {
    throw new Error(`Missing Sova self-snapshot ${file}: run with BASELINE_SOVA_UPDATE=1`);
  }
  const ratio = await diffRatio(page, actual, fs.readFileSync(file));
  expect(ratio, `${key}@${viewport} differs from its Sova self-snapshot`).toBeLessThanOrEqual(0.01);
}

/** Parse an acceptance log: `| key | width | local | staging | class | measured ratio | reason |`. */
function loadCells(logPath: string) {
  if (!fs.existsSync(logPath)) throw new Error(`Missing acceptance log ${logPath}`);
  const row =
    /^\|\s*([a-z0-9-]+)\s*\|\s*(\d+)\s*\|[^|]*\|[^|]*\|\s*(accepted|source-missing|regression)\s*\|\s*([\d.]+)\s*\|/gm;
  const cells = new Map<string, Cell>();
  for (const [, key, width, cls, measured] of fs.readFileSync(logPath, 'utf-8').matchAll(row)) {
    cells.set(`${key}@${width}`, { cls: cls as Cell['cls'], measured: Number(measured) });
  }
  return cells;
}

/**
 * Parity gate for one page family. Per manifest row × viewport: unlogged cell → strict 0.01 vs source;
 * accepted/regression → diff ratio within measured ± SLACK; source-missing → strict Sova self-snapshot.
 * BASELINE_INJECT_CSS adds a style tag before freeze (regression drill).
 */
export function gateSpec({
  log,
  keys,
}: {
  log: string;
  keys: RegExp | ((row: ManifestRow) => boolean);
}) {
  test.skip(process.env.BASELINE_SOVA !== '1', 'Sova compare runs only via npm run baseline:sova');

  const cells = loadCells(path.join(__dirname, log));
  const rows = (manifest.rows as ManifestRow[]).filter((r) =>
    keys instanceof RegExp ? keys.test(r.key) : keys(r),
  );

  for (const row of rows) {
    for (const viewport of rowViewports(row)) {
      test(`Compare ${row.key} at ${viewport}px against baseline`, async ({ page }) => {
        await page.setViewportSize({ width: viewport, height: manifest.viewportHeight });
        const response = await page.goto(row.url, { waitUntil: 'load' });
        expect(response?.ok()).toBe(true);
        if (process.env.BASELINE_INJECT_CSS) {
          await page.addStyleTag({ content: process.env.BASELINE_INJECT_CSS });
        }

        const cell = cells.get(`${row.key}@${viewport}`);
        if (!cell) return compareToBaseline(page, row.key, viewport, true);
        if (cell.cls === 'source-missing') return selfSnapshot(page, row.key, viewport);

        const ratio = await baselineDiffRatio(page, row.key, viewport);
        expect(
          Math.abs(ratio - cell.measured),
          `${row.key}@${viewport}: diff ratio ${ratio.toFixed(4)} left band measured ${cell.measured} ± SLACK ${SLACK}`,
        ).toBeLessThanOrEqual(SLACK);
      });
    }
  }
}
