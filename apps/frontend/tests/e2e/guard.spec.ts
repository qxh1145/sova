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

test('staging allowlist allows exact staging host only', () => {
  const stagingHost = 'sova-landing-stage.vercel.app';
  expect(isAllowedUrl('https://sova-landing-stage.vercel.app/', stagingHost)).toBe(true);
  expect(isAllowedUrl('https://sova-landing-stage.vercel.app/en/home/', stagingHost)).toBe(true);
  expect(isAllowedUrl('http://sova-landing-stage.vercel.app:8080/path', stagingHost)).toBe(true);

  // local and maps still allowed
  expect(isAllowedUrl('http://localhost:3100/', stagingHost)).toBe(true);
  expect(isAllowedUrl('https://maps.googleapis.com/maps/api/js', stagingHost)).toBe(true);
});

test('staging allowlist blocks lookalike and subdomain attack hosts', () => {
  const stagingHost = 'sova-landing-stage.vercel.app';
  expect(isAllowedUrl('https://sova-landing-stage.vercel.app.evil.com/', stagingHost)).toBe(false);
  expect(isAllowedUrl('https://evil-sova-landing-stage.vercel.app/', stagingHost)).toBe(false);
  expect(
    isAllowedUrl('https://sova-landing-stage.vercel.app.attacker.com/bypass', stagingHost),
  ).toBe(false);
  expect(isAllowedUrl('https://x-sova-landing-stage.vercel.app/', stagingHost)).toBe(false);
});

test('staging allowlist keeps third-party and wordpress hosts blocked', () => {
  const stagingHost = 'sova-landing-stage.vercel.app';
  for (const url of [
    'https://erasvietnam.com/',
    'https://erasvietnam.com/wp-json/wp/v2/pages',
    'https://www.googletagmanager.com/gtm.js',
    'https://connect.facebook.net/en_US/fbevents.js',
    'https://analytics.tiktok.com/i18n/pixel/events.js',
  ]) {
    expect(isAllowedUrl(url, stagingHost), url).toBe(false);
  }
});

test('staging allowlist allows vercel.live toolbar and blocks it locally', () => {
  const stagingHost = 'sova-landing-stage.vercel.app';
  expect(isAllowedUrl('https://vercel.live/', stagingHost)).toBe(true);
  expect(isAllowedUrl('https://vercel.live/script.js', stagingHost)).toBe(true);

  // blocked in local mode (no staging host)
  expect(isAllowedUrl('https://vercel.live/')).toBe(false);
  expect(isAllowedUrl('https://vercel.live/script.js')).toBe(false);

  // lookalikes blocked in staging mode
  expect(isAllowedUrl('https://vercel.live.evil.com/', stagingHost)).toBe(false);
  expect(isAllowedUrl('https://evil-vercel.live/', stagingHost)).toBe(false);
});

