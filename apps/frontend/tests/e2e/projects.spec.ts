import { test, expect } from '@playwright/test';
import { hasSource, missingSourceMessage, openSource } from '../baseline/source';

test.describe('/du-an/ and /en/our-project/ project listing, filter and pagination', () => {
  test('Default /du-an/ renders "Tất cả" active, 6 cards, 11 pages (62 items)', async ({ page }) => {
    await page.goto('/du-an/');
    await expect(page).toHaveURL(/\/du-an\/$/);

    // Initial filter state
    const filterAll = page.locator('.filter-nav li.active a');
    await expect(filterAll).toHaveText('Tất cả');

    // 6 cards rendered initially
    const cards = page.locator('#portfolio-results .col');
    await expect(cards).toHaveCount(6);

    // 11 pages in pagination (since 62 items / 6 per page = 11 pages)
    const pagination = page.locator('#portfolio-pagination .pagination');
    await expect(pagination).toBeVisible();

    const current = pagination.locator('.page-numbers.current');
    await expect(current).toHaveText('1');

    // Check last numbered page button is 11
    const pageButtons = pagination.locator('button.page-numbers:not(.next):not(.prev)');
    const lastPageText = await pageButtons.last().textContent();
    expect(lastPageText?.trim()).toBe('11');
  });

  test('Filtering on /du-an/ resets page, updates counts, and preserves URL', async ({ page }) => {
    await page.goto('/du-an/');
    const initialUrl = page.url();

    // 1. Click page 3 first to test reset on filter change
    const pagination = page.locator('#portfolio-pagination .pagination');
    const page3Btn = pagination.locator('button.page-numbers', { hasText: '3' });
    await page3Btn.click();
    await expect(pagination.locator('.page-numbers.current')).toHaveText('3');
    expect(page.url()).toBe(initialUrl);

    // 2. Click Branding filter
    const brandingFilter = page.locator('.filter-nav a[data-term="branding"]');
    await brandingFilter.click();

    // Active state updated
    await expect(page.locator('.filter-nav li.active a')).toHaveAttribute('data-term', 'branding');

    // 2 cards for Branding
    const cards = page.locator('#portfolio-results .col');
    await expect(cards).toHaveCount(2);

    // Total page is 1, so pagination wrapper has no .pagination nav
    await expect(page.locator('#portfolio-pagination .pagination')).toHaveCount(0);
    expect(page.url()).toBe(initialUrl);

    // 3. Click Website filter
    const websiteFilter = page.locator('.filter-nav a[data-term="website"]');
    await websiteFilter.click();

    await expect(page.locator('.filter-nav li.active a')).toHaveAttribute('data-term', 'website');
    await expect(page.locator('#portfolio-results .col')).toHaveCount(6);

    // 59 items / 6 per page = 10 pages
    await expect(page.locator('#portfolio-pagination .pagination')).toBeVisible();
    await expect(page.locator('#portfolio-pagination .current')).toHaveText('1');
    const lastWebsitePage = await page.locator('#portfolio-pagination button.page-numbers:not(.next):not(.prev)').last().textContent();
    expect(lastWebsitePage?.trim()).toBe('10');
    expect(page.url()).toBe(initialUrl);

    // 4. Click Tất cả (All) filter
    const allFilter = page.locator('.filter-nav a[data-term=""]');
    await allFilter.click();
    await expect(page.locator('.filter-nav li.active a')).toHaveAttribute('data-term', '');
    await expect(page.locator('#portfolio-results .col')).toHaveCount(6);
    const lastAllPage = await page.locator('#portfolio-pagination button.page-numbers:not(.next):not(.prev)').last().textContent();
    expect(lastAllPage?.trim()).toBe('11');
    expect(page.url()).toBe(initialUrl);
  });

  test('Page change scrolls to #portfolio-wrapper - 100px and keeps URL unchanged', async ({ page }) => {
    await page.goto('/du-an/');
    const initialUrl = page.url();

    // Scroll to bottom first so page change scroll up is noticeable
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForFunction(() => window.scrollY > 1000);

    const pagination = page.locator('#portfolio-pagination .pagination');
    const page2Btn = pagination.locator('button.page-numbers', { hasText: '2' });
    await page2Btn.click();

    await expect(pagination.locator('.page-numbers.current')).toHaveText('2');
    expect(page.url()).toBe(initialUrl);

    // Wait for scroll animation to settle near #portfolio-wrapper - 100px
    const expectedScroll = await page.evaluate(() => {
      const wrapper = document.getElementById('portfolio-wrapper');
      return wrapper ? wrapper.getBoundingClientRect().top + window.scrollY - 100 : 0;
    });

    await page.waitForFunction((expected) => Math.abs(window.scrollY - expected) < 20, expectedScroll);
    const actualScroll = await page.evaluate(() => window.scrollY);
    expect(Math.abs(actualScroll - expectedScroll)).toBeLessThan(20);

    // Cards 7-12 rendered
    await expect(page.locator('#portfolio-results .col')).toHaveCount(6);

    // Next button click
    const nextBtn = pagination.locator('button.next.page-numbers');
    await nextBtn.click();
    await expect(pagination.locator('.page-numbers.current')).toHaveText('3');
    expect(page.url()).toBe(initialUrl);
  });

  test('EN /en/our-project/ renders shell, hero, All only, empty-state message, no pagination', async ({ page }) => {
    await page.goto('/en/our-project/');
    await expect(page).toHaveURL(/\/en\/our-project\/$/);

    // Hero title
    const heroTitle = page.locator('.service-hero-heading');
    await expect(heroTitle).toContainText('Projects Partnered');
    await expect(heroTitle).toContainText('with Sova');

    // Only "All" filter
    const filterItems = page.locator('.filter-nav li');
    await expect(filterItems).toHaveCount(1);
    await expect(filterItems.first().locator('a')).toHaveText('All');

    // Empty state message
    const emptyMsg = page.locator('#portfolio-results p');
    await expect(emptyMsg).toHaveText('No projects found.');

    // No pagination
    await expect(page.locator('#portfolio-pagination .pagination')).toHaveCount(0);
  });

  test('No duplicate IDs and no console errors on VI and EN pages', async ({ page }) => {
    for (const url of ['/du-an/', '/en/our-project/']) {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', (err) => consoleErrors.push(err.message));

      await page.goto(url);

      const duplicateIds = await page.evaluate(() => {
        const allIds = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
        const seen = new Set<string>();
        const dupes: string[] = [];
        for (const id of allIds) {
          if (seen.has(id)) dupes.push(id);
          else seen.add(id);
        }
        return dupes;
      });

      expect(duplicateIds).toEqual([]);
      expect(consoleErrors).toEqual([]);
    }
  });

  test('Dev fixtures variants: loading, empty, error', async ({ page }) => {
    // 1. Loading fixture
    await page.goto('/dev-fixtures/projects/loading/');
    const loadingMsg = page.locator('#portfolio-results p');
    await expect(loadingMsg).toHaveText('Đang tải...');

    // 2. Empty fixture
    await page.goto('/dev-fixtures/projects/empty/');
    const emptyMsg = page.locator('#portfolio-results p');
    await expect(emptyMsg).toHaveText('Không có dự án nào.');
    await expect(page.locator('#portfolio-pagination .pagination')).toHaveCount(0);

    // 3. Error fixture (VI)
    await page.goto('/dev-fixtures/projects/error/');
    await expect(page.locator('.page-error-main')).toBeVisible();

    // 4. Error fixture (EN)
    await page.goto('/dev-fixtures/projects/error/?locale=en');
    await expect(page.locator('.page-error-main')).toBeVisible();
  });

  test('Pagination wrapper markup and computed CSS matches eras-clone du-an', async ({ page }) => {
    test.skip(!hasSource, missingSourceMessage);

    // Measure source
    await openSource(page, {
      key: 'du-an-pagination',
      url: '/du-an/',
      file: 'du-an/index.html',
      family: 'projects',
      locale: 'vi',
      reason: 'parity',
    });

    const sourceData = await page.evaluate(() => {
      const el = document.querySelector('#portfolio-pagination');
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        tagName: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        textAlign: style.textAlign,
        marginTop: style.marginTop,
      };
    });

    // Measure Sova
    await page.goto('/du-an/');
    const sovaData = await page.evaluate(() => {
      const el = document.querySelector('#portfolio-pagination');
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        tagName: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        textAlign: style.textAlign,
        marginTop: style.marginTop,
      };
    });

    expect(sovaData).not.toBeNull();
    expect(sourceData).not.toBeNull();
    expect(sovaData?.tagName).toBe(sourceData?.tagName);
    expect(sovaData?.id).toBe(sourceData?.id);
    expect(sovaData?.className).toBe(sourceData?.className);
    expect(sovaData?.textAlign).toBe(sourceData?.textAlign);
    expect(sovaData?.marginTop).toBe(sourceData?.marginTop);
  });
});
