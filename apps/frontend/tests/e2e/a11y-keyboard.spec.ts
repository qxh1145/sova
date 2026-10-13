import { expect, test } from './fixtures';

test.describe('Desktop keyboard navigation', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const [path, label] of [
    ['/', 'Dịch vụ'],
    ['/en/home/', 'Services'],
  ] as const) {
    test(`${label} submenu opens by keyboard and Escape restores focus`, async ({ page }) => {
      await page.goto(path);
      const item = page.locator('#masthead .header-nav-main > li.has-dropdown').filter({ hasText: label });
      const parent = item.locator('> .nav-top-link');
      await page.keyboard.press('Tab');
      for (
        let i = 0;
        i < 12 && !(await parent.evaluate((element) => element === document.activeElement));
        i++
      ) {
        await page.keyboard.press('Tab');
      }
      await expect(parent).toBeFocused();
      await expect(parent).toHaveAttribute('aria-expanded', 'true');
      await expect(item).toHaveClass(/current-dropdown/);
      await expect(item.locator('.sub-menu a').first()).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(item.locator('.sub-menu a').first()).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(parent).toBeFocused();
      await expect(parent).toHaveAttribute('aria-expanded', 'false');
      await expect(item).not.toHaveClass(/current-dropdown/);
      await page.keyboard.press(' ');
      await expect(parent).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Enter');
      await expect(parent).toHaveAttribute('aria-expanded', 'false');
    });
  }

  for (const path of [
    '/',
    '/en/home/',
    '/gioi-thieu/',
    '/thiet-ke-website/',
    '/du-an/',
    '/cau-hoi-thuong-gap/',
    '/lien-he/',
  ]) {
    test(`Tab retains visible focus on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.keyboard.press('Tab');
      await expect
        .poll(() =>
          page.evaluate(() => {
            const active = document.activeElement;
            if (!active || active === document.body || active === document.documentElement) return false;
            const rect = active.getBoundingClientRect();
            const style = window.getComputedStyle(active);
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              rect.bottom > 0 &&
              rect.right > 0 &&
              rect.top < window.innerHeight &&
              rect.left < window.innerWidth &&
              style.visibility !== 'hidden' &&
              style.display !== 'none'
            );
          }),
        )
        .toBe(true);
    });
  }
});
