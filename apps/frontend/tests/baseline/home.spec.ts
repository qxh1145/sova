import fs from 'node:fs';
import path from 'node:path';
import { test } from '../e2e/fixtures';
import { compareToBaseline } from './compare';
import manifest from './manifest.json';

test.skip(process.env.BASELINE_SOVA !== '1', 'Sova compare runs only via npm run baseline:sova');

const DOC_PATH = path.resolve(__dirname, '../../../../docs/HOME_ACCEPTANCE.md');

function getLoggedDiffs(): Set<string> {
  const logged = new Set<string>();
  if (!fs.existsSync(DOC_PATH)) return logged;
  const content = fs.readFileSync(DOC_PATH, 'utf-8');
  const regex =
    /^\|\s*(home-(?:vi|en))\s*\|\s*(\d+)\s*\|.*\|\s*(accepted|source-missing|regression)\s*\|/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    const width = match[2];
    logged.add(`${key}@${width}`);
  }
  return logged;
}

const loggedDiffs = getLoggedDiffs();
const homeRows = manifest.rows.filter((r) => r.key === 'home-vi' || r.key === 'home-en');

for (const row of homeRows) {
  for (const viewport of manifest.viewports) {
    test(`Compare ${row.key} at ${viewport}px against baseline`, async ({ page }) => {
      const isLogged = loggedDiffs.has(`${row.key}@${viewport}`);
      test.fail(
        isLogged,
        `Expected baseline diff for ${row.key} at ${viewport}px (logged in docs/HOME_ACCEPTANCE.md)`,
      );

      await page.setViewportSize({ width: viewport, height: manifest.viewportHeight });
      await page.goto(row.url, { waitUntil: 'load' });
      await compareToBaseline(page, row.key, viewport);
    });
  }
}
