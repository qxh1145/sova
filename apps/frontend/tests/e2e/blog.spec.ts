import { expect, expectNoDuplicateIds, test } from './fixtures';
import { posts } from '../../src/data/posts';
import { listingSnapshots } from '../../src/data/listings';

test.describe('Blog listing and post detail', () => {
  test('Listing /goc-nhin/ renders 6 cards in order, pagination items, and navigates to detail', async ({
    page,
  }) => {
    await page.goto('/goc-nhin/');

    // H1 heading band
    const h1 = page.locator('#section_1769897078 h1');
    await expect(h1).toContainText('Góc nhìn');

    // 6 cards in order
    const snapshotPage1 = listingSnapshots.find(
      (s) => s.routeId === 'route-goc-nhin' && s.page === 1,
    )!;
    const expectedIds = snapshotPage1.orderedIds;

    const articles = page.locator('#post-list article');
    await expect(articles).toHaveCount(6);

    const actualIds = await articles.evaluateAll((els) => els.map((el) => el.id));
    expect(actualIds).toEqual(expectedIds);

    // Pagination items: 1 2 3 … 5 next, no prev
    const pagination = page.locator('.pagination');
    await expect(pagination).toBeVisible();

    const current = pagination.locator('.page-numbers.current');
    await expect(current).toHaveText('1');

    const prev = pagination.locator('.prev.page-numbers');
    await expect(prev).toHaveCount(0);

    const next = pagination.locator('.next.page-numbers');
    await expect(next).toHaveCount(1);
    await expect(next).toHaveAttribute('href', '/goc-nhin/page/2/');

    const links = pagination.locator('a.page-numbers:not(.next)');
    const linkTexts = await links.evaluateAll((els) => els.map((el) => el.textContent?.trim()));
    expect(linkTexts).toEqual(['2', '3', '5']);

    const dots = pagination.locator('.page-numbers.dots');
    await expect(dots).toHaveCount(1);

    await expectNoDuplicateIds(page);

    // Click first card -> post with .blog-single body visible
    const firstCardLink = articles.first().locator('.title-post-archive');
    await firstCardLink.click();

    await page.waitForURL('**/website-dong-va-tinh-la-gi-phan-biet-su-khac-nhau-giua-2-khai-niem/');
    const singleContent = page.locator('.blog-single');
    await expect(singleContent).toBeVisible();
  });

  test('Unknown slug /khong-ton-tai/ returns 404', async ({ page }) => {
    const res = await page.goto('/khong-ton-tai/');
    expect(res?.status()).toBe(404);
  });

  test('All 27 post paths return status 200 and have body HTML', async ({ page }) => {
    expect(posts).toHaveLength(27);
    for (const post of posts) {
      const res = await page.request.get(post.path);
      expect(res.status(), `Status 200 for ${post.path}`).toBe(200);
      const text = await res.text();
      expect(text, `Contains .blog-single for ${post.path}`).toContain('blog-single');
    }
  });

  test('Reserved slug /du-an/ via dynamic route does not render as post', async ({ page }) => {
    const res = await page.goto('/du-an/');
    expect(res?.status()).toBe(404);
  });

  test('No slash /goc-nhin redirects to /goc-nhin/', async ({ page }) => {
    const res = await page.goto('/goc-nhin');
    expect(page.url()).toMatch(/\/goc-nhin\/$/);
    expect(res?.status()).toBe(200);
  });
});
