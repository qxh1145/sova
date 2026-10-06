import { expect, expectNoDuplicateIds, getBodyOverflow, test } from './fixtures';

test.describe('Mobile menu drawer and accordion navigation', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.startsWith('Failed to load resource: the server responded with a status of 404')
        ) {
          consoleErrors.push(text);
        }
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });
    (page as unknown as { __consoleErrors: string[] }).__consoleErrors = consoleErrors;
  });

  test.afterEach(async ({ page }) => {
    const errors = (page as unknown as { __consoleErrors?: string[] }).__consoleErrors ?? [];
    expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
  });

  test('Matrix 1: Keyboard open on mobile (390px) — Enter opens drawer, focus inside, scroll locked', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const trigger = page.locator('.flex-col.show-for-medium a[aria-controls="main-menu"]');
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');

    await trigger.focus();
    await page.keyboard.press('Enter');

    const drawer = page.locator('#main-menu');
    await expect(drawer).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Focus moved inside drawer
    const focusInside = await page.evaluate(() => {
      const active = document.activeElement;
      const d = document.querySelector('#main-menu');
      return !!(d && active && d.contains(active));
    });
    expect(focusInside).toBe(true);

    // Body scroll locked
    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked');
    expect(await getBodyOverflow(page)).toBe('hidden');
  });

  test('Matrix 2: Keyboard open on desktop (1440px) — Enter opens drawer, accordion hidden at >=768px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const trigger = page.locator('.flex-col.hide-for-medium a[aria-controls="main-menu"]');
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');

    await trigger.focus();
    await page.keyboard.press('Enter');

    const drawer = page.locator('#main-menu');
    await expect(drawer).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Accordion is hidden at >=768px per source CSS
    const accordion = drawer.locator('.accordion-mobile-menu');
    const accordionDisplay = await accordion.evaluate((el) => window.getComputedStyle(el).display);
    expect(accordionDisplay).toBe('none');

    // Logo, tagline, contact heading are still visible in desktop drawer
    await expect(drawer.locator('h3')).toContainText('Thấu hiểu, đồng hành');
    await expect(drawer.locator('#text-101127661 h4')).toHaveText('Liên hệ');
  });

  test('Matrix 3: Escape closes drawer, returns focus to trigger, unlocks scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const trigger = page.locator('.flex-col.show-for-medium a[aria-controls="main-menu"]');
    await trigger.click();

    await expect(page.locator('#main-menu')).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked');

    // Press Escape
    await page.keyboard.press('Escape');

    await expect(page.locator('#main-menu')).toHaveCount(0);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();

    // Body scroll unlocked
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
    expect(await getBodyOverflow(page)).not.toBe('hidden');
  });

  test('Matrix 4: Close button — clicking .mfp-close closes drawer and returns focus', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const trigger = page.locator('.flex-col.show-for-medium a[aria-controls="main-menu"]');
    await trigger.click();

    const drawer = page.locator('#main-menu');
    await expect(drawer).toBeVisible();

    const closeBtn = page.locator('button.mfp-close');
    await closeBtn.click();

    await expect(drawer).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
  });

  test('Matrix 5: Submenu toggle — Enter on .toggle-submenu expands submenu without navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const trigger = page.locator('.flex-col.show-for-medium a[aria-controls="main-menu"]');
    await trigger.click();

    const drawer = page.locator('#main-menu');
    await expect(drawer).toBeVisible();

    // Find Dịch vụ item
    const servicesLi = drawer.locator('.accordion-menu > li.has-children').first();
    const toggleBtn = servicesLi.locator('> button.toggle-submenu');
    const subMenu = servicesLi.locator('> ul.sub-menu');

    await expect(servicesLi).not.toHaveClass(/active/);
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    // Toggle open
    const initialUrl = page.url();
    await toggleBtn.focus();
    await page.keyboard.press('Enter');

    await expect(servicesLi).toHaveClass(/active/);
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(page.url()).toBe(initialUrl);

    // Submenu links visible
    await expect(subMenu.locator('a').first()).toBeVisible();

    // Toggle closed
    await page.keyboard.press('Enter');
    await expect(servicesLi).not.toHaveClass(/active/);
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(page.url()).toBe(initialUrl);

    // The destination-free label also toggles, keeps the drawer open and does not navigate
    const label = servicesLi.locator('> a.nav-top-link');
    await label.click();
    await expect(servicesLi).toHaveClass(/active/);
    await expect(label).toHaveAttribute('aria-expanded', 'true');
    await expect(drawer).toBeVisible();
    expect(page.url()).toBe(initialUrl);
  });

  test('Matrix 6: Nested submenu — two-level nesting reachable and navigable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const trigger = page.locator('.flex-col.show-for-medium a[aria-controls="main-menu"]');
    await trigger.click();

    const drawer = page.locator('#main-menu');
    await expect(drawer).toBeVisible();

    // Open level 1 (Dịch vụ)
    const level1Li = drawer.locator('.accordion-menu > li.has-children').first();
    await level1Li.locator('> button.toggle-submenu').click();
    await expect(level1Li).toHaveClass(/active/);

    // Open level 2 (Giải pháp lưu trữ inside Dịch vụ)
    const level2Li = level1Li.locator('ul.sub-menu > li.has-children').first();
    const level2Toggle = level2Li.locator('> button.toggle-submenu');
    await level2Toggle.click();
    await expect(level2Li).toHaveClass(/active/);
    await expect(level2Toggle).toHaveAttribute('aria-expanded', 'true');

    // Grandchild links (Hosting / VPS) reachable
    const grandchildLinks = level2Li.locator('ul.sub-menu a');
    await expect(grandchildLinks).toHaveCount(2);
    await expect(grandchildLinks.first()).toBeVisible();
  });

  test('Matrix 7: Parent link click navigates and closes drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const trigger = page.locator('.flex-col.show-for-medium a[aria-controls="main-menu"]');
    await trigger.click();

    const drawer = page.locator('#main-menu');
    await expect(drawer).toBeVisible();

    // Expand level 1 (Dịch vụ)
    const level1Li = drawer.locator('.accordion-menu > li.has-children').first();
    await level1Li.locator('> button.toggle-submenu').click();
    await expect(level1Li).toHaveClass(/active/);

    // Click parent link with children and destination (Giải pháp lưu trữ)
    const storageLink = drawer.locator('.accordion-menu a', { hasText: 'Giải pháp lưu trữ' });
    await expect(storageLink).toBeVisible();
    await storageLink.click();

    // Drawer closes and page navigates
    await expect(page.locator('#main-menu')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
    await expect(page).toHaveURL(/\/giai-phap-luu-tru\/?$/);
  });

  test('Matrix 8: EN root (/en/home/) — EN labels, EN nav items, reversed switcher', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en/home/');

    const trigger = page.locator('.flex-col.show-for-medium a[aria-controls="main-menu"]');
    await trigger.click();

    const drawer = page.locator('#main-menu');
    await expect(drawer).toBeVisible();

    // EN Tagline
    await expect(drawer.locator('h3')).toHaveText(
      'Understand, accompany, and design a comprehensive digital experience.',
    );

    // EN Headings
    await expect(drawer.locator('#text-1183739128 h4')).toHaveText('Menu');
    await expect(drawer.locator('#text-101127661 h4')).toHaveText('Contact');

    // EN Nav items
    const firstLink = drawer.locator('.accordion-menu > li > a').first();
    await expect(firstLink).toHaveText('Home');

    // EN Switcher: VI link, EN current
    const switcher = drawer.locator('.lang-switcher-inline');
    await expect(switcher.locator('.current-lang')).toHaveText('EN');
    const viLink = switcher.locator('a');
    await expect(viLink).toHaveText('VI');
    await expect(viLink).toHaveAttribute('href', '/');
  });

  test('Matrix 9: No counterpart fixture — drawer switcher shows current locale only', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dev-fixtures/shell/no-counterpart/');

    const trigger = page.locator('.flex-col.show-for-medium a[aria-controls="main-menu"]');
    await trigger.click();

    const drawer = page.locator('#main-menu');
    await expect(drawer).toBeVisible();

    const switcher = drawer.locator('.lang-switcher-inline');
    await expect(switcher.locator('.current-lang')).toHaveText('VI');
    await expect(switcher.locator('a')).toHaveCount(0);
  });

  test('Matrix 10: Duplicate IDs check — no duplicate IDs with drawer open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expectNoDuplicateIds(page);

    // Open drawer and check again
    const trigger = page.locator('.flex-col.show-for-medium a[aria-controls="main-menu"]');
    await trigger.click();
    await expect(page.locator('#main-menu')).toBeVisible();

    await expectNoDuplicateIds(page);
  });
});
