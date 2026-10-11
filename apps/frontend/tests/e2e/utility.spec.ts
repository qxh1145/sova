import type { Page } from '@playwright/test';
import { expect, expectNoDuplicateIds, test } from './fixtures';
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

test.describe('Utility Pages (Story 6.4)', () => {
  test('Thank-you demo: GET /eras-xin-chan-thanh-cam-on-quy-khach/?demo=1 renders h1 from record and demo badge', async ({
    page,
  }) => {
    const requestedUrls: string[] = [];
    page.on('request', (req) => requestedUrls.push(req.url()));

    const response = await page.goto('/eras-xin-chan-thanh-cam-on-quy-khach/?demo=1');
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
    await expect(h1).toHaveText('Gửi thông tin thành công!');

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

  test('Thank-you plain: GET /eras-xin-chan-thanh-cam-on-quy-khach/ renders h1 and no demo badge', async ({
    page,
  }) => {
    const requestedUrls: string[] = [];
    page.on('request', (req) => requestedUrls.push(req.url()));

    const response = await page.goto('/eras-xin-chan-thanh-cam-on-quy-khach/');
    expect(response?.status()).toBe(200);
    await expectSeo(page, 'thank-you-vi');

    const h1 = page.locator('#section_430522107 h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Gửi thông tin thành công!');

    // Demo badge must not exist
    await expect(page.locator('.wpcf7-demo-badge')).toHaveCount(0);

    // Also with ?demo=0
    await page.goto('/eras-xin-chan-thanh-cam-on-quy-khach/?demo=0');
    await expect(page.locator('.wpcf7-demo-badge')).toHaveCount(0);

    expect(requestedUrls.some((u) => u.includes('.pdf'))).toBe(false);
    expect(requestedUrls.some((u) => u.includes('erasvietnam.vn'))).toBe(false);
    await expectNoDuplicateIds(page);
  });

  test('Profile VI: GET /ho-so-nang-luc-eras-vietnam/ renders banner heading with no flipbook or PDF request', async ({
    page,
  }) => {
    const profile = await getProfile('vi');
    expect(profile).not.toBeNull();

    const requestedUrls: string[] = [];
    page.on('request', (req) => requestedUrls.push(req.url()));

    const response = await page.goto('/ho-so-nang-luc-eras-vietnam/');
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
    const banner = page.locator('#banner-1559052784');
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

  test('Profile EN: GET /en/porfolio-eras-vietnam/ renders banner heading with no flipbook or PDF request', async ({
    page,
  }) => {
    const profile = await getProfile('en');
    expect(profile).not.toBeNull();

    const requestedUrls: string[] = [];
    page.on('request', (req) => requestedUrls.push(req.url()));

    const response = await page.goto('/en/porfolio-eras-vietnam/');
    expect(response?.status()).toBe(200);

    // Metadata title
    expect(await page.title()).toBe(profile!.seo.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      profile!.seo.description!,
    );

    // Banner and heading
    const banner = page.locator('#banner-151127649');
    await expect(banner).toBeVisible();

    const heading = banner.locator('h2');
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveText(profile!.title);

    // No flipbook
    await expect(page.locator('.df-container, ._df_book, #df_7213')).toHaveCount(0);

    expect(requestedUrls.some((u) => u.includes('.pdf'))).toBe(false);
    expect(requestedUrls.some((u) => u.includes('erasvietnam.vn'))).toBe(false);

    await expectNoDuplicateIds(page);
  });

  test('Alias: GET /porfolio-eras-vietnam/ redirects to /en/porfolio-eras-vietnam/', async ({
    page,
  }) => {
    const requestedUrls: string[] = [];
    page.on('request', (req) => requestedUrls.push(req.url()));

    const response = await page.goto('/porfolio-eras-vietnam/');
    expect(response?.status()).toBe(200);
    const redirect = await response!.request().redirectedFrom()!.response();
    expect(redirect?.status()).toBe(308);
    expect(page.url()).toMatch(/\/en\/porfolio-eras-vietnam\/$/);

    const heading = page.locator('#banner-151127649 h2');
    await expect(heading).toHaveCount(1);

    expect(requestedUrls.some((u) => u.includes('.pdf'))).toBe(false);
    expect(requestedUrls.some((u) => u.includes('erasvietnam.vn'))).toBe(false);

    await expectNoDuplicateIds(page);
  });

  test('Sample: GET /sample-page/ renders body paragraphs and blockquotes from record', async ({
    page,
  }) => {
    const sample = await getUtilityContent('sample-vi');
    expect(sample).not.toBeNull();

    const requestedUrls: string[] = [];
    page.on('request', (req) => requestedUrls.push(req.url()));

    const response = await page.goto('/sample-page/');
    expect(response?.status()).toBe(200);
    await expectSeo(page, 'sample-vi');

    // Shell header and footer
    await expect(page.locator('header#header')).toBeVisible();
    await expect(page.locator('footer#footer')).toBeVisible();

    // Body paragraphs and blockquote
    const content = page.locator('#content');
    await expect(content).toBeVisible();

    const blockquotes = content.locator('blockquote');
    await expect(blockquotes).toHaveCount(2);
    await expect(blockquotes.first()).toContainText('Hi there!');
    await expect(blockquotes.nth(1)).toContainText('The XYZ Doohickey Company');

    // Link rewriting: dashboard link points to /wp-admin/
    const adminLink = content.locator('a[href="/wp-admin/"]');
    await expect(adminLink).toBeVisible();
    await expect(adminLink).toHaveText('your dashboard');

    expect(requestedUrls.some((u) => u.includes('.pdf'))).toBe(false);
    expect(requestedUrls.some((u) => u.includes('erasvietnam.vn'))).toBe(false);

    await expectNoDuplicateIds(page);
  });
});
