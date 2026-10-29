import type { Page } from '@playwright/test';
import { ALLOW_404, expect, expectNoDuplicateIds, test } from './fixtures';
import { RENAMED_PATHS } from '../../src/lib/content/brand';
import { getProfile, getUtilityContent } from '../../src/lib/queries/pages';

async function expectSeo(page: Page, id: string) {
  const record = await getUtilityContent(id);
  expect(record?.seo).toBeDefined();
  expect(await page.title()).toBe(record!.seo!.title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    record!.seo!.description!,
  );
}

const thankYouHeading = async () =>
  (await getUtilityContent('thank-you-vi'))!.body.html.match(/<h1>(.*?)<\/h1>/)![1];

test.describe('Utility Pages (Story 6.4)', () => {
  test('Thank-you demo: GET /xin-chan-thanh-cam-on-quy-khach/?demo=1 renders h1 from record and demo badge', async ({
    page,
  }) => {
    const requestedUrls: string[] = [];
    page.on('request', (req) => requestedUrls.push(req.url()));

    const response = await page.goto('/xin-chan-thanh-cam-on-quy-khach/?demo=1');
    expect(response?.status()).toBe(200);

    // Shell header and footer
    await expect(page.locator('header#header')).toBeVisible();
    await expect(page.locator('footer#footer')).toBeVisible();

    // Thank-you frame
    await expect(page.locator('#section_430522107')).toBeVisible();
    await expect(page.locator('#col-1741565368.form_tke')).toBeVisible();

    // Exactly one h1 from record
    const h1 = page.locator('#section_430522107 h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(await thankYouHeading());

    // Demo badge visible beside/above heading
    const demoBadge = page.locator('.wpcf7-demo-badge');
    await expect(demoBadge).toBeVisible();
    await expect(demoBadge).toHaveText('Bản demo — chưa gửi thông tin');

    // Success animation svg
    await expect(page.locator('.success-animate svg')).toBeVisible();

    // No PDF or erasvietnam.vn requests
    expect(requestedUrls.some((u) => u.includes('.pdf'))).toBe(false);
    expect(requestedUrls.some((u) => u.includes('erasvietnam.vn'))).toBe(false);

    // No duplicate IDs
    await expectNoDuplicateIds(page);
  });

  test('Thank-you plain: GET /xin-chan-thanh-cam-on-quy-khach/ renders h1 and no demo badge', async ({
    page,
  }) => {
    const requestedUrls: string[] = [];
    page.on('request', (req) => requestedUrls.push(req.url()));

    const response = await page.goto('/xin-chan-thanh-cam-on-quy-khach/');
    expect(response?.status()).toBe(200);
    await expectSeo(page, 'thank-you-vi');

    const h1 = page.locator('#section_430522107 h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(await thankYouHeading());

    // Demo badge must not exist
    await expect(page.locator('.wpcf7-demo-badge')).toHaveCount(0);

    // Also with ?demo=0
    await page.goto('/xin-chan-thanh-cam-on-quy-khach/?demo=0');
    await expect(page.locator('.wpcf7-demo-badge')).toHaveCount(0);

    expect(requestedUrls.some((u) => u.includes('.pdf'))).toBe(false);
    expect(requestedUrls.some((u) => u.includes('erasvietnam.vn'))).toBe(false);
    await expectNoDuplicateIds(page);
  });

  const profileCases = [
    {
      locale: 'vi' as const,
      name: 'VI',
      path: '/ho-so-nang-luc-sova/',
      bannerId: '#banner-1559052784',
    },
    {
      locale: 'en' as const,
      name: 'EN',
      path: '/en/sova-portfolio/',
      bannerId: '#banner-151127649',
    },
  ];

  for (const c of profileCases) {
    test(`Profile ${c.name}: GET ${c.path} renders banner heading with no flipbook or PDF request`, async ({
      page,
    }) => {
      const profile = await getProfile(c.locale);
      expect(profile).not.toBeNull();

      const requestedUrls: string[] = [];
      page.on('request', (req) => requestedUrls.push(req.url()));

      const response = await page.goto(c.path);
      expect(response?.status()).toBe(200);

      // Metadata title
      expect(await page.title()).toBe(profile!.seo.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        profile!.seo.description!,
      );

      // Shell header and footer
      await expect(page.locator('header#header')).toBeVisible();
      await expect(page.locator('footer#footer')).toBeVisible();

      // Banner and heading
      const banner = page.locator(c.bannerId);
      await expect(banner).toBeVisible();

      const heading = banner.locator('h2');
      await expect(heading).toHaveCount(1);
      await expect(heading).toHaveText(profile!.title);

      // No flipbook containers or dflip markup
      await expect(page.locator('.df-container, ._df_book, #df_7213')).toHaveCount(0);

      // No PDF requests or remote brand host
      expect(requestedUrls.some((u) => u.includes('.pdf'))).toBe(false);
      expect(requestedUrls.some((u) => u.includes('erasvietnam.vn'))).toBe(false);

      await expectNoDuplicateIds(page);
    });
  }

  test('Renamed: each old Eras-slug URL answers 301 with the Sova path as Location', async ({
    request,
  }) => {
    for (const [from, to] of Object.entries(RENAMED_PATHS)) {
      const response = await request.get(`${from}?demo=1`, { maxRedirects: 0 });
      expect(response.status(), from).toBe(301);
      expect(response.headers().location, from).toBe(`${to}?demo=1`);
    }
  });
});

// WordPress "Sample Page" leftover, hidden (stakeholder review 2026-10-27): route and record are commented out.
test.describe('Hidden sample page', () => {
  test.use({ allowConsole: [ALLOW_404] });

  test('/sample-page/ returns 404', async ({ page }) => {
    const response = await page.goto('/sample-page/');
    expect(response?.status()).toBe(404);
  });
});
