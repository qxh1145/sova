import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '../e2e/fixtures';
import { baselineDiffRatio, compareToBaseline } from './compare';
import manifest from './manifest.json';

test.skip(process.env.BASELINE_SOVA !== '1', 'Sova compare runs only via npm run baseline:sova');

const LOG_PATH = path.join(__dirname, 'FAQ_ACCEPTANCE.md');
// | key | width | local | staging | class | max ratio | reason |
const ROW =
  /^\|\s*(faq-(?:vi|en))\s*\|\s*(\d+)\s*\|[^|]*\|[^|]*\|\s*(accepted|source-missing|regression)\s*\|\s*([\d.]+)\s*\|/gm;

/** Logged diffs as `key@width` → accepted max diff pixel ratio. */
function loadLoggedDiffs(): Map<string, number> {
  if (!fs.existsSync(LOG_PATH)) throw new Error(`Missing diff log ${LOG_PATH}`);
  const logged = new Map<string, number>();
  for (const [, key, width, , ratio] of fs.readFileSync(LOG_PATH, 'utf-8').matchAll(ROW)) {
    logged.set(`${key}@${width}`, Number(ratio));
  }
  return logged;
}

const loggedDiffs = loadLoggedDiffs();
const faqRows = manifest.rows.filter((r) => /^faq-(?:vi|en)$/.test(r.key));

for (const row of faqRows) {
  for (const viewport of manifest.viewports) {
    test(`Compare ${row.key} at ${viewport}px against baseline`, async ({ page }) => {
      await page.setViewportSize({ width: viewport, height: manifest.viewportHeight });
      const response = await page.goto(row.url, { waitUntil: 'load' });
      expect(response?.ok()).toBe(true);

      const maxRatio = loggedDiffs.get(`${row.key}@${viewport}`);
      if (maxRatio === undefined) {
        await compareToBaseline(page, row.key, viewport);
        return;
      }
      const ratio = await baselineDiffRatio(page, row.key, viewport);
      expect(ratio, 'stale row: shot now matches baseline').toBeGreaterThan(0.01);
      expect(ratio, `diff ratio above logged max ${maxRatio}`).toBeLessThanOrEqual(maxRatio);
    });
  }
}
