import { expect, test } from '../e2e/fixtures';
import { defaultContentData } from '../../src/lib/repositories/mock';
import {
  extendedMockPosts,
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

    // Related cards link to mockProject.relatedProjectIds, in order
    const relatedLinks = page.locator('.portfolio-bottom .portfolio-related .col a');
    const hrefs = await relatedLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    );
    expect(hrefs).toEqual(
      mockProject.relatedProjectIds.map(
        (id) => defaultContentData.projects.find((p) => p.id === id)?.path,
      ),
    );
  });

  test('Project listing: /du-an/, filter Mobile App has 2 cards, one is mock', async ({ page }) => {
    await page.goto('/du-an/');
    const mobileAppFilter = page.locator('.filter-nav a[data-term="mobile-app"]');
    await mobileAppFilter.click();
    await expect(page.locator('.filter-nav li.active a')).toHaveAttribute(
      'data-term',
      'mobile-app',
    );

    const cards = page.locator('#portfolio-results .col');
    await expect(cards).toHaveCount(2);

    const titles = await page.locator('#portfolio-results .portfolio-box-title').allInnerTexts();
    expect(titles.some((t) => t.toLowerCase() === mockProject.title.toLowerCase())).toBe(true);
  });

  test('Project archive: /featured_item/ has 63 cards, mock last', async ({ page }) => {
    await page.goto('/featured_item/');
    const cards = page.locator('#portfolio-1541637127 .col');
    await expect(cards).toHaveCount(defaultContentData.projects.length + 1);

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
    expect(hrefs).toEqual(
      mockPost.relatedPostIds.map((id) => defaultContentData.posts.find((p) => p.id === id)?.path),
    );
  });

  test('Blog listing: /goc-nhin/page/5/ fills with mock posts, and /goc-nhin/page/6/ renders the overflow', async ({
    page,
  }) => {
    // Listing keeps data order (6 per page): default VI posts, then the extended mock posts.
    const viPosts = [
      ...defaultContentData.posts.filter((p) => p.locale === 'vi'),
      ...extendedMockPosts,
    ];
    const page5 = viPosts.slice(24, 30);
    const page6 = viPosts.slice(30);
    expect(page5).toHaveLength(6);
    expect(page6.length).toBeGreaterThan(0);

    const titlesOf = (articles: import('@playwright/test').Locator) =>
      articles.locator('.title-post-archive').allInnerTexts();
    const isMock = (p: (typeof viPosts)[number]) => extendedMockPosts.includes(p);

    // Page 5: full, mock posts in their data slots
    await page.goto('/goc-nhin/page/5/');
    const page5Articles = page.locator('#post-list article');
    await expect(page5Articles).toHaveCount(page5.length);
    const page5Titles = await titlesOf(page5Articles);
    page5.forEach((p, i) => {
      if (isMock(p)) expect(page5Titles[i], `page 5 slot ${i}`).toBe(p.title);
    });
    expect(page5Titles).toContain(mockPost.title);

    // Page 5 links to page 6
    const nextLink = page.locator('.pagination a[href*="/goc-nhin/page/6/"]');
    await expect(nextLink.first()).toBeVisible();

    // Page 6: exactly the overflow posts, in order
    await page.goto('/goc-nhin/page/6/');
    const page6Articles = page.locator('#post-list article');
    await expect(page6Articles).toHaveCount(page6.length);
    expect(await titlesOf(page6Articles)).toEqual(page6.map((p) => p.title));
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
