import { expect, expectNoDuplicateIds, STAGING, test } from './fixtures';
import { assets } from '../../src/data/assets';
import { posts } from '../../src/data/posts';
import { listingSnapshots } from '../../src/data/listings';

import { routes } from '../../src/data/routes';

const postMap = new Map(posts.map((p) => [p.id, p]));
const assetMap = new Map(assets.map((a) => [a.id, a]));
const postDetailRoutePaths = new Set(
  routes.filter((r) => r.kind === 'post-detail').map((r) => r.path),
);
// Unique <video> elements per post detail in docs/evidence/pages.json (kind 'post-detail').
const evidenceVideoCounts: Record<string, number> = {
  '/hieu-tu-a-z-ve-thiet-ke-website-responsive/': 4,
  '/huong-dan-xoa-cache-trinh-duyet-va-may-tinh/': 1,
};

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

    await expect(page.locator('h2.category-title')).toHaveCount(0);

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

  test('All 27 post paths render title, hero image, meta, rich media, and related posts', async ({ page }) => {
    expect(posts).toHaveLength(27);
    const totals = { table: 0, figure: 0, blockquote: 0, video: 0 };

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
      const bodyLocator = page.locator('.blog-single .col.large-12 > div:not(.post-image):not(.meta):not(.relatedcat)');
      const bodyText = await bodyLocator.innerText();
      expect(bodyText.trim().length, `Body text for ${post.path}`).toBeGreaterThan(0);

      // Verify DOM counts of rich content match post.body.html tag counts
      const html = post.body.html;
      const expectedTables = (html.match(/<table\b[^>]*>/gi) || []).length;
      const expectedFigures = (html.match(/<figure\b[^>]*>/gi) || []).length;
      const expectedBlockquotes = (html.match(/<blockquote\b[^>]*>/gi) || []).length;
      const expectedVideos = (html.match(/<video\b[^>]*>/gi) || []).length;

      await expect(bodyLocator.locator('table')).toHaveCount(expectedTables);
      await expect(bodyLocator.locator('figure')).toHaveCount(expectedFigures);
      await expect(bodyLocator.locator('blockquote')).toHaveCount(expectedBlockquotes);
      await expect(bodyLocator.locator('video')).toHaveCount(expectedVideos);
      expect(expectedVideos, `Evidence video count for ${post.path}`).toBe(
        evidenceVideoCounts[post.path] ?? 0,
      );
      totals.table += expectedTables;
      totals.figure += expectedFigures;
      totals.blockquote += expectedBlockquotes;
      totals.video += expectedVideos;

      // Missing body media keep their element, lose src and carry the missing marker
      const missingSrcs = new Set(
        post.body.assetIds
          .map((id) => assetMap.get(id))
          .filter((a) => a?.status === 'missing' && a.src)
          .map((a) => a!.src),
      );
      const mediaTags = html.match(/<(img|source)\b[^>]*>/gi) || [];
      const expectedMissingTags = mediaTags.filter((tag) =>
        missingSrcs.has(tag.match(/\ssrc\s*=\s*(["'])(.*?)\1/i)?.[2] ?? ''),
      ).length;
      const expectedMissingVideos = (html.match(/<video\b[\s\S]*?<\/video>/gi) || []).filter(
        (video) => {
          const sources = video.match(/<source\b[^>]*>/gi) || [];
          return (
            sources.length > 0 &&
            sources.every((tag) =>
              missingSrcs.has(tag.match(/\ssrc\s*=\s*(["'])(.*?)\1/i)?.[2] ?? ''),
            )
          );
        },
      ).length;
      await expect(bodyLocator.locator('[data-media-status="missing"]')).toHaveCount(
        expectedMissingTags + expectedMissingVideos,
      );
      const renderedSrcs = await bodyLocator
        .locator('img[src], source[src]')
        .evaluateAll((els) => els.map((el) => el.getAttribute('src')));
      expect(
        renderedSrcs.filter((src) => src && missingSrcs.has(src)),
        `No missing body src rendered for ${post.path}`,
      ).toEqual([]);

      // Related posts section verification
      const relatedSection = page.locator('.blog-single .relatedcat');
      await expect(relatedSection).toBeVisible();

      const expectedRelatedCount = post.relatedPostIds.length;
      const relatedCards = relatedSection.locator('.related-post-item');
      await expect(relatedCards).toHaveCount(expectedRelatedCount);

      if (expectedRelatedCount === 0) {
        await expect(relatedSection.locator('.title-lienquan')).toHaveCount(0);
      } else {
        await expect(relatedSection.locator('.title-lienquan')).toHaveText('Bài viết liên quan:');

        for (let i = 0; i < expectedRelatedCount; i++) {
          const card = relatedCards.nth(i);
          const relPostId = post.relatedPostIds[i];
          const relPost = postMap.get(relPostId)!;

          await expect(card).toHaveClass(new RegExp(`item-${i + 1}`));
          await expect(card.locator('h5')).toHaveText(relPost.title);

          const link = card.locator('a');
          await expect(link).toHaveAttribute('href', relPost.path);
          await expect(link).toHaveAttribute('title', relPost.title);
          expect(postDetailRoutePaths.has(relPost.path), `${relPost.path} is a post-detail route`).toBe(true);

          const relThumbId = relPost.thumbnailId ?? relPost.featuredImageId;
          const relThumbAsset = relThumbId ? assetMap.get(relThumbId) : null;
          if (relThumbAsset && relThumbAsset.status !== 'missing' && relThumbAsset.src) {
            await expect(card.locator('img')).toHaveAttribute('src', relThumbAsset.src);
          } else {
            await expect(card.locator('img')).toHaveCount(0);
          }
        }
      }
    }

    // Aggregate rich-content counts across the 27 posts
    expect(totals).toEqual({ table: 1, figure: 9, blockquote: 8, video: 5 });
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
      await expect(page.locator('h2.category-title')).toHaveCount(0);

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
      { slug: 'creative-branding', title: 'Creative Branding', page1Count: 1 },
      { slug: 'goc-nhin-website', title: 'Góc nhìn website', page1Count: 6 },
      { slug: 'social-marketing', title: 'Social Marketing', page1Count: 6 },
      { slug: 'thu-thuat', title: 'Thủ thuật', page1Count: 6 },
      { slug: 'tin-tuc', title: 'Tin tức', page1Count: 3 },
      { slug: 'ux-ui', title: 'UX/UI', page1Count: 2 },
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
      const snapshot = listingSnapshots.find(
        (s) => s.routeId === `route-${cat.slug}` && s.page === 1,
      )!;
      const articles = page.locator('#post-list article');
      await expect(articles).toHaveCount(cat.page1Count);
      const actualIds = await articles.evaluateAll((els) => els.map((el) => el.id));
      expect(actualIds).toEqual(snapshot.orderedIds);

      // Pagination: only categories with a sourced page 2
      const pagination = page.locator('.pagination');
      if (cat.slug === 'social-marketing' || cat.slug === 'thu-thuat') {
        await expect(pagination.locator('.page-numbers.current')).toHaveText('1');
        await expect(pagination.locator('.prev.page-numbers')).toHaveCount(0);
        await expect(pagination.locator('.next.page-numbers')).toHaveAttribute(
          'href',
          `/${cat.slug}/page/2/`,
        );
      } else {
        await expect(pagination).toHaveCount(0);
      }

      // Sidebar exists
      await expect(page.locator('#secondary.widget-area')).toBeVisible();
    }
  });

  test('Sourced category page 2s render cards matching snapshot and pagination', async ({
    page,
  }) => {
    // /thu-thuat/page/2/
    await page.goto('/thu-thuat/page/2/');
    const ttSnapshot = listingSnapshots.find(
      (s) => s.routeId === 'route-thu-thuat' && s.page === 2,
    )!;
    const ttArticles = page.locator('#post-list article');
    await expect(ttArticles).toHaveCount(6);
    expect(await ttArticles.evaluateAll((els) => els.map((el) => el.id))).toEqual(
      ttSnapshot.orderedIds,
    );
    await expect(page.locator('h2.category-title')).toHaveText('Thủ thuật');
    await expect(page.locator('.pagination .page-numbers.current')).toHaveText('2');
    await expect(page.locator('.pagination .prev.page-numbers')).toHaveAttribute(
      'href',
      '/thu-thuat/',
    );
    await expect(page.locator('.pagination .next.page-numbers')).toHaveCount(0);

    // /social-marketing/page/2/
    await page.goto('/social-marketing/page/2/');
    const smSnapshot = listingSnapshots.find(
      (s) => s.routeId === 'route-social-marketing' && s.page === 2,
    )!;
    const smArticles = page.locator('#post-list article');
    await expect(smArticles).toHaveCount(1);
    expect(await smArticles.evaluateAll((els) => els.map((el) => el.id))).toEqual(
      smSnapshot.orderedIds,
    );
    await expect(page.locator('h2.category-title')).toHaveText('Social Marketing');
    await expect(page.locator('.pagination .page-numbers.current')).toHaveText('2');
    await expect(page.locator('.pagination .prev.page-numbers')).toHaveAttribute(
      'href',
      '/social-marketing/',
    );
    await expect(page.locator('.pagination .next.page-numbers')).toHaveCount(0);
  });

  test('Unsourced pages and invalid category/page routes return 404', async ({ page }) => {
    const notFoundUrls = [
      '/tin-tuc/page/2/',
      '/goc-nhin/page/1/',
      '/goc-nhin/page/6/',
      '/gioi-thieu/page/2/',
      '/thu-thuat/page/1/',
      '/thu-thuat/page/3/',
      '/thu-thuat/page/abc/',
      '/thu-thuat/page/02/',
      '/goc-nhin/page/03/',
    ];
    for (const url of notFoundUrls) {
      const res = await page.goto(url);
      expect(res?.status(), `Status 404 for ${url}`).toBe(404);
    }
  });

  test('Sidebar renders search form and categories with exact counts and links', async ({
    page,
  }) => {
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
    await expect(page.locator('h2.category-title')).toHaveCount(0);

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

  test('Dev-fixture happy-path renders hero, body media, and related post card', async ({
    page,
  }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    await page.goto('/dev-fixtures/blog/happy-path');
    await expect(page.locator('h1.cs-page_title')).toHaveText('Fixture');

    // Hero image present
    const heroImg = page.locator('.blog-single .post-image img');
    await expect(heroImg).toHaveAttribute('src', '/fixture.png');

    // Body media present
    const bodyLocator = page.locator(
      '.blog-single .col.large-12 > div:not(.post-image):not(.meta):not(.relatedcat)',
    );
    await expect(bodyLocator.locator('img[src="/fixture.png"]')).toBeVisible();
    await expect(bodyLocator.locator('video source[src="/fixture-video.mp4"]')).toBeAttached();

    // Related card present with thumbnail
    const relatedSection = page.locator('.blog-single .relatedcat');
    await expect(relatedSection.locator('.related-post-item')).toHaveCount(1);
    const relatedCard = relatedSection.locator('.related-post-item.item-1');
    await expect(relatedCard.locator('h5')).toHaveText('Fixture 2');
    await expect(relatedCard.locator('img')).toHaveAttribute('src', '/fixture.png');
  });

  test('Dev-fixture missing-media omits hero, related card img, and marks body media missing with no missing requests', async ({
    page,
  }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    const requestedUrls: string[] = [];
    page.on('request', (req) => requestedUrls.push(req.url()));

    await page.goto('/dev-fixtures/blog/missing-media');
    await expect(page.locator('h1.cs-page_title')).toHaveText('Fixture');

    // Hero omitted
    await expect(page.locator('.blog-single .post-image img')).toHaveCount(0);

    // Body media elements kept, src dropped, marked missing
    const bodyLocator = page.locator(
      '.blog-single .col.large-12 > div:not(.post-image):not(.meta):not(.relatedcat)',
    );
    const missingImgs = bodyLocator.locator('img[data-media-status="missing"]');
    await expect(missingImgs).toHaveCount(1);
    await expect(missingImgs).not.toHaveAttribute('src');

    const missingSources = bodyLocator.locator('source[data-media-status="missing"]');
    await expect(missingSources).toHaveCount(1);
    await expect(missingSources).not.toHaveAttribute('src');
    await expect(bodyLocator.locator('video[data-media-status="missing"]')).toHaveCount(1);

    // Related card has title and link, but no img
    const relatedSection = page.locator('.blog-single .relatedcat');
    await expect(relatedSection.locator('.related-post-item')).toHaveCount(1);
    const relatedCard = relatedSection.locator('.related-post-item.item-1');
    await expect(relatedCard.locator('h5')).toHaveText('Fixture 2');
    await expect(relatedCard.locator('a')).toHaveAttribute('href', /^\/fixture-post-2\/?$/);
    await expect(relatedCard.locator('img')).toHaveCount(0);

    // No request to missing sources
    expect(requestedUrls.some((u) => u.includes('fixture.png'))).toBe(false);
    expect(requestedUrls.some((u) => u.includes('fixture-video.mp4'))).toBe(false);
  });

  test('Dev-fixture error renders the page error state in VI and EN', async ({ page }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    await page.goto('/dev-fixtures/blog/error');
    await expect(page.locator('.page-error-main')).toBeVisible();

    await page.goto('/dev-fixtures/blog/error?locale=en');
    await expect(page.locator('.page-error-main')).toBeVisible();
  });

  test('Search results matrix: title-only, excerpt-only, body-only, pagination, no-results, blank, 404s, sidebar, and form submit', async ({
    page,
  }) => {
    // 1. Title-only word: "cache" -> matches only /huong-dan-xoa-cache-trinh-duyet-va-may-tinh/
    await page.goto('/?s=cache');
    await expect(page.locator('#section_1769897078 h1')).toContainText('Kết quả tìm kiếm: cache');
    const cacheCards = page.locator('#post-list article');
    await expect(cacheCards).toHaveCount(1);
    await expect(cacheCards.first().locator('.title-post-archive')).toHaveText(
      postMap.get('post-2434')!.title,
    );
    await expect(page.locator('#secondary input.search-field')).toHaveValue('cache');

    // 2. Excerpt-only word: "copywriter" -> matches in excerpt of post-836 (/huong-dan-viet-bai-chuan-seo-2021/), not in title
    await page.goto('/?s=copywriter');
    await expect(page.locator('#section_1769897078 h1')).toContainText('Kết quả tìm kiếm: copywriter');
    const copywriterCards = page.locator('#post-list article');
    await expect(copywriterCards).toHaveCount(1);
    await expect(copywriterCards.first().locator('.title-post-archive')).toHaveText(
      postMap.get('post-836')!.title,
    );
    expect(postMap.get('post-836')!.title.toLowerCase()).not.toContain('copywriter');
    expect(postMap.get('post-836')!.excerpt.toLowerCase()).toContain('copywriter');

    // 3. Body-only word: "haravan" -> matches only in body of post-853 (/kinh-doanh-nho-le-co-nen-xay-dung-website-ban-hang/), not in title or excerpt
    await page.goto('/?s=haravan');
    await expect(page.locator('#section_1769897078 h1')).toContainText('Kết quả tìm kiếm: haravan');
    const haravanCards = page.locator('#post-list article');
    await expect(haravanCards).toHaveCount(1);
    await expect(haravanCards.first().locator('.title-post-archive')).toHaveText(
      postMap.get('post-853')!.title,
    );
    expect(postMap.get('post-853')!.title.toLowerCase()).not.toContain('haravan');
    expect(postMap.get('post-853')!.excerpt.toLowerCase()).not.toContain('haravan');

    // 4. Many results: "wordpress" -> 7 matches -> 6 cards on page 1, pagination to page 2
    await page.goto('/?s=wordpress');
    await expect(page.locator('#post-list article')).toHaveCount(6);
    const wpPagination = page.locator('.pagination');
    await expect(wpPagination).toBeVisible();
    const wpNext = wpPagination.locator('.next.page-numbers');
    await expect(wpNext).toHaveAttribute('href', '/page/2/?s=wordpress');

    // Go to page 2: /page/2/?s=wordpress
    await page.goto('/page/2/?s=wordpress');
    await expect(page.locator('#post-list article')).toHaveCount(1);
    const wpPrev = page.locator('.pagination .prev.page-numbers');
    await expect(wpPrev).toHaveAttribute('href', '/?s=wordpress');
    await expect(page.locator('#secondary input.search-field')).toHaveValue('wordpress');

    // 5. No results: /?s=zzqqxx
    await page.goto('/?s=zzqqxx');
    await expect(page.locator('#post-list article')).toHaveCount(0);
    await expect(page.locator('.pagination')).toHaveCount(0);
    await expect(page.locator('#post-list')).toContainText('Không tìm thấy bài viết phù hợp.');
    await expect(page.locator('#secondary input.search-field')).toHaveValue('zzqqxx');

    // 6. Blank query: /?s=
    await page.goto('/?s=');
    await expect(page.locator('#section_1769897078 h1')).toContainText('Kết quả tìm kiếm:');
    await expect(page.locator('#post-list article')).toHaveCount(6);
    const blankNext = page.locator('.pagination .next.page-numbers');
    await expect(blankNext).toHaveAttribute('href', '/page/2/?s=');

    // 7. 404 rows: page past end or invalid page
    const resPastEnd = await page.goto('/page/9/?s=wordpress');
    expect(resPastEnd?.status()).toBe(404);

    const resPage0 = await page.goto('/page/0/?s=wordpress');
    expect(resPage0?.status()).toBe(404);

    const resPage02 = await page.goto('/page/02/?s=wordpress');
    expect(resPage02?.status()).toBe(404);

    // 8. Form submit from /goc-nhin/ lands on results
    await page.goto('/goc-nhin/');
    const searchInput = page.locator('#secondary input.search-field');
    await searchInput.fill('cache');
    await page.locator('#secondary button.ux-search-submit').click();
    await page.waitForURL('**/?s=cache');
    await expect(page.locator('#section_1769897078 h1')).toContainText('Kết quả tìm kiếm: cache');
  });

  test('Dev-fixture search variant excludes draft post from results', async ({ page }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    // Searching "Fixture" should match published posts in fixtures, but draft post "Fixture Draft Post Title" must be absent
    await page.goto('/dev-fixtures/blog/search?s=Fixture');
    const articles = page.locator('#post-list article');
    await expect(articles).toHaveCount(2);
    const titles = await articles.locator('.title-post-archive').allInnerTexts();
    expect(titles).not.toContain('Fixture Draft Post Title');

    // Searching specifically for draft keyword returns no results
    await page.goto('/dev-fixtures/blog/search?s=Draft');
    await expect(page.locator('#post-list article')).toHaveCount(0);
    await expect(page.locator('#post-list')).toContainText('Không tìm thấy bài viết phù hợp.');
  });
});
