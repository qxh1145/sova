import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { test } from '@playwright/test';
import manifest from './manifest.json';
import {
  BASELINE_DIR,
  domSummary,
  freeze,
  hasSource,
  missingSourceMessage,
  openSource,
  stableScreenshot,
} from './source';

test.skip(!hasSource, missingSourceMessage);

for (const row of manifest.rows) {
  for (const width of manifest.viewports) {
    test(`${row.key} @${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: manifest.viewportHeight });
      const evidence = await openSource(page, row);
      await freeze(page);
      const dir = path.join(BASELINE_DIR, row.key);
      mkdirSync(dir, { recursive: true });
      writeFileSync(path.join(dir, `${width}.png`), await stableScreenshot(page));
      const record = { ...row, viewport: width, dom: await domSummary(page), ...evidence };
      writeFileSync(path.join(dir, `${width}.json`), JSON.stringify(record, null, 2) + '\n');
    });
  }
}
