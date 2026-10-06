import { expect, test } from './fixtures';

test.describe('Tabs and Pagination primitives', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.startsWith('Failed to load resource: the server responded with a status of 404')) {
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

  const tabLocales = [
    { name: 'VI', url: '/dev-fixtures/primitives/tabs' },
    { name: 'EN', url: '/dev-fixtures/primitives/tabs?locale=en' },
  ];

  for (const { name, url } of tabLocales) {
    test(`Tabs ${name}: tab roles, markup, and IDs cross-reference`, async ({ page }) => {
      await page.goto(url);

      const tablist = page.locator('.tabbed-content ul[role="tablist"]');
      await expect(tablist).toHaveCount(1);
      await expect(tablist).toHaveClass(/nav nav-pills nav-vertical nav-normal nav-size-large nav-left/);

      const tabItems = tablist.locator('> li');
      const count = await tabItems.count();
      expect(count).toBeGreaterThan(0);

      const panels = page.locator('.tab-panels > div[role="tabpanel"]');
      await expect(panels).toHaveCount(count);

      for (let i = 0; i < count; i++) {
        const li = tabItems.nth(i);
        await expect(li).toHaveAttribute('role', 'presentation');
        await expect(li).toHaveClass(/tab/);
        await expect(li).toHaveClass(/has-icon/);

        const trigger = li.locator('> a');
        await expect(trigger).toHaveAttribute('role', 'tab');

        const triggerId = await trigger.getAttribute('id');
        expect(triggerId).toBeTruthy();
        expect(triggerId).toMatch(/^tab-.+/);

        const controlsId = await trigger.getAttribute('aria-controls');
        expect(controlsId).toBeTruthy();
        expect(controlsId).toMatch(/^tab_.+/);

        const valFromTrigger = triggerId!.replace(/^tab-/, '');
        const valFromControls = controlsId!.replace(/^tab_/, '');
        expect(valFromControls).toBe(valFromTrigger);

        const panel = panels.nth(i);
        await expect(panel).toHaveClass(/panel/);
        await expect(panel).toHaveClass(/entry-content/);
        await expect(panel).toHaveAttribute('id', controlsId!);
        await expect(panel).toHaveAttribute('aria-labelledby', triggerId!);

        if (i === 0) {
          await expect(li).toHaveClass(/active/);
          await expect(trigger).toHaveAttribute('aria-selected', 'true');
          await expect(panel).toHaveClass(/active/);
        } else {
          await expect(li).not.toHaveClass(/active/);
          await expect(trigger).toHaveAttribute('aria-selected', 'false');
          await expect(panel).not.toHaveClass(/active/);
        }
      }
    });
  }

  test('Tabs: matches source structure at 1280px for the first two tabs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dev-fixtures/primitives/tabs');

    const tablist = page.locator('.tabbed-content.tab_cus_new ul.nav');
    const firstLi = tablist.locator('> li').nth(0);
    const secondLi = tablist.locator('> li').nth(1);

    await expect(firstLi).toHaveClass('tab has-icon active');
    await expect(firstLi).toHaveAttribute('role', 'presentation');
    const firstTrigger = firstLi.locator('> a');
    await expect(firstTrigger).toHaveAttribute('role', 'tab');
    await expect(firstTrigger).toHaveAttribute('aria-selected', 'true');
    await expect(firstTrigger.locator('> span')).toHaveText('Thiết kế website');

    await expect(secondLi).toHaveClass('tab has-icon');
    await expect(secondLi).toHaveAttribute('role', 'presentation');
    const secondTrigger = secondLi.locator('> a');
    await expect(secondTrigger).toHaveAttribute('role', 'tab');
    await expect(secondTrigger).toHaveAttribute('aria-selected', 'false');
    await expect(secondTrigger).toHaveAttribute('tabindex', '-1');
    await expect(secondTrigger.locator('> span')).toHaveText('Thiết kế App Mobile');
  });

  test('Tabs keyboard interaction: ArrowDown, Home and End move and activate', async ({ page }) => {
    await page.goto('/dev-fixtures/primitives/tabs');

    const tablist = page.locator('.tabbed-content ul[role="tablist"]');
    const triggers = tablist.locator('a[role="tab"]');
    const panels = page.locator('.tab-panels > div[role="tabpanel"]');
    const totalTabs = await triggers.count();

    const firstTrigger = triggers.first();
    const secondTrigger = triggers.nth(1);
    const lastTrigger = triggers.last();

    await firstTrigger.focus();
    await expect(firstTrigger).toBeFocused();
    await expect(firstTrigger).toHaveAttribute('aria-selected', 'true');
    await expect(panels.first()).toHaveClass(/active/);

    // ArrowDown activates next tab
    await page.keyboard.press('ArrowDown');
    await expect(secondTrigger).toBeFocused();
    await expect(secondTrigger).toHaveAttribute('aria-selected', 'true');
    await expect(tablist.locator('> li').nth(1)).toHaveClass(/active/);
    await expect(panels.nth(1)).toHaveClass(/active/);
    await expect(firstTrigger).toHaveAttribute('aria-selected', 'false');
    await expect(tablist.locator('> li').nth(0)).not.toHaveClass(/active/);
    await expect(panels.nth(0)).not.toHaveClass(/active/);

    // End activates last tab
    await page.keyboard.press('End');
    await expect(lastTrigger).toBeFocused();
    await expect(lastTrigger).toHaveAttribute('aria-selected', 'true');
    await expect(tablist.locator('> li').nth(totalTabs - 1)).toHaveClass(/active/);
    await expect(panels.nth(totalTabs - 1)).toHaveClass(/active/);
    await expect(secondTrigger).toHaveAttribute('aria-selected', 'false');
    await expect(tablist.locator('> li').nth(1)).not.toHaveClass(/active/);

    // Home activates first tab
    await page.keyboard.press('Home');
    await expect(firstTrigger).toBeFocused();
    await expect(firstTrigger).toHaveAttribute('aria-selected', 'true');
    await expect(tablist.locator('> li').nth(0)).toHaveClass(/active/);
    await expect(panels.nth(0)).toHaveClass(/active/);
    await expect(lastTrigger).toHaveAttribute('aria-selected', 'false');
    await expect(tablist.locator('> li').nth(totalTabs - 1)).not.toHaveClass(/active/);
  });

  test('Tabs: mouse click activates without changing the URL hash', async ({ page }) => {
    await page.goto('/dev-fixtures/primitives/tabs');

    const tablist = page.locator('.tabbed-content ul[role="tablist"]');
    const secondTrigger = tablist.locator('a[role="tab"]').nth(1);
    const panels = page.locator('.tab-panels > div[role="tabpanel"]');

    await secondTrigger.click();
    await expect(secondTrigger).toHaveAttribute('aria-selected', 'true');
    await expect(tablist.locator('> li').nth(1)).toHaveClass(/active/);
    await expect(panels.nth(1)).toHaveClass(/active/);
    await expect(tablist.locator('> li').nth(0)).not.toHaveClass(/active/);
    await expect(panels.nth(0)).not.toHaveClass(/active/);
    expect(page.url()).not.toContain('#tab_');
  });

  const paginationLabelCases = [
    { name: 'VI', query: 'page=2', nav: 'Phân trang', prev: 'Trang trước', next: 'Trang sau' },
    { name: 'EN', query: 'locale=en&page=2', nav: 'Pagination', prev: 'Previous', next: 'Next' },
  ];

  for (const { name, query, nav, prev, next } of paginationLabelCases) {
    test(`Pagination ${name}: accessible names come from labels in both modes`, async ({ page }) => {
      await page.goto(`/dev-fixtures/primitives/pagination?${query}`);

      const linkRoot = page.locator('[data-testid="link-pagination-section"] nav.pagination');
      await expect(linkRoot).toHaveAttribute('aria-label', nav);
      await expect(linkRoot.locator('a.prev')).toHaveAttribute('aria-label', prev);
      await expect(linkRoot.locator('a.next')).toHaveAttribute('aria-label', next);

      const actionRoot = page.locator('[data-testid="action-pagination-section"] nav.pagination');
      await expect(actionRoot).toHaveAttribute('aria-label', nav);
      await expect(actionRoot.locator('button.prev')).toHaveAttribute('aria-label', prev);
      await expect(actionRoot.locator('button.next')).toHaveAttribute('aria-label', next);

      if (name === 'EN') {
        await expect(linkRoot.locator('a.next')).toHaveAttribute('href', /locale=en/);
      }
    });
  }

  test('Pagination: out-of-range page is clamped by the component', async ({ page }) => {
    await page.goto('/dev-fixtures/primitives/pagination?page=99');
    const highRoot = page.locator('[data-testid="link-pagination-section"] .pagination');
    await expect(highRoot.locator('span.page-numbers.current')).toHaveText('5');
    await expect(highRoot.locator('a.next')).toHaveCount(0);
    await expect(highRoot.locator('a.prev')).toHaveAttribute('href', /page=4/);

    await page.goto('/dev-fixtures/primitives/pagination?page=-3');
    const lowRoot = page.locator('[data-testid="link-pagination-section"] .pagination');
    await expect(lowRoot.locator('span.page-numbers.current')).toHaveText('1');
    await expect(lowRoot.locator('a.prev')).toHaveCount(0);
    await expect(lowRoot.locator('a.next')).toHaveAttribute('href', /page=2/);
  });

  test('Pagination: link sequences and aria-current for pages 1, 2 and 5', async ({ page }) => {
    // Page 1 of 5
    await page.goto('/dev-fixtures/primitives/pagination?page=1');
    const page1Root = page.locator('[data-testid="link-pagination-section"] .pagination');
    const page1Children = page1Root.locator('> *');
    const page1Classes = await page1Children.evaluateAll((els) => els.map((el) => el.className));
    expect(page1Classes).toEqual([
      'page-numbers current',
      'page-numbers',
      'page-numbers',
      'page-numbers dots',
      'page-numbers',
      'next page-numbers',
    ]);
    const p1Current = page1Root.locator('span.page-numbers.current');
    await expect(p1Current).toHaveText('1');
    await expect(p1Current).toHaveAttribute('aria-current', 'page');
    await expect(page1Root.locator('a.prev')).toHaveCount(0);
    const p1Next = page1Root.locator('a.next');
    await expect(p1Next).toHaveCount(1);
    await expect(p1Next.locator('i.fa.fa-angle-right')).toHaveAttribute('aria-hidden', 'true');

    // Page 2 of 5
    await page.goto('/dev-fixtures/primitives/pagination?page=2');
    const page2Root = page.locator('[data-testid="link-pagination-section"] .pagination');
    const page2Children = page2Root.locator('> *');
    const page2Classes = await page2Children.evaluateAll((els) => els.map((el) => el.className));
    expect(page2Classes).toEqual([
      'prev page-numbers',
      'page-numbers',
      'page-numbers current',
      'page-numbers',
      'page-numbers',
      'page-numbers',
      'next page-numbers',
    ]);
    const p2Current = page2Root.locator('span.page-numbers.current');
    await expect(p2Current).toHaveText('2');
    await expect(p2Current).toHaveAttribute('aria-current', 'page');
    const p2Prev = page2Root.locator('a.prev');
    await expect(p2Prev).toHaveCount(1);
    await expect(p2Prev.locator('i.fa.fa-angle-left')).toHaveAttribute('aria-hidden', 'true');

    // Page 5 of 5
    await page.goto('/dev-fixtures/primitives/pagination?page=5');
    const page5Root = page.locator('[data-testid="link-pagination-section"] .pagination');
    const page5Children = page5Root.locator('> *');
    const page5Classes = await page5Children.evaluateAll((els) => els.map((el) => el.className));
    expect(page5Classes).toEqual([
      'prev page-numbers',
      'page-numbers',
      'page-numbers dots',
      'page-numbers',
      'page-numbers',
      'page-numbers current',
    ]);
    const p5Current = page5Root.locator('span.page-numbers.current');
    await expect(p5Current).toHaveText('5');
    await expect(p5Current).toHaveAttribute('aria-current', 'page');
    await expect(page5Root.locator('a.next')).toHaveCount(0);
  });

  test('Pagination: link navigation moves to selected page', async ({ page }) => {
    await page.goto('/dev-fixtures/primitives/pagination?page=1');

    const linkToPage2 = page.locator('[data-testid="link-pagination-section"] a.page-numbers', {
      hasText: '2',
    });
    await linkToPage2.click();

    await page.waitForURL(/page=2/);
    const current = page.locator('[data-testid="link-pagination-section"] span.page-numbers.current');
    await expect(current).toHaveText('2');
    await expect(current).toHaveAttribute('aria-current', 'page');
  });

  test('Pagination: action mode boundary disabling and callback delivery', async ({ page }) => {
    await page.goto('/dev-fixtures/primitives/pagination?page=1');

    const demoSection = page.locator('[data-testid="action-pagination-section"]');
    const lastPageDisplay = demoSection.locator('[data-testid="last-page"]');
    const prevBtn = demoSection.locator('button.prev.page-numbers');
    const nextBtn = demoSection.locator('button.next.page-numbers');

    // Initially at page 1: prev button is disabled, next is enabled, last-page is empty
    await expect(lastPageDisplay).toHaveText('');
    await expect(prevBtn).toBeDisabled();
    await expect(nextBtn).toBeEnabled();

    // Clicking disabled prev does not fire callback
    await prevBtn.click({ force: true });
    await expect(lastPageDisplay).toHaveText('');

    // Click page 3 button
    const page3Btn = demoSection.locator('button.page-numbers', { hasText: '3' });
    await page3Btn.click();
    await expect(lastPageDisplay).toHaveText('3');

    // After moving to 3, current is span with 3, prev and next enabled
    const currentSpan = demoSection.locator('span.page-numbers.current');
    await expect(currentSpan).toHaveText('3');
    await expect(prevBtn).toBeEnabled();
    await expect(nextBtn).toBeEnabled();

    // Click next button -> moves to 4
    await nextBtn.click();
    await expect(lastPageDisplay).toHaveText('4');
    await expect(demoSection.locator('span.page-numbers.current')).toHaveText('4');

    // Click page 5 button -> moves to 5, next button is disabled
    const page5Btn = demoSection.locator('button.page-numbers', { hasText: '5' });
    await page5Btn.click();
    await expect(lastPageDisplay).toHaveText('5');
    await expect(demoSection.locator('span.page-numbers.current')).toHaveText('5');
    await expect(nextBtn).toBeDisabled();

    // Clicking disabled next does not fire callback
    await nextBtn.click({ force: true });
    await expect(lastPageDisplay).toHaveText('5');
  });

  test('Responsive: 375px viewport has no horizontal overflow for both variants', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    for (const url of ['/dev-fixtures/primitives/tabs', '/dev-fixtures/primitives/pagination']) {
      await page.goto(url);
      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(
        hasHorizontalOverflow,
        `Expected no horizontal overflow on ${url} at 375px viewport`,
      ).toBe(false);
    }
  });
});
