import { expect, isAllowedUrl, test } from './fixtures';

test('guard allows local and Maps embed hosts', () => {
  expect(isAllowedUrl('http://localhost:3100/')).toBe(true);
  expect(isAllowedUrl('https://www.google.com/maps/embed?pb=x')).toBe(true);
  expect(isAllowedUrl('https://maps.gstatic.com/x.png')).toBe(true);
});

test('guard blocks other external hosts', () => {
  for (const url of [
    'https://erasvietnam.com/',
    'https://erasvietnam.com/wp-json/wp/v2/pages',
    'https://www.googletagmanager.com/gtm.js',
    'https://connect.facebook.net/en_US/fbevents.js',
    'https://analytics.tiktok.com/i18n/pixel/events.js',
  ]) {
    expect(isAllowedUrl(url), url).toBe(false);
  }
});

// The guard fixture must fail the test at teardown when the page hits a blocked host.
test('guard fails a test that requests a blocked host', async ({ page }) => {
  test.fail();
  await page.goto('/');
  await page.evaluate(() => fetch('https://www.googletagmanager.com/gtm.js').catch(() => {}));
});

test('guard records the blocked URL', async ({ page, networkGuard }) => {
  await page.goto('/');
  await page.evaluate(() => fetch('https://www.googletagmanager.com/gtm.js').catch(() => {}));
  expect(networkGuard).toEqual(['https://www.googletagmanager.com/gtm.js']);
  networkGuard.length = 0; // cleared so teardown passes
});
