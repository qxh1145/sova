import { expect, expectNoDuplicateIds, isAllowedUrl, test } from './fixtures';
import { assets } from '../../src/data/assets';
import { posts } from '../../src/data/posts';
import { listingSnapshots } from '../../src/data/listings';

const postMap = new Map(posts.map((p) => [p.id, p]));
const assetMap = new Map(assets.map((a) => [a.id, a]));

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

    const expectedPosts = expectedIds.map((id) => postMap.get(id)!);
    const imgs = articles.locator('img.wp-post-image');
    await expect(imgs).toHaveCount(6);
    expect(await imgs.evaluateAll((els) => els.map((el) => el.getAttribute('src')))).toEqual(
      expectedPosts.map((p) => assetMap.get(p.thumbnailId!)!.src),
    );
    const readMore = articles.locator('.read-more-new');
    await expect(readMore).toHaveCount(6);
    await expect(readMore).toHaveText(expectedPosts.map(() => 'Đọc tiếp →'));
    expect(await readMore.evaluateAll((els) => els.map((el) => el.getAttribute('href')))).toEqual(
      expectedPosts.map((p) => p.path),
    );
    await expect(articles.locator('.excerpt p')).toHaveText(expectedPosts.map((p) => p.excerpt));

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

  test('All 27 post paths render title, hero image, meta and body', async ({ page }) => {
    expect(posts).toHaveLength(27);
    // Some post bodies hotlink source images (e.g. mona.media, registered in data/assets.ts).
    // Abort them here so this content check does not trip the fixture's external-request guard.
    await page.route(
      (url) => !isAllowedUrl(url.href),
      (route) => (route.request().resourceType() === 'image' ? route.abort() : route.fallback()),
    );
    for (const post of posts) {
      const res = await page.goto(post.path);
      expect(res?.status(), `Status 200 for ${post.path}`).toBe(200);
      await expect(page.locator('h1.cs-page_title')).toHaveText(post.title);
      const heroId = post.featuredImageId ?? post.thumbnailId;
      const heroImg = page.locator('.blog-single .post-image img');
      await expect(heroImg).toHaveAttribute('src', assetMap.get(heroId!)!.src);
      await expect(heroImg).toHaveAttribute('fetchpriority', 'high');
      await expect(page.locator('.blog-single .meta .author')).toHaveText(post.author.name);
      await expect(page.locator('.blog-single .meta .date')).toHaveText(post.displayDate!);
      const bodyText = await page
        .locator('.blog-single .col.large-12 > div:not(.post-image):not(.meta)')
        .innerText();
      expect(bodyText.trim().length, `Body text for ${post.path}`).toBeGreaterThan(0);
    }
  });

  test('Reserved slug /du-an/ via dynamic route does not render as post', async ({ page }) => {
    const res = await page.goto('/du-an/');
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator('.blog-single')).toHaveCount(0);
  });

  test('No slash /goc-nhin redirects to /goc-nhin/', async ({ page }) => {
    const res = await page.goto('/goc-nhin');
    expect(page.url()).toMatch(/\/goc-nhin\/$/);
    expect(res?.status()).toBe(200);
  });
});
