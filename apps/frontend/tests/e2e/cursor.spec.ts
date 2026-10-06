import { expect, installRafCounter, test } from './fixtures';

test.describe('Custom cursor island', () => {
  test('Fine pointer: renders one cursor island, hides native cursor', async ({ page }) => {
    await page.goto('/');

    const cursor = page.locator('.custom-cursor');
    await expect(cursor).toHaveCount(1);
    await expect(cursor).toHaveCSS('display', 'block');
    await expect(page.locator('.cursor-dot')).toBeVisible();
    await expect(page.locator('.cursor-ring')).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('cursor', 'none');
  });

  test('Small desktop window (<= 549px) with fine pointer retains visible dot and ring', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('/');

    const cursor = page.locator('.custom-cursor');
    await expect(cursor).toHaveCount(1);
    await expect(cursor).toHaveCSS('display', 'block');
    await expect(page.locator('.cursor-dot')).toBeVisible();
    await expect(page.locator('.cursor-ring')).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('cursor', 'none');
  });

  test('Route audit: exactly one custom-cursor on multiple shell routes', async ({ page }) => {
    const routes = [
      '/',
      '/en/home/',
      '/dev-fixtures/shell/default/',
      '/dev-fixtures/shell/no-counterpart/',
    ];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('.custom-cursor')).toHaveCount(1);
    }
  });

  test('Movement and ring convergence', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/has-custom-cursor/);

    const dot = page.locator('.cursor-dot');
    const ring = page.locator('.cursor-ring');

    // Move to (200, 300)
    await page.mouse.move(200, 300);

    // Dot updates position immediately
    await expect(dot).toHaveCSS('left', '200px');
    await expect(dot).toHaveCSS('top', '300px');

    // Ring lerps and converges to (200, 300)
    await expect
      .poll(async () => {
        const left = await ring.evaluate((el) => parseFloat(el.style.left));
        const top = await ring.evaluate((el) => parseFloat(el.style.top));
        return Math.hypot(left - 200, top - 300);
      })
      .toBeLessThan(2);
  });

  test('Hover interactive expansion to 60px and contraction to 40px', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/has-custom-cursor/);

    const ring = page.locator('.cursor-ring');

    // Default ring size is 40px
    await expect(ring).toHaveCSS('width', '40px');
    await expect(ring).toHaveCSS('height', '40px');

    // Hover over an interactive element
    const logoLink = page.locator('#logo a, #masthead a').first();
    await logoLink.hover();

    await expect(ring).toHaveCSS('width', '60px');
    await expect(ring).toHaveCSS('height', '60px');

    // Move mouse away to a non-interactive point
    await page.mouse.move(100, 100);

    await expect(ring).toHaveCSS('width', '40px');
    await expect(ring).toHaveCSS('height', '40px');
  });

  test('Hover on a button added after mount; ring resets when it unmounts', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/has-custom-cursor/);

    const ring = page.locator('.cursor-ring');
    await page.evaluate(() => {
      const button = document.createElement('button');
      button.id = 'cursor-test-button';
      button.textContent = 'Test';
      button.style.cssText = 'position:fixed;left:300px;top:300px;width:120px;height:60px;z-index:10000';
      document.body.append(button);
    });

    await page.locator('#cursor-test-button').hover();
    await expect(ring).toHaveCSS('width', '60px');

    // Removed under the pointer: no mouseout fires, the next mouseover must reset the ring.
    await page.evaluate(() => document.getElementById('cursor-test-button')?.remove());
    await page.mouse.move(310, 310);
    await page.mouse.move(320, 320);
    await expect(ring).toHaveCSS('width', '40px');
    await expect(ring).toHaveCSS('height', '40px');
  });

  test('Media change at runtime starts and stops the island with the native cursor', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('body')).toHaveCSS('cursor', 'auto');
    await expect(page.locator('.custom-cursor')).toHaveCSS('display', 'none');

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('body')).toHaveCSS('cursor', 'none');
    await page.mouse.move(250, 250);
    await expect(page.locator('.cursor-dot')).toHaveCSS('left', '250px');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('body')).toHaveCSS('cursor', 'auto');
    await expect(page.locator('.custom-cursor')).toHaveCSS('display', 'none');
  });

  test('Delegated hover works after client navigation', async ({ page }) => {
    await page.goto('/');

    const ring = page.locator('.cursor-ring');

    // Client navigate to EN home
    const enSwitcher = page.locator('.lang-switcher-inline a');
    await enSwitcher.click();
    await page.waitForURL('**/en/home/');
    await expect(page.locator('html')).toHaveClass(/has-custom-cursor/);

    // Hover an interactive element on the new page
    const linkOnNewPage = page.locator('#logo a, #masthead a').first();
    await linkOnNewPage.hover();

    await expect(ring).toHaveCSS('width', '60px');
    await expect(ring).toHaveCSS('height', '60px');

    // Move away to non-interactive point
    await page.mouse.move(100, 100);
    await expect(ring).toHaveCSS('width', '40px');
    await expect(ring).toHaveCSS('height', '40px');
  });

  test('Reduced motion fallback: native cursor auto, cursor hidden, no RAF loop', async ({
    page,
  }) => {
    await installRafCounter(page);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(page.locator('body')).toHaveCSS('cursor', 'auto');
    await expect(page.locator('.custom-cursor')).toHaveCSS('display', 'none');
    await expect(page.locator('.custom-cursor')).not.toBeVisible();

    await page.waitForTimeout(100);
    const rafCalls = await page.evaluate(() =>
      (window as unknown as { __getRafCount: () => number }).__getRafCount(),
    );
    expect(rafCalls).toBe(0);
  });

  test('Navigation persistence: one cursor node and single RAF loop', async ({ page }) => {
    await installRafCounter(page);

    await page.goto('/');
    await expect(page.locator('.custom-cursor')).toHaveCount(1);

    // Measure initial RAF loop rate
    await page.evaluate(() => (window as unknown as { __resetRafCount: () => void }).__resetRafCount());
    await page.waitForTimeout(200);
    const initialRate = await page.evaluate(() =>
      (window as unknown as { __getRafCount: () => number }).__getRafCount(),
    );
    expect(initialRate).toBeGreaterThan(0);

    // Client navigate to EN home
    const enSwitcher = page.locator('.lang-switcher-inline a');
    await enSwitcher.click();
    await page.waitForURL('**/en/home/');

    // Still exactly one custom-cursor node
    await expect(page.locator('.custom-cursor')).toHaveCount(1);

    // Measure RAF rate after navigation
    await page.evaluate(() => (window as unknown as { __resetRafCount: () => void }).__resetRafCount());
    await page.waitForTimeout(200);
    const postRate = await page.evaluate(() =>
      (window as unknown as { __getRafCount: () => number }).__getRafCount(),
    );

    // Single RAF loop persists without spawning an extra loop
    expect(postRate).toBeGreaterThan(0);
    expect(postRate).toBeLessThan(initialRate * 1.6);
  });
});

test.describe('Coarse pointer fallback', () => {
  test.use({ hasTouch: true, isMobile: true });

  test('Coarse pointer: native cursor auto, cursor hidden, no RAF loop', async ({ page }) => {
    await installRafCounter(page);

    await page.goto('/dev-fixtures/shell/default/');

    await expect(page.locator('body')).toHaveCSS('cursor', 'auto');
    await expect(page.locator('.custom-cursor')).toHaveCSS('display', 'none');
    await expect(page.locator('.custom-cursor')).not.toBeVisible();

    await page.waitForTimeout(100);
    const rafCalls = await page.evaluate(() =>
      (window as unknown as { __getRafCount: () => number }).__getRafCount(),
    );
    expect(rafCalls).toBe(0);
  });
});
