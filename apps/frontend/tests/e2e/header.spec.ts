import { expect, test } from './fixtures';
import { hasSource, missingSourceMessage, openSource } from '../baseline/source';

test.describe('Header sticky motion and geometry', () => {
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

  test('Matrix 1: Desktop stick — scroll past wrapper+100 sticks header, locks #header height, removes transparent', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dev-fixtures/shell/default/');

    const header = page.locator('#header');
    const wrapper = page.locator('#header .header-wrapper');
    const headerMain = page.locator('#masthead');

    // Unstuck initial state
    await expect(header).toHaveClass(/transparent/);
    await expect(header).toHaveClass(/has-transparent/);
    await expect(wrapper).not.toHaveClass(/stuck/);

    const unstuckHeaderHeight = await header.evaluate((el) => el.getBoundingClientRect().height);
    const unstuckMainHeight = await headerMain.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(unstuckMainHeight)).toBe(90);
    expect(Math.round(unstuckHeaderHeight)).toBeGreaterThanOrEqual(90);

    // Scroll past wrapperHeight + 100 (90 + 100 = 190)
    await page.evaluate(() => window.scrollTo(0, 300));

    await expect(wrapper).toHaveClass(/stuck/);
    await expect(header).not.toHaveClass(/(^|\s)transparent(\s|$)/);
    await expect(header).toHaveClass(/has-transparent/);

    // Locked #header height stays locked to pre-stuck height; headerMain shrinks to 70px via legacy CSS
    const stuckHeaderHeight = await header.evaluate((el) => el.getBoundingClientRect().height);
    const stuckMainHeight = await headerMain.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(stuckHeaderHeight)).toBe(Math.round(unstuckHeaderHeight));
    expect(Math.round(stuckMainHeight)).toBe(70);
  });

  test('Matrix 2: Desktop unstick — scrolling back to 0 restores 90px and transparent', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dev-fixtures/shell/default/');

    const header = page.locator('#header');
    const wrapper = page.locator('#header .header-wrapper');
    const headerMain = page.locator('#masthead');

    // Scroll past threshold to stick
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect(wrapper).toHaveClass(/stuck/);
    await expect(header).not.toHaveClass(/(^|\s)transparent(\s|$)/);

    // Scroll back to 0
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(wrapper).not.toHaveClass(/stuck/);
    await expect(header).toHaveClass(/(^|\s)transparent(\s|$)/);

    const restoredMainHeight = await headerMain.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(restoredMainHeight)).toBe(90);
  });

  test('Matrix 3: Hysteresis band — scrollY 1..threshold after sticking stays stuck', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dev-fixtures/shell/default/');

    const wrapper = page.locator('#header .header-wrapper');

    // Stick by scrolling to 300
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect(wrapper).toHaveClass(/stuck/);

    // Scroll up into hysteresis band (e.g. 100, which is below 190 threshold but >= 1)
    await page.evaluate(() => window.scrollTo(0, 100));
    await expect(wrapper).toHaveClass(/stuck/);

    // Scroll to 50
    await page.evaluate(() => window.scrollTo(0, 50));
    await expect(wrapper).toHaveClass(/stuck/);

    // Scroll to 1
    await page.evaluate(() => window.scrollTo(0, 1));
    await expect(wrapper).toHaveClass(/stuck/);

    // Drop below 1 to unstick
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(wrapper).not.toHaveClass(/stuck/);
  });

  test('Matrix 4: Load scrolled — reload at scrollY 600 sticks with ux-no-animation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Set scroll position before DOM/scripts run
    await page.addInitScript(() => {
      window.addEventListener('DOMContentLoaded', () => {
        window.scrollTo(0, 600);
      });
    });

    await page.goto('/dev-fixtures/shell/default/');

    const wrapper = page.locator('#header .header-wrapper');
    await expect(wrapper).toHaveClass(/stuck/);
    await expect(wrapper).toHaveClass(/ux-no-animation/);
  });

  test('Matrix 5: Mobile geometry at 390px — 70px when stuck, stuck wrapper hidden per legacy CSS', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dev-fixtures/shell/default/');

    const wrapper = page.locator('#header .header-wrapper');

    // Scroll past threshold
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect(wrapper).toHaveClass(/stuck/);

    // In legacy CSS: @media (max-width: 549px) { .header-wrapper.stuck { display: none; } }
    const display = await wrapper.evaluate((el) => window.getComputedStyle(el).display);
    expect(display).toBe('none');
  });

  test('Geometry breakpoint matrix: 390 / 549 / 550 / 849 / 850 / 1440', async ({ page }) => {
    const viewports = [
      { width: 390, unstuckHeight: 90, stuckDisplay: 'none', desktopNav: false, mobileNav: true },
      { width: 549, unstuckHeight: 90, stuckDisplay: 'none', desktopNav: false, mobileNav: true },
      { width: 550, unstuckHeight: 90, stuckDisplay: 'block', desktopNav: false, mobileNav: true },
      { width: 849, unstuckHeight: 90, stuckDisplay: 'block', desktopNav: false, mobileNav: true },
      { width: 850, unstuckHeight: 90, stuckDisplay: 'block', desktopNav: true, mobileNav: false },
      { width: 1440, unstuckHeight: 90, stuckDisplay: 'block', desktopNav: true, mobileNav: false },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: 900 });
      await page.goto('/dev-fixtures/shell/default/');

      const headerMain = page.locator('#masthead');
      const wrapper = page.locator('#header .header-wrapper');

      // Check unstuck height
      const h = await headerMain.evaluate((el) => el.getBoundingClientRect().height);
      expect(Math.round(h), `Unstuck height at ${vp.width}px`).toBe(vp.unstuckHeight);

      // Check nav visibility
      const desktopNav = page.locator('.flex-col.hide-for-medium.flex-right');
      const mobileNav = page.locator('.flex-col.show-for-medium.flex-right');

      if (vp.desktopNav) {
        await expect(desktopNav, `Desktop nav visible at ${vp.width}px`).toBeVisible();
        await expect(mobileNav, `Mobile nav hidden at ${vp.width}px`).toBeHidden();
        // Trigger is inside desktop right nav
        await expect(desktopNav.locator('a[aria-controls="main-menu"]')).toBeVisible();
      } else {
        await expect(mobileNav, `Mobile nav visible at ${vp.width}px`).toBeVisible();
        await expect(desktopNav, `Desktop nav hidden at ${vp.width}px`).toBeHidden();
        // Trigger is inside mobile right nav
        await expect(mobileNav.locator('a[aria-controls="main-menu"]')).toBeVisible();
      }

      // Check stuck behavior
      await page.evaluate(() => window.scrollTo(0, 300));
      await expect(wrapper).toHaveClass(/stuck/);

      const disp = await wrapper.evaluate((el) => window.getComputedStyle(el).display);
      expect(disp, `Stuck wrapper display at ${vp.width}px`).toBe(vp.stuckDisplay);

      if (vp.stuckDisplay !== 'none') {
        const stuckH = await headerMain.evaluate((el) => el.getBoundingClientRect().height);
        expect(Math.round(stuckH), `Stuck height at ${vp.width}px`).toBe(70);
      }

      // Reset scroll
      await page.evaluate(() => window.scrollTo(0, 0));
    }
  });

  test('Unmount listener cleanup: scroll listener removed on client navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Track scroll event listeners
    await page.addInitScript(() => {
      const w = window as unknown as {
        __scrollAdded: number;
        __scrollRemoved: number;
      };
      w.__scrollAdded = 0;
      w.__scrollRemoved = 0;

      const origAdd = window.addEventListener;
      const origRemove = window.removeEventListener;

      window.addEventListener = function (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
      ) {
        if (type === 'scroll') w.__scrollAdded++;
        return origAdd.call(this, type, listener, options);
      };

      window.removeEventListener = function (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
      ) {
        if (type === 'scroll') w.__scrollRemoved++;
        return origRemove.call(this, type, listener, options);
      };
    });

    await page.goto('/dev-fixtures/shell/default/');

    const addedOnMount = await page.evaluate(
      () => (window as unknown as { __scrollAdded: number }).__scrollAdded,
    );
    expect(addedOnMount).toBeGreaterThanOrEqual(1);

    // Client-nav away to another fixture
    await page.locator('[data-testid="fixture-client-nav"]').click();
    await expect(page).toHaveURL(/\/dev-fixtures\/overlay\/single\/?$/);

    const { added, removed } = await page.evaluate(() => {
      const w = window as unknown as { __scrollAdded: number; __scrollRemoved: number };
      return { added: w.__scrollAdded, removed: w.__scrollRemoved };
    });

    expect(removed, 'Scroll listener removed on unmount').toBe(added);
  });
});

test.describe('Header source parity comparison against eras-clone', () => {
  test.beforeEach(() => {
    test.skip(!hasSource, missingSourceMessage);
  });

  test('Source geometry parity at 549 / 550 / 849 / 850 (unstuck and stuck)', async ({ page }) => {
    const widths = [549, 550, 849, 850];

    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });

      // Measure source
      await openSource(page, {
        key: `header-${w}`,
        url: '/',
        file: 'index.html',
        family: 'home',
        locale: 'vi',
        reason: 'parity',
      });

      const sourceUnstuck = await page.evaluate(() => {
        const main = document.querySelector('#masthead');
        const trigger = document.querySelector('a[aria-controls="main-menu"]');
        const wrapper = document.querySelector('#header .header-wrapper');
        return {
          mainHeight: main ? Math.round(main.getBoundingClientRect().height) : 0,
          triggerVisible: trigger ? (trigger as HTMLElement).offsetParent !== null : false,
          wrapperDisplay: wrapper ? window.getComputedStyle(wrapper).display : '',
        };
      });

      // Stick in source
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(100);

      const sourceStuck = await page.evaluate(() => {
        const main = document.querySelector('#masthead');
        const wrapper = document.querySelector('#header .header-wrapper');
        return {
          mainHeight: main ? Math.round(main.getBoundingClientRect().height) : 0,
          wrapperDisplay: wrapper ? window.getComputedStyle(wrapper).display : '',
        };
      });

      // Measure Sova
      await page.goto('/dev-fixtures/shell/default/');
      const sovaUnstuck = await page.evaluate(() => {
        const main = document.querySelector('#masthead');
        const trigger = document.querySelector('a[aria-controls="main-menu"]');
        const wrapper = document.querySelector('#header .header-wrapper');
        return {
          mainHeight: main ? Math.round(main.getBoundingClientRect().height) : 0,
          triggerVisible: trigger ? (trigger as HTMLElement).offsetParent !== null : false,
          wrapperDisplay: wrapper ? window.getComputedStyle(wrapper).display : '',
        };
      });

      // Stick in Sova
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(100);

      const sovaStuck = await page.evaluate(() => {
        const main = document.querySelector('#masthead');
        const wrapper = document.querySelector('#header .header-wrapper');
        return {
          mainHeight: main ? Math.round(main.getBoundingClientRect().height) : 0,
          wrapperDisplay: wrapper ? window.getComputedStyle(wrapper).display : '',
        };
      });

      expect(sovaUnstuck.mainHeight, `Unstuck height at ${w}px`).toBe(sourceUnstuck.mainHeight);
      expect(sovaUnstuck.wrapperDisplay, `Unstuck wrapper display at ${w}px`).toBe(
        sourceUnstuck.wrapperDisplay,
      );
      expect(sovaStuck.wrapperDisplay, `Stuck wrapper display at ${w}px`).toBe(
        sourceStuck.wrapperDisplay,
      );
    }
  });
});
