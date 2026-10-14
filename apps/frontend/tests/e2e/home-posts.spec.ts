import { dragSlider, expect, expectNoDuplicateIds, STAGING, test } from './fixtures';
import { homePages } from '../../src/data/pages/home';
import { posts } from '../../src/data/posts';
import { assets } from '../../src/data/assets';
import { resolveRoute } from '../../src/lib/queries/site';

test.describe('Latest posts', () => {
  const postMap = new Map(posts.map((p) => [p.id, p]));
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  test('Grid holds 3 a.plain links matching placement posts, hrefs resolve to post-detail routes, thumbnails render, no duplicate IDs', async ({
    page,
  }) => {
    await page.goto('/');

    const grid = page.locator('#text-386464690');
    await expect(grid).toBeVisible();

    const expectedPlacementPaths = homePages[0].postPlacements.map(
      (p) => postMap.get(p.entityId)!.path,
    );
    expect(expectedPlacementPaths).toHaveLength(3);

    const links = grid.locator('a.plain');
    await expect(links).toHaveCount(3);

    const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(hrefs).toEqual(expectedPlacementPaths);

    for (const href of hrefs) {
      if (href) {
        const resolved = await resolveRoute(href);
        expect(resolved).not.toBeNull();
        expect(resolved?.route.kind).toBe('post-detail');
        const res = await page.request.get(href);
        expect(res.status()).toBe(200);
      }
    }

    const validThumbSrcs = homePages[0].postPlacements
      .map((p) => {
        const thumbnailId = postMap.get(p.entityId)!.thumbnailId!;
        const a = assetMap.get(thumbnailId);
        expect(a, `thumbnail asset ${thumbnailId}`).toBeDefined();
        return a!;
      })
      .filter((a) => a.status !== 'missing' && a.src)
      .map((a) => a.src);
    const imgs = grid.locator('img.wp-post-image');
    await expect(imgs).toHaveCount(validThumbSrcs.length);
    expect(await imgs.evaluateAll((els) => els.map((el) => el.getAttribute('src')))).toEqual(
      validThumbSrcs,
    );

    await expectNoDuplicateIds(page);
  });

  const GRID_RESPONSIVE = [
    { width: 1280, expectedPerRow: 3 },
    { width: 850, expectedPerRow: 3 },
    { width: 849, expectedPerRow: 1 },
    { width: 550, expectedPerRow: 1 },
  ];

  for (const { width, expectedPerRow } of GRID_RESPONSIVE) {
    test(`Grid shows ${expectedPerRow} cards per row at ${width}px and slider is hidden`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const grid = page.locator('#text-386464690');
      const slider = page.locator('#text-1494522260');

      await expect(grid).toBeVisible();
      await expect(slider).toBeHidden();

      const cards = grid.locator('.post-item-cus');
      await expect(cards).toHaveCount(3);

      const firstRowCards = await cards.evaluateAll((elements) => {
        const htmlElements = elements as HTMLElement[];
        const top = htmlElements[0].offsetTop;
        return htmlElements.filter((el) => Math.abs(el.offsetTop - top) < 2).length;
      });
      expect(firstRowCards).toBe(expectedPerRow);
    });
  }

  for (const width of [549, 390]) {
    test(`Slider is visible, grid is hidden, arrows mounted (CSS-hidden), 3 dots, no autoplay at ${width}px, wrapping works`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.clock.install();
      await page.goto('/');

      const grid = page.locator('#text-386464690');
      const slider = page.locator('#text-1494522260');

      await expect(grid).toBeHidden();
      await expect(slider).toBeVisible();

      const prevBtn = slider.locator('.flickity-prev-next-button.previous');
      const nextBtn = slider.locator('.flickity-prev-next-button.next');
      // Arrows are mounted but hidden below 550px by Flatsome's
      // `.slider-wrapper .flickity-prev-next-button{display:none}`, as on the source.
      await expect(prevBtn).toBeAttached();
      await expect(nextBtn).toBeAttached();
      await expect(prevBtn).toBeHidden();

      const dots = slider.locator('.flickity-page-dots .dot');
      await expect(dots).toHaveCount(3);
      await expect(dots.nth(0)).toHaveClass(/is-selected/);

      // After 7s with no input, selected dot is unchanged (no autoplay)
      await page.clock.runFor(7000);
      await expect(dots.nth(0)).toHaveClass(/is-selected/);

      // Next advances 0 -> 1 -> 2, then wraps from the last slide back to the first
      await nextBtn.dispatchEvent('click');
      await expect(dots.nth(1)).toHaveClass(/is-selected/);
      await nextBtn.dispatchEvent('click');
      await expect(dots.nth(2)).toHaveClass(/is-selected/);
      await nextBtn.dispatchEvent('click');
      await expect(dots.nth(0)).toHaveClass(/is-selected/);
    });
  }

  test('Posts slider dot and drag select slides; grid returns after resize', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/');
    const slider = page.locator('#text-1494522260');
    const grid = page.locator('#text-386464690');
    const dots = slider.locator('.flickity-page-dots .dot');
    const viewport = slider.locator('.flickity-viewport');
    await expect(slider).toBeVisible();
    await expect(grid).toBeHidden();
    await dots.nth(1).click();
    await expect(dots.nth(1)).toHaveClass(/is-selected/);
    await dots.nth(0).click();
    await expect(dots.nth(0)).toHaveClass(/is-selected/);
    await viewport.scrollIntoViewIfNeeded();
    await dragSlider(page, viewport, 0.35);
    await expect(dots.nth(1)).toHaveClass(/is-selected/);
    await page.setViewportSize({ width: 768, height: 900 });
    await expect(grid).toBeVisible();
    await expect(slider).toBeHidden();
  });

  test('EN home route renders no latest posts section', async ({ page }) => {
    await page.goto('/en/home/');
    await expect(page.locator('#section_549960105')).toHaveCount(0);
  });

  test('Missing-media fixture renders fallback post card with title and link without img', async ({
    page,
  }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    await page.goto('/dev-fixtures/home/missing-media');
    const cards = page.locator('#text-386464690 .post-item-cus');
    await expect(cards).toHaveCount(1);
    await expect(cards.locator('.image-cover')).toBeVisible();
    await expect(cards.locator('h5.post-tt-cus')).toHaveText('Fixture');
    await expect(cards.locator('a.plain')).toHaveAttribute('href', /^\/fixture-post\/?$/);
    await expect(cards.locator('img')).toHaveCount(0);

    const sliderCards = page.locator('#text-1494522260 .post-item-cus');
    await expect(sliderCards).toHaveCount(1);
    await expect(sliderCards.locator('img')).toHaveCount(0);
  });

  test('Empty fixture renders no post cards and no section', async ({ page }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    await page.goto('/dev-fixtures/home/empty');
    await expect(page.locator('.post-item-cus')).toHaveCount(0);
    await expect(page.locator('#section_549960105')).toHaveCount(0);
  });
});
