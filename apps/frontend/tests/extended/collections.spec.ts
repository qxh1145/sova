import { expect, test } from '@playwright/test';
import {
  mockPost,
  mockPostPath,
  mockPostSearchToken,
  mockProject,
  mockProjectPath,
} from '../../src/dev/extended';

test.describe('Extended scenario data-driven placement', () => {
  test('Project detail: /featured_item/<mock>/ returns 200, both H1s = mock title, terms, related cards link to its relatedProjectIds', async ({
    page,
  }) => {
    const res = await page.goto(mockProjectPath);
    expect(res?.status()).toBe(200);

    const h1Current = page.locator('h1.current-post-title');
    const h1Entry = page.locator('h1.entry-title');
    await expect(h1Current).toHaveText(mockProject.title);
    await expect(h1Entry).toHaveText(mockProject.title);

    // Terms block present
    const terms = page.locator('.qodef-portfolio-content');
    await expect(terms).toBeVisible();

    // Related cards link to mockProject.relatedProjectIds
    const relatedLinks = page.locator('.portfolio-bottom .portfolio-related .col a');
    const hrefs = await relatedLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    );
    // Check each related project path is present in hrefs
    expect(hrefs.some((h) => h?.includes('giao-dien-dsmart'))).toBe(true);
    expect(hrefs.some((h) => h?.includes('cong-ty-co-phan-phat-trien-cong-nghe-thp'))).toBe(true);
  });

  test('Project listing: /du-an/, filter Mobile App has 2 cards, one is mock', async ({ page }) => {
    await page.goto('/du-an/');
    const mobileAppFilter = page.locator('.filter-nav a[data-term="mobile-app"]');
    await mobileAppFilter.click();

    const cards = page.locator('#portfolio-results .col');
    await expect(cards).toHaveCount(2);

    const titles = await page.locator('#portfolio-results .portfolio-box-title').allInnerTexts();
    expect(titles.some((t) => t.toLowerCase() === mockProject.title.toLowerCase())).toBe(true);
  });

  test('Project archive: /featured_item/ has 63 cards, mock last', async ({ page }) => {
    await page.goto('/featured_item/');
    const cards = page.locator('#portfolio-1541637127 .col');
    await expect(cards).toHaveCount(63);

    const lastCardTitle = await cards.last().locator('.portfolio-box-title').innerText();
    expect(lastCardTitle.toLowerCase()).toBe(mockProject.title.toLowerCase());
  });

  test('Project category: /featured_item_category/mobile-app/ has 2 cards incl. mock', async ({
    page,
  }) => {
    await page.goto('/featured_item_category/mobile-app/');
    const cards = page.locator('#portfolio-1320843097 .col');
    await expect(cards).toHaveCount(2);

    const titles = await cards.locator('.portfolio-box-title').allInnerTexts();
    expect(titles.some((t) => t.toLowerCase() === mockProject.title.toLowerCase())).toBe(true);
  });

  test('Post detail: /<mock-post>/ returns 200, H1 = mock title, body, 3 related links', async ({
    page,
  }) => {
    const res = await page.goto(mockPostPath);
    expect(res?.status()).toBe(200);

    const h1 = page.locator('h1.cs-page_title');
    await expect(h1).toHaveText(mockPost.title);

    const body = page.locator('.blog-single');
    await expect(body).toBeVisible();
    await expect(body).toContainText(mockPostSearchToken);

    // 3 related links
    const relatedItems = page.locator('.relatedcat .related-post-item');
    await expect(relatedItems).toHaveCount(3);
    const relatedLinks = page.locator('.relatedcat .related-post-item a');
    const hrefs = await relatedLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    );
    expect(hrefs).toHaveLength(3);
    for (const href of hrefs) {
      expect(href && href.length > 2).toBe(true);
    }
  });

  test('Blog listing: /goc-nhin/page/5/ has 4 cards, last is mock', async ({ page }) => {
    await page.goto('/goc-nhin/page/5/');
    const articles = page.locator('#post-list article');
    await expect(articles).toHaveCount(4);

    const lastArticleTitle = await articles.last().locator('.title-post-archive').innerText();
    expect(lastArticleTitle).toBe(mockPost.title);
  });

  test('Blog category: /creative-branding/ has 2 cards incl. mock; sidebar count 2', async ({
    page,
  }) => {
    await page.goto('/creative-branding/');
    const articles = page.locator('#post-list article');
    await expect(articles).toHaveCount(2);

    const titles = await articles.locator('.title-post-archive').allInnerTexts();
    expect(titles.some((t) => t.includes(mockPost.title))).toBe(true);

    // Sidebar count
    const sidebarCatItem = page.locator('#secondary li.cat-item', {
      hasText: 'Creative Branding',
    });
    await expect(sidebarCatItem).toContainText('Creative Branding (2)');
  });

  test('Search: /?s=<unique token> has exactly 1 result: mock', async ({ page }) => {
    await page.goto(`/?s=${mockPostSearchToken}`);
    const articles = page.locator('#post-list article');
    await expect(articles).toHaveCount(1);

    const title = await articles.first().locator('.title-post-archive').innerText();
    expect(title).toBe(mockPost.title);
  });
});
