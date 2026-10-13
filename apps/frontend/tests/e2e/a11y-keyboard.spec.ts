import { routes } from '@/data/routes';
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
      // Nested columns (Hosting/VPS) stay display:none under legacy CSS, as in source; only shown links are Tab stops.
      const links = item.locator('.sub-menu a:visible');
      const count = await links.count();
      expect(count).toBeGreaterThan(1);
      for (let i = 0; i < count; i++) {
        await page.keyboard.press('Tab');
        await expect(links.nth(i)).toBeFocused();
        await expect(links.nth(i)).toBeVisible();
      }
      await links.first().focus();
      await page.keyboard.press('Escape');
      await expect(parent).toBeFocused();
      await expect(parent).toHaveAttribute('aria-expanded', 'false');
      await expect(item).not.toHaveClass(/current-dropdown/);
      await page.keyboard.press(' ');
      await expect(parent).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Enter');
      await expect(parent).toHaveAttribute('aria-expanded', 'false');
    });

    test(`${label} submenu opens on hover, stays open on click, closes on leave`, async ({ page }) => {
      await page.goto(path);
      const item = page.locator('#masthead .header-nav-main > li.has-dropdown').filter({ hasText: label });
      const firstLink = item.locator('.sub-menu a').first();
      await expect(firstLink).toBeHidden();
      await item.locator('> .nav-top-link').hover();
      await expect(firstLink).toBeVisible();
      await item.locator('> .nav-top-link').click();
      await expect(firstLink).toBeVisible();
      await expect(item.locator('> .nav-top-link')).toHaveAttribute('aria-expanded', 'true');
      await page.mouse.move(5, 700);
      await item.locator('> .nav-top-link').blur();
      await expect(firstLink).toBeHidden();
    });
  }
});

test.describe('Keyboard sweep per route family', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // One route per (kind, locale), same derivation as acceptance.spec.ts.
  const families = new Map<string, string>();
  for (const r of routes) if (!families.has(`${r.kind}:${r.locale}`)) families.set(`${r.kind}:${r.locale}`, r.path);

  for (const [family, path] of families) {
    test(`${family} ${path}: every Tab stop keeps visible focus`, async ({ page }) => {
      test.slow();
      await page.goto(path);
      const offenders: string[] = [];
      const seen = new Set<string>();
      for (let i = 0; i < 400; i++) {
        await page.keyboard.press('Tab');
        const stop = await page.evaluate(() => {
          const active = document.activeElement as HTMLElement | null;
          if (!active || active === document.body || active === document.documentElement) return { key: 'body', ok: false };
          const path: string[] = [];
          for (let el: Element | null = active; el && el !== document.body; el = el.parentElement) {
            path.unshift(`${el.tagName.toLowerCase()}:${Array.prototype.indexOf.call(el.parentElement?.children ?? [], el)}`);
          }
          const key = `${active.tagName.toLowerCase()}${active.id ? `#${active.id}` : ''} ${active.getAttribute('aria-label') ?? active.textContent?.trim().slice(0, 40) ?? ''} @${path.join('>')}`;
          const rect = active.getBoundingClientRect();
          const style = window.getComputedStyle(active);
          const ok =
            rect.width > 1 &&
            rect.height > 1 &&
            rect.bottom > 0 &&
            rect.right > 0 &&
            rect.top < window.innerHeight &&
            rect.left < window.innerWidth &&
            style.visibility !== 'hidden' &&
            style.display !== 'none';
          return { key, ok };
        });
        if (stop.key === 'body') {
          // Focus left the document once the last stop is passed; a loss before any stop is a defect.
          if (seen.size === 0) offenders.push('focus lost to body before first stop');
          break;
        }
        if (seen.has(stop.key)) break; // wrapped around
        seen.add(stop.key);
        if (!stop.ok) offenders.push(stop.key);
      }
      expect(seen.size, 'no focusable stops reached').toBeGreaterThan(0);
      expect(offenders, `invisible focus targets on ${path}`).toEqual([]);
    });
  }
});
