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

  test('Pages 2 to 5 render expected cards and pagination links', async ({ page }) => {
    for (let p = 2; p <= 5; p++) {
      await page.goto(`/goc-nhin/page/${p}/`);
      const snapshot = listingSnapshots.find(
        (s) => s.routeId === 'route-goc-nhin' && s.page === p,
      )!;
      const expectedCount = p === 5 ? 3 : 6;
      const articles = page.locator('#post-list article');
      await expect(articles).toHaveCount(expectedCount);

      const actualIds = await articles.evaluateAll((els) => els.map((el) => el.id));
      expect(actualIds).toEqual(snapshot.orderedIds);

      // Pagination checks
      const pagination = page.locator('.pagination');
      await expect(pagination).toBeVisible();
      const current = pagination.locator('.page-numbers.current');
      await expect(current).toHaveText(String(p));

      // Prev link exists for pages > 1
      const prev = pagination.locator('.prev.page-numbers');
      await expect(prev).toHaveCount(1);
      const expectedPrevHref = p === 2 ? '/goc-nhin/' : `/goc-nhin/page/${p - 1}/`;
      await expect(prev).toHaveAttribute('href', expectedPrevHref);

      if (p === 5) {
        // Page 5 has no next
        await expect(pagination.locator('.next.page-numbers')).toHaveCount(0);
        // Links: 1, dots, 3, 4
        const links = pagination.locator('a.page-numbers:not(.prev)');
        const linkTexts = await links.evaluateAll((els) => els.map((el) => el.textContent?.trim()));
        expect(linkTexts).toEqual(['1', '3', '4']);
        await expect(pagination.locator('.page-numbers.dots')).toHaveCount(1);
      }
    }
  });

  test('All 6 category listings render hero, h2 category title, cards matching snapshot, and sidebar', async ({
    page,
  }) => {
    const categorySlugs = [
      { slug: 'creative-branding', title: 'Creative Branding', count: 1 },
      { slug: 'goc-nhin-website', title: 'Góc nhìn website', count: 6 },
      { slug: 'social-marketing', title: 'Social Marketing', count: 6 },
      { slug: 'thu-thuat', title: 'Thủ thuật', count: 6 },
      { slug: 'tin-tuc', title: 'Tin tức', count: 3 },
      { slug: 'ux-ui', title: 'UX/UI', count: 2 },
    ];

    for (const cat of categorySlugs) {
      await page.goto(`/${cat.slug}/`);
      // Hero H1
      await expect(page.locator('#section_1769897078 h1')).toContainText('Góc nhìn');
      // Category H2
      const h2 = page.locator('h2.category-title');
      await expect(h2).toHaveCount(1);
      await expect(h2).toHaveText(cat.title);

      // Snapshot cards
      const snapshot = listingSnapshots.find((s) => s.routeId === `route-${cat.slug}` && s.page === 1)!;
      const articles = page.locator('#post-list article');
      await expect(articles).toHaveCount(cat.count);
      const actualIds = await articles.evaluateAll((els) => els.map((el) => el.id));
      expect(actualIds).toEqual(snapshot.orderedIds);

      // Sidebar exists
      await expect(page.locator('#secondary.widget-area')).toBeVisible();
    }
  });

  test('Sourced category page 2s render cards matching snapshot and pagination', async ({ page }) => {
    // /thu-thuat/page/2/
    await page.goto('/thu-thuat/page/2/');
    const ttSnapshot = listingSnapshots.find(
      (s) => s.routeId === 'route-thu-thuat' && s.page === 2,
    )!;
    const ttArticles = page.locator('#post-list article');
    await expect(ttArticles).toHaveCount(6);
    expect(await ttArticles.evaluateAll((els) => els.map((el) => el.id))).toEqual(ttSnapshot.orderedIds);
    await expect(page.locator('h2.category-title')).toHaveText('Thủ thuật');

    // /social-marketing/page/2/
    await page.goto('/social-marketing/page/2/');
    const smSnapshot = listingSnapshots.find(
      (s) => s.routeId === 'route-social-marketing' && s.page === 2,
    )!;
    const smArticles = page.locator('#post-list article');
    await expect(smArticles).toHaveCount(1);
    expect(await smArticles.evaluateAll((els) => els.map((el) => el.id))).toEqual(smSnapshot.orderedIds);
    await expect(page.locator('h2.category-title')).toHaveText('Social Marketing');
  });

  test('Unsourced pages and invalid category/page routes return 404', async ({ page }) => {
    const notFoundUrls = [
      '/tin-tuc/page/2/',
      '/goc-nhin/page/1/',
      '/goc-nhin/page/6/',
      '/gioi-thieu/page/2/',
    ];
    for (const url of notFoundUrls) {
      const res = await page.goto(url);
      expect(res?.status(), `Status 404 for ${url}`).toBe(404);
    }
  });

  test('Sidebar renders search form and categories with exact counts and links', async ({ page }) => {
    await page.goto('/goc-nhin/');
    const sidebar = page.locator('#secondary');
    await expect(sidebar).toBeVisible();

    // Search form
    const form = sidebar.locator('form.searchform');
    await expect(form).toBeVisible();
    await expect(form).toHaveAttribute('method', 'get');
    await expect(form).toHaveAttribute('action', '/');
    await expect(form).toHaveAttribute('role', 'search');

    const searchInput = form.locator('input.search-field');
    await expect(searchInput).toHaveAttribute('type', 'search');
    await expect(searchInput).toHaveAttribute('name', 's');
    await expect(searchInput).toHaveAttribute('placeholder', 'Search…');

    // Categories
    const catItems = sidebar.locator('li.cat-item');
    await expect(catItems).toHaveCount(6);

    const expectedCategories = [
      { text: 'Creative Branding (1)', href: '/creative-branding/' },
      { text: 'Góc nhìn website (6)', href: '/goc-nhin-website/' },
      { text: 'Social Marketing (7)', href: '/social-marketing/' },
      { text: 'Thủ thuật (12)', href: '/thu-thuat/' },
      { text: 'Tin tức (3)', href: '/tin-tuc/' },
      { text: 'UX/UI (2)', href: '/ux-ui/' },
    ];

    for (let i = 0; i < expectedCategories.length; i++) {
      const item = catItems.nth(i);
      await expect(item).toContainText(expectedCategories[i].text);
      await expect(item.locator('a')).toHaveAttribute('href', expectedCategories[i].href);
    }
  });

  test('EN insight page renders H1 Insight, 0 articles, and empty sidebar', async ({ page }) => {
    await page.goto('/en/insight/');
    const h1 = page.locator('#section_1769897078 h1');
    await expect(h1).toContainText('Insight');

    const breadcrumbHome = page.locator('#section_1769897078 p a');
    await expect(breadcrumbHome).toHaveText('Home');
    await expect(breadcrumbHome).toHaveAttribute('href', '/en/home/');

    const articles = page.locator('#post-list article');
    await expect(articles).toHaveCount(0);

    const secondary = page.locator('#secondary');
    await expect(secondary).toBeAttached();
    // Empty sidebar: no asides
    await expect(secondary.locator('aside')).toHaveCount(0);
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

