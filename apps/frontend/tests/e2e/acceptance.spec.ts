import type { Page } from '@playwright/test';
import {
  expect,
  expectNoDuplicateIds,
  getBodyOverflow,
  KNOWN_ABSENT_CSS_ASSETS,
  STAGING,
  test,
} from './fixtures';

const WIDTHS = [390, 549, 550, 768, 849, 850, 1280, 1440];

function setupConsoleCollector(page: Page) {
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
  // The console 404 line carries no URL, so 404s are checked here. Only RSC prefetches of nav
  // routes that later epics build are expected; a missing asset or page document still fails.
  // ponytail: blanket _rsc allowance; drop it once every nav route exists (epic-fidelity).
  page.on('response', (res) => {
    if (res.status() !== 404) return;
    const url = new URL(res.url());
    if (
      url.pathname.startsWith('/dev-fixtures/') ||
      KNOWN_ABSENT_CSS_ASSETS.has(url.pathname) ||
      url.searchParams.has('_rsc')
    )
      return;
    consoleErrors.push(`404 ${res.url()}`);
  });
  (page as unknown as { __consoleErrors: string[] }).__consoleErrors = consoleErrors;
}

function verifyConsoleCollector(page: Page) {
  const errors = (page as unknown as { __consoleErrors?: string[] }).__consoleErrors ?? [];
  expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
}

test.describe('Acceptance: Site shell on real routes', () => {
  test.beforeEach(async ({ page }) => {
    setupConsoleCollector(page);
  });

  test.afterEach(async ({ page }) => {
    verifyConsoleCollector(page);
  });

  test('Header sticky 90→70 motion at 1440px and stuck behavior at 390px on real routes', async ({
    page,
  }) => {
    for (const path of ['/', '/en/home/']) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      await page.evaluate(() => {
        const main = document.querySelector('main');
        if (main) main.style.minHeight = '2000px';
      });

      const header = page.locator('#header');
      const wrapper = page.locator('#header .header-wrapper');
      const masthead = page.locator('#masthead');

      await expect(header).toHaveClass(/transparent/);
      await expect(wrapper).not.toHaveClass(/stuck/);
      const unstuckMainHeight = await masthead.evaluate((el) => el.getBoundingClientRect().height);
      expect(Math.round(unstuckMainHeight), `Desktop unstuck height on ${path}`).toBe(90);

      await page.evaluate(() => window.scrollTo(0, 300));
      await expect(wrapper).toHaveClass(/stuck/);
      await expect(header).not.toHaveClass(/(^|\s)transparent(\s|$)/);
      const stuckMainHeight = await masthead.evaluate((el) => el.getBoundingClientRect().height);
      expect(Math.round(stuckMainHeight), `Desktop stuck height on ${path}`).toBe(70);

      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(wrapper).not.toHaveClass(/stuck/);
      await expect(header).toHaveClass(/transparent/);
      const restoredMainHeight = await masthead.evaluate((el) => el.getBoundingClientRect().height);
      expect(Math.round(restoredMainHeight), `Desktop restored height on ${path}`).toBe(90);

      // Mobile 390px: unstuck 90px -> scroll sticks wrapper (hidden at <=549px per legacy CSS)
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto(path);
      await page.evaluate(() => {
        const main = document.querySelector('main');
        if (main) main.style.minHeight = '2000px';
      });

      const mobileMasthead = page.locator('#masthead');
      const mobileWrapper = page.locator('#header .header-wrapper');
      const mobileUnstuckHeight = await mobileMasthead.evaluate(
        (el) => el.getBoundingClientRect().height,
      );
      expect(Math.round(mobileUnstuckHeight), `Mobile unstuck height on ${path}`).toBe(90);

      await page.evaluate(() => window.scrollTo(0, 300));
      await expect(mobileWrapper).toHaveClass(/stuck/);
      const mobileStuckDisplay = await mobileWrapper.evaluate(
        (el) => window.getComputedStyle(el).display,
      );
      expect(mobileStuckDisplay, `Mobile stuck wrapper display on ${path}`).toBe('none');

      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(mobileWrapper).not.toHaveClass(/stuck/);
    }
  });

  test('HeaderMotion resize: stuck state and geometry respond to viewport resize', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) main.style.minHeight = '2000px';
    });

    const header = page.locator('#header');
    const wrapper = page.locator('#header .header-wrapper');
    const masthead = page.locator('#masthead');

    // Scroll to 300 to stick at 1440px
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect(wrapper).toHaveClass(/stuck/);
    expect(Math.round(await masthead.evaluate((el) => el.getBoundingClientRect().height))).toBe(70);

    // Resize to mobile viewport (390px) while scrolled
    await page.setViewportSize({ width: 390, height: 900 });
    await expect(wrapper).toHaveClass(/stuck/);
    const mobileDisplay = await wrapper.evaluate((el) => window.getComputedStyle(el).display);
    expect(mobileDisplay).toBe('none');

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(wrapper).not.toHaveClass(/stuck/);
    await expect(header).toHaveClass(/transparent/);
    expect(Math.round(await masthead.evaluate((el) => el.getBoundingClientRect().height))).toBe(90);

    // Resize back to 1440px unstuck
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(wrapper).not.toHaveClass(/stuck/);
    expect(Math.round(await masthead.evaluate((el) => el.getBoundingClientRect().height))).toBe(90);

    // Scroll to stick again at 1440px
    await page.evaluate(() => window.scrollTo(0, 300));
    await expect(wrapper).toHaveClass(/stuck/);
    expect(Math.round(await masthead.evaluate((el) => el.getBoundingClientRect().height))).toBe(70);
  });

  test('Mobile menu drawer open/Escape/focus-return/scroll-lock repeated 3 times', async ({
    page,
  }) => {
    for (const route of ['/', '/en/home/']) {
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto(route);

      const trigger = page.locator('.flex-col.show-for-medium a[aria-controls="main-menu"]');
      await expect(trigger).toBeVisible();

      for (let i = 0; i < 3; i++) {
        await trigger.click();
        const drawer = page.locator('#main-menu');
        await expect(drawer).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(page.locator('body')).toHaveAttribute('data-scroll-locked');
        expect(await getBodyOverflow(page)).toBe('hidden');

        await page.keyboard.press('Escape');
        await expect(drawer).toHaveCount(0);
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(trigger).toBeFocused();
        await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
        expect(await getBodyOverflow(page)).not.toBe('hidden');
      }
    }
  });

  test('Consult popup submit produces demo-success badge repeated 2 times', async ({ page }) => {
    for (const { route, demoBadge } of [
      { route: '/', demoBadge: 'Bản demo — chưa gửi thông tin' },
      { route: '/en/home/', demoBadge: 'Demo — no data was sent' },
    ]) {
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto(route);

      const trigger = page.locator('.flex-col.show-for-medium a[aria-controls="main-menu"]');
      const drawer = page.locator('#main-menu');
      const form = drawer.locator('form.wpcf7-form');
      const input = form.locator('input.wpcf7-tel');
      const submitBtn = form.locator('input.wpcf7-submit');
      const responseOutput = form.locator('.wpcf7-response-output');

      // Each iteration reopens the drawer, so the second submit runs on a fresh form.
      for (let i = 0; i < 2; i++) {
        await trigger.click();
        await expect(drawer).toBeVisible();
        await expect(form).not.toHaveClass(/sent/);

        await input.fill('0988606539');
        await submitBtn.click();

        await expect(responseOutput).toBeVisible();
        await expect(responseOutput).toHaveClass(/sent/);
        await expect(responseOutput).toContainText(demoBadge);
        await expect(form).toHaveClass(/sent/);
        // Input retains value per existing behavior
        await expect(input).toHaveValue('0988606539');

        await page.keyboard.press('Escape');
        await expect(drawer).toHaveCount(0);
        expect(await getBodyOverflow(page)).not.toBe('hidden');
      }
    }
  });

  test('Client navigation between locales preserves overlay operation and restores body overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Client-nav from VI (/) to EN (/en/home/)
    const enLink = page.locator('.header-nav-main .lang-switcher-inline a');
    await expect(enLink).toHaveText('EN');
    await enLink.click();
    await expect(page).toHaveURL(/\/en\/home\/?$/);

    // Desktop menu overlay on EN
    const enTrigger = page.locator('.flex-col.hide-for-medium a[aria-controls="main-menu"]');
    await expect(enTrigger).toBeVisible();
    const enDrawer = page.locator('#main-menu');
    await expect(async () => {
      // Re-click only while closed: a slow first open must not be toggled shut.
      if ((await enTrigger.getAttribute('aria-expanded')) !== 'true') await enTrigger.click();
      await expect(enDrawer).toBeVisible({ timeout: 1000 });
    }).toPass();

    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked');
    expect(await getBodyOverflow(page)).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(enDrawer).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
    expect(await getBodyOverflow(page)).not.toBe('hidden');

    // Client-nav back to VI (/)
    const viLink = page.locator('.header-nav-main .lang-switcher-inline a');
    await expect(viLink).toHaveText('VI');
    await viLink.click();
    await expect(page).toHaveURL((url) => url.pathname === '/');
    await expect(page.locator('.header-nav-main .lang-switcher-inline a')).toHaveText('EN');

    // Desktop menu overlay on VI
    const viTrigger = page.locator('.flex-col.hide-for-medium a[aria-controls="main-menu"]');
    await expect(viTrigger).toBeVisible();
    const viDrawer = page.locator('#main-menu');
    await expect(async () => {
      // Re-click only while closed: a slow first open must not be toggled shut.
      if ((await viTrigger.getAttribute('aria-expanded')) !== 'true') await viTrigger.click();
      await expect(viDrawer).toBeVisible({ timeout: 1000 });
    }).toPass();
    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked');
    expect(await getBodyOverflow(page)).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(viDrawer).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
    expect(await getBodyOverflow(page)).not.toBe('hidden');
  });

  test('In staging mode, /dev-fixtures/shell/default/ returns 404', async ({ page }) => {
    test.skip(!STAGING, 'Staging check only runs when STAGING_URL is set');
    const response = await page.goto('/dev-fixtures/shell/default/');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Acceptance: 8 responsive widths viewport checks', () => {
  const ROUTES = [
    { locale: 'vi', path: '/' },
    { locale: 'en', path: '/en/home/' },
  ];

  for (const { locale, path } of ROUTES) {
    for (const width of WIDTHS) {
      test(`Width ${width}px (${locale}): no overflow, no duplicate IDs, screenshot attached`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);

        const hasHorizontalOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(
          hasHorizontalOverflow,
          `Horizontal overflow detected on ${path} at width ${width}px`,
        ).toBe(false);

        await expectNoDuplicateIds(page);

        const screenshotPath = testInfo.outputPath(`shell-${locale}-${width}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        await testInfo.attach(`shell-${locale}-${width}`, {
          path: screenshotPath,
          contentType: 'image/png',
        });
      });
    }
  }
});

interface HomeSectionSpec {
  name: string;
  selector: string;
  sourceLine: string;
  headingSelector?: string;
  headingText?: string;
}

const VI_SECTIONS: HomeSectionSpec[] = [
  {
    name: 'Hero',
    selector: '#banner-1767683074',
    sourceLine: 'eras-clone/index.html:627',
    headingSelector: 'h1',
    headingText: 'Thấu hiểu, đồng hành',
  },
  {
    name: 'Stats',
    selector: '#row-560000867',
    sourceLine: 'eras-clone/index.html:772',
    headingSelector: 'h2',
    headingText: 'Thành tựu',
  },
  {
    name: 'Services',
    selector: '#section_1856001238',
    sourceLine: 'eras-clone/index.html:1097',
    headingSelector: 'h2',
    headingText: 'Dịch vụ tại Sova',
  },
  {
    name: 'Marquee',
    selector: '#section_1648741915',
    sourceLine: 'eras-clone/index.html:1356',
  },
  {
    name: 'FeaturedProjects',
    selector: 'section.horizontal-scroll-section',
    sourceLine: 'eras-clone/index.html:1400',
    headingSelector: 'h2',
    headingText: 'Dự án chứa đựng',
  },
  {
    name: 'Partners',
    selector: '#section_62935602',
    sourceLine: 'eras-clone/index.html:1664',
    headingSelector: 'h2',
    headingText: 'Đối tác tin cậy',
  },
  {
    name: 'Testimonials',
    selector: '#section_1900032435',
    sourceLine: 'eras-clone/index.html:2122',
    headingSelector: 'h2',
    headingText: 'Khách hàng nhận xét',
  },
  {
    name: 'LatestPosts',
    selector: '#section_549960105',
    sourceLine: 'eras-clone/index.html:2529',
    headingSelector: 'h2',
    headingText: 'Theo dõi tin tức',
  },
];

const EN_SECTIONS: HomeSectionSpec[] = [
  {
    name: 'Hero',
    selector: '#banner-1274327306',
    sourceLine: 'eras-clone/en/home/index.html:627',
    headingSelector: 'h1',
    headingText: 'From Understanding',
  },
  {
    name: 'Stats',
    selector: '#row-34630575',
    sourceLine: 'eras-clone/en/home/index.html:773',
    headingSelector: 'h2',
    headingText: 'Our Achievements',
  },
  {
    name: 'Services',
    selector: '#section_2119007658',
    sourceLine: 'eras-clone/en/home/index.html:1098',
    headingSelector: 'h2',
    headingText: 'Our Services',
  },
  {
    name: 'Marquee',
    selector: '#section_2114423796',
    sourceLine: 'eras-clone/en/home/index.html:1357',
  },
  {
    name: 'Partners',
    selector: '#section_841675174',
    sourceLine: 'eras-clone/en/home/index.html:1599',
    headingSelector: 'h2',
    headingText: 'Our Clients',
  },
  {
    name: 'Testimonials',
    selector: '#section_1228410742',
    sourceLine: 'eras-clone/en/home/index.html:2053',
    headingSelector: 'h2',
    headingText: 'Customer Reviews',
  },
];

const HOME_LOCALES = [
  { locale: 'vi', route: '/', sections: VI_SECTIONS, absent: [] },
  {
    locale: 'en',
    route: '/en/home/',
    sections: EN_SECTIONS,
    // Documented omissions: FeaturedProjects (A22 (e)) and LatestPosts (postPlacements empty).
    absent: ['section.horizontal-scroll-section', '#section_549960105'],
  },
];

for (const { locale, route, sections, absent } of HOME_LOCALES) {
  test.describe(`Acceptance: Home sections (${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      setupConsoleCollector(page);
    });

    test.afterEach(async ({ page }) => {
      verifyConsoleCollector(page);
    });

    test(`${locale.toUpperCase()} home sections are visible with source headings in source order`, async ({
      page,
    }) => {
      await page.goto(route);

      for (const section of sections) {
        const label = `Section ${section.name} (${section.sourceLine})`;
        const root = page.locator(section.selector);
        await expect(root, `${label} root should be visible`).toBeVisible();
        if (section.headingSelector && section.headingText) {
          await expect(
            root.locator(section.headingSelector).first(),
            `${label} heading should contain "${section.headingText}"`,
          ).toContainText(section.headingText);
        }
      }

      const orderError = await page.evaluate((specs) => {
        for (let i = 0; i < specs.length - 1; i++) {
          const a = document.querySelector(specs[i].selector);
          const b = document.querySelector(specs[i + 1].selector);
          if (!a || !b) return `Section ${(a ? specs[i + 1] : specs[i]).name} missing from DOM`;
          if (!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)) {
            return `Section ${specs[i + 1].name} (${specs[i + 1].selector}) does not follow ${specs[i].name} in DOM order`;
          }
        }
        return '';
      }, sections);
      expect(orderError, orderError).toBe('');

      for (const selector of absent) {
        await expect(page.locator(selector), `${selector} should be omitted`).toHaveCount(0);
      }
    });
  });
}
