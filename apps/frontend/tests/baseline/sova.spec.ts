import path from 'node:path';
import { expect, test } from '../e2e/fixtures';
import { BASELINE_DIR } from './source';

// Wiring check for page-epic compare specs: they use the guarded `test`, run under
// playwright.baseline.config.ts with BASELINE_SOVA=1, and resolve snapshots to baseline/.
test.skip(process.env.BASELINE_SOVA !== '1', 'Sova compare runs only via npm run baseline:sova');

test('Sova specs resolve snapshots to baseline/ and load Sova from baseURL', async ({
  page,
  baseURL,
}) => {
  expect(test.info().snapshotPath('home-vi', '1440.png')).toBe(
    path.join(BASELINE_DIR, 'home-vi', '1440.png'),
  );
  expect(baseURL).toBe('http://localhost:3100');
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
});
