import type { Page } from '@playwright/test';
import {
  ALLOW_404,
  expect,
  expectNoDuplicateIds,
  getBodyOverflow,
  KNOWN_ABSENT_CSS_ASSETS,
  STAGING,
  test,
} from './fixtures';
import { aboutPages } from '../../src/data/pages/about';
import { brandingServices } from '../../src/data/services/branding';
import { emailServices } from '../../src/data/services/email';
import { hostingServices } from '../../src/data/services/hosting';
import { mobileServices } from '../../src/data/services/mobile';
import { seoServices } from '../../src/data/services/seo';
import { storageServices } from '../../src/data/services/storage';
import { vpsServices } from '../../src/data/services/vps';
import { websiteServices } from '../../src/data/services/website';
import { contactPages } from '../../src/data/pages/contact';
import { faqPages } from '../../src/data/pages/faq';
import { legalPages, paymentGuides } from '../../src/data/pages/legal';
import { profiles } from '../../src/data/pages/profile';
import { getContactPreset } from '../../src/components/contact/contactIds';
import { getFAQPreset } from '../../src/components/faq/faqIds';
import { getLegalPreset } from '../../src/components/legal/legalIds';
import { getPaymentPreset } from '../../src/components/legal/paymentIds';
import { routes } from '@/data/routes';
import type { Service } from '@/types/content';
import manifest from '../baseline/manifest.json';

const WIDTHS = manifest.viewports;

function setupResponse404Collector(page: Page) {
  const missingResponses: string[] = [];
  // The console 404 line carries no URL, so 404s are checked here. Every nav route now exists, so a
  // missing asset, page document or RSC prefetch fails.
  page.on('response', (res) => {
    if (res.status() !== 404) return;
    const url = new URL(res.url());
    if (url.pathname.startsWith('/dev-fixtures/') || KNOWN_ABSENT_CSS_ASSETS.has(url.pathname))
      return;
    missingResponses.push(`404 ${res.url()}`);
  });
  (page as unknown as { __missingResponses: string[] }).__missingResponses = missingResponses;
}

function verifyResponse404Collector(page: Page) {
  const errors = (page as unknown as { __missingResponses?: string[] }).__missingResponses ?? [];
  expect(errors, `Unexpected 404 responses:\n${errors.join('\n')}`).toEqual([]);
}

test.describe('Acceptance: Site shell on real routes', () => {
  test.beforeEach(async ({ page }) => {
    setupResponse404Collector(page);
  });

  test.afterEach(async ({ page }) => {
    verifyResponse404Collector(page);
  });

  test('Header sticky 90→70 motion at 1440px and stuck behavior at 390px on real routes', async ({
    page,
  }) => {
    // Home's autoplay hero video holds back `load` for 30s+ on a cold preview; 4 Home loads here.
    test.setTimeout(180_000);
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

    // Full document load from VI (/) to EN (/en/home/) across root layouts
    const enLink = page.locator('.header-nav-main .lang-switcher-inline a');
    await expect(enLink).toHaveText('EN');
    await enLink.click();
    await page.waitForURL(/\/en\/home\/?$/, { waitUntil: 'commit' });

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

    // Full document load back to VI (/) across root layouts
    const viLink = page.locator('.header-nav-main .lang-switcher-inline a');
    await expect(viLink).toHaveText('VI');
    await viLink.click();
    await page.waitForURL((url) => url.pathname === '/', { waitUntil: 'commit' });
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

  test.describe('staging dev-fixture 404', () => {
    test.use({ allowConsole: [ALLOW_404] });

    test('In staging mode, /dev-fixtures/shell/default/ returns 404', async ({ page }) => {
      test.skip(!STAGING, 'Staging check only runs when STAGING_URL is set');
      const response = await page.goto('/dev-fixtures/shell/default/');
      expect(response?.status()).toBe(404);
    });
  });
});

test.describe('Acceptance: 8 responsive widths viewport checks', () => {
  // One route per (kind, locale) derived from routes registry
  const familyRoutesMap = new Map<string, { locale: string; path: string; kind: string }>();
  for (const r of routes) {
    const key = `${r.kind}:${r.locale}`;
    if (!familyRoutesMap.has(key)) {
      familyRoutesMap.set(key, { locale: r.locale, path: r.path, kind: r.kind });
    }
  }
  const ROUTES = Array.from(familyRoutesMap.values());

  const ALLOWED_SCROLLER_SELECTORS = [
    '.horizontal-scroll-section',
    '.vps-table-wrapper',
    '.timeline-track-wrap',
    '.embla__viewport',
    '.flickity-viewport',
  ];

  for (const { locale, path, kind } of ROUTES) {
    test(`${kind} (${locale}) responsive widths: no overflow, no duplicate IDs`, async ({
      page,
    }, testInfo) => {
      for (const width of WIDTHS) {
        await test.step(`Width ${width}px (${locale}): no overflow, no duplicate IDs, screenshot attached`, async () => {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(path);

          const overflowOffenders = await page.evaluate(() => {
            const root = document.documentElement;
            if (root.scrollWidth <= root.clientWidth) return null;
            const offenders: string[] = [];
            for (const el of Array.from(document.body.querySelectorAll('*'))) {
              if (el.getBoundingClientRect().right <= root.clientWidth) continue;
              // Report only the outermost offender of each overflowing subtree.
              if (
                el.parentElement &&
                el.parentElement.getBoundingClientRect().right > root.clientWidth
              )
                continue;
              const id = el.id ? `#${el.id}` : '';
              const cls =
                typeof el.className === 'string' && el.className.trim()
                  ? `.${el.className.trim().split(/\s+/).join('.')}`
                  : '';
              offenders.push(`${el.tagName.toLowerCase()}${id}${cls}`);
            }
            return offenders;
          });
          expect
            .soft(
              overflowOffenders,
              `Horizontal overflow detected on ${path} (${kind}) at width ${width}px: ${overflowOffenders?.join(', ')}`,
            )
            .toBeNull();

          const unallowedScrollers = await page.evaluate((allowedSelectors) => {
            const offenders: string[] = [];
            for (const el of Array.from(document.querySelectorAll('*'))) {
              const ox = window.getComputedStyle(el).overflowX;
              if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth) {
                if (!allowedSelectors.some((sel) => el.matches(sel))) {
                  const tag = el.tagName.toLowerCase();
                  const id = el.id ? `#${el.id}` : '';
                  const cls =
                    el.className && typeof el.className === 'string'
                      ? `.${el.className.trim().split(/\s+/).join('.')}`
                      : '';
                  offenders.push(`${tag}${id}${cls}`);
                }
              }
            }
            return offenders;
          }, ALLOWED_SCROLLER_SELECTORS);

          expect
            .soft(
              unallowedScrollers,
              `Disallowed horizontal scrollers on ${path} at width ${width}px: ${unallowedScrollers.join(', ')}`,
            )
            .toEqual([]);

          await expectNoDuplicateIds(page);

          const screenshotPath = testInfo.outputPath(`shell-${locale}-${kind}-${width}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: false });
          await testInfo.attach(`shell-${locale}-${kind}-${width}`, {
            path: screenshotPath,
            contentType: 'image/png',
          });
        });
      }
    });
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
      setupResponse404Collector(page);
    });

    test.afterEach(async ({ page }) => {
      verifyResponse404Collector(page);
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

test.describe('Acceptance: Collections', () => {
  test.beforeEach(async ({ page }) => {
    setupResponse404Collector(page);
  });

  test.afterEach(async ({ page }) => {
    verifyResponse404Collector(page);
  });

  const COLLECTION_ROUTES = [
    { name: 'Projects listing (VI)', path: '/du-an/', landmark: '#portfolio-results' },
    { name: 'Projects listing (EN)', path: '/en/our-project/', landmark: '#banner-2108105581' },
    { name: 'Projects archive (VI)', path: '/featured_item/', landmark: '#portfolio-1541637127' },
    {
      name: 'Project category archive',
      path: '/featured_item_category/website/',
      landmark: '#portfolio-200128785',
    },
    {
      name: 'Project detail',
      path: '/featured_item/cong-ty-co-phan-phat-trien-cong-nghe-thp/',
      landmark: '.portfolio-single-page',
    },
    { name: 'Blog listing (VI)', path: '/goc-nhin/', landmark: '#post-list' },
    { name: 'Blog listing page 5 (VI)', path: '/goc-nhin/page/5/', landmark: '#post-list' },
    { name: 'Blog category archive', path: '/thu-thuat/', landmark: '#post-list' },
    {
      name: 'Post detail',
      path: '/website-dong-va-tinh-la-gi-phan-biet-su-khac-nhau-giua-2-khai-niem/',
      landmark: '.blog-single',
    },
    { name: 'Blog listing (EN)', path: '/en/insight/', landmark: '#post-list' },
    { name: 'Search results', path: '/?s=cache', landmark: '#post-list' },
  ];

  for (const { name, path: routePath, landmark } of COLLECTION_ROUTES) {
    test(`${name} (${routePath}) returns 200, renders key landmark, and keeps console clean`, async ({
      page,
    }) => {
      const response = await page.goto(routePath);
      expect(response?.ok(), `Route ${routePath} returned status ${response?.status()}`).toBe(true);
      await expect(
        page.locator(landmark).first(),
        `Landmark ${landmark} visible on ${routePath}`,
      ).toBeVisible();

      if (routePath === '/featured_item/cong-ty-co-phan-phat-trien-cong-nghe-thp/') {
        await expect(page.locator('h1.current-post-title')).toHaveText(
          'Công ty Cổ phần Phát triển Công nghệ THP',
        );
        await expect(page.locator('#slider-duan .img.col')).toHaveCount(2);
      }
    });
  }
});

const EXPECTED_SERVICE_FAQ_COUNTS: Record<string, number> = {
  '/thiet-ke-website/': 8,
  '/en/website-development/': 8,
  '/thiet-ke-app-mobile/': 8,
  '/en/app-mobile-development/': 9,
  '/seo-tu-khoa-website/': 8,
  '/en/website-keyword-seo/': 8,
  '/ui-ux-branding-design/': 10,
  '/en/ui-ux-branding-design-2/': 10,
  '/giai-phap-luu-tru/': 4,
  '/en/storage-solution/': 4,
  '/e-mail-doanh-nghiep/': 9,
  '/en/business-e-mail/': 9,
  '/hosting-doanh-nghiep/': 10,
  '/en/business-hosting/': 10,
  '/vps-doanh-nghiep/': 12,
  '/en/business-vps/': 12,
};

test.describe('Acceptance: Services and About', () => {
  test.beforeEach(async ({ page }) => {
    setupResponse404Collector(page);
  });

  test.afterEach(async ({ page }) => {
    verifyResponse404Collector(page);
  });

  const allServices: Service[] = [
    ...websiteServices,
    ...mobileServices,
    ...seoServices,
    ...brandingServices,
    ...storageServices,
    ...emailServices,
    ...hostingServices,
    ...vpsServices,
  ];

  for (const service of allServices) {
    test(`Service ${service.key} (${service.locale}) on ${service.path} returns 200, key landmarks, and clean console`, async ({
      page,
    }) => {
      const response = await page.goto(service.path);
      expect(response?.ok(), `Route ${service.path} returned status ${response?.status()}`).toBe(
        true,
      );
      await expect(page.locator('main h1').first()).toBeVisible();

      const expectedFaqCount = EXPECTED_SERVICE_FAQ_COUNTS[service.path] ?? 0;
      await expect(page.locator('.accordion-item')).toHaveCount(expectedFaqCount);

      if ((service.testimonialIds?.length ?? 0) > 0) {
        await expect(page.locator('.slide-kh, .section.ss-kh').first()).toBeVisible();
      }

      if (service.pricingId) {
        const selector = ['email', 'hosting', 'vps'].includes(service.key)
          ? '.vps-table-wrapper'
          : '.eras-table-price';
        await expect(page.locator(selector).first()).toBeVisible();
      }
    });
  }

  for (const about of aboutPages) {
    test(`About (${about.locale}) on ${about.path} returns 200, key landmarks, and clean console`, async ({
      page,
    }) => {
      const response = await page.goto(about.path);
      expect(response?.ok(), `Route ${about.path} returned status ${response?.status()}`).toBe(
        true,
      );
      await expect(page.locator('main h1, div#content[role="main"] h1').first()).toBeVisible();

      if ((about.testimonialIds?.length ?? 0) > 0) {
        await expect(page.locator('.slide-kh, .section.ss-kh').first()).toBeVisible();
      }
    });
  }
});

test.describe('Acceptance: Utility', () => {
  test.beforeEach(async ({ page }) => {
    setupResponse404Collector(page);
  });

  test.afterEach(async ({ page }) => {
    verifyResponse404Collector(page);
  });

  for (const pageRecord of legalPages) {
    test(`Legal (${pageRecord.locale}) on ${pageRecord.path} returns 200, banner heading, and clean console`, async ({
      page,
    }) => {
      const response = await page.goto(pageRecord.path);
      expect(response?.ok(), `Route ${pageRecord.path} returned status ${response?.status()}`).toBe(
        true,
      );
      await expect(page.locator('header#header')).toBeVisible();
      await expect(page.locator('footer#footer')).toBeVisible();
      const preset = getLegalPreset(pageRecord.path);
      await expect(page.locator(`#${preset.heroIds.banner} h2`)).toBeVisible();
      await expect(page.locator(`#${preset.bodyIds.row} #${preset.bodyIds.col}`)).toBeVisible();
    });
  }

  for (const guide of paymentGuides) {
    test(`Payment guide (${guide.locale}) on ${guide.path} returns 200, banner heading, and clean console`, async ({
      page,
    }) => {
      const response = await page.goto(guide.path);
      expect(response?.ok(), `Route ${guide.path} returned status ${response?.status()}`).toBe(
        true,
      );
      await expect(page.locator('header#header')).toBeVisible();
      await expect(page.locator('footer#footer')).toBeVisible();
      const preset = getPaymentPreset(guide.path);
      await expect(page.locator(`#${preset.heroIds.banner} h2`)).toBeVisible();
      await expect(page.locator(`#${preset.guideIds.row}`)).toBeVisible();
    });
  }

  for (const faq of faqPages) {
    test(`FAQ (${faq.locale}) on ${faq.path} returns 200, banner heading, tabs, and clean console`, async ({
      page,
    }) => {
      const response = await page.goto(faq.path);
      expect(response?.ok(), `Route ${faq.path} returned status ${response?.status()}`).toBe(true);
      await expect(page.locator('header#header')).toBeVisible();
      await expect(page.locator('footer#footer')).toBeVisible();
      const preset = getFAQPreset(faq.locale);
      await expect(page.locator(`#${preset.heroIds.banner} h2`)).toBeVisible();
      await expect(page.locator('.tabbed-content.tab_cus_new')).toBeVisible();
    });
  }

  for (const contact of contactPages) {
    test(`Contact (${contact.locale}) on ${contact.path} returns 200, hero, form, map, and clean console`, async ({
      page,
    }) => {
      const response = await page.goto(contact.path);
      expect(response?.ok(), `Route ${contact.path} returned status ${response?.status()}`).toBe(
        true,
      );
      await expect(page.locator('header#header')).toBeVisible();
      await expect(page.locator('footer#footer')).toBeVisible();
      const preset = getContactPreset(contact.locale);
      await expect(page.locator(`section#${preset.hero.sectionId} h1`)).toBeVisible();
      await expect(page.locator('form.wpcf7-form')).toBeVisible();
      await expect(page.locator('div.if-black iframe')).toBeVisible();
    });
  }

  for (const profile of profiles) {
    test(`Profile (${profile.locale}) on ${profile.path} returns 200, banner heading, and clean console`, async ({
      page,
    }) => {
      const response = await page.goto(profile.path);
      expect(response?.ok(), `Route ${profile.path} returned status ${response?.status()}`).toBe(
        true,
      );
      await expect(page.locator('header#header')).toBeVisible();
      await expect(page.locator('footer#footer')).toBeVisible();
      const bannerSelector =
        profile.locale === 'vi' ? '#banner-1559052784 h2' : '#banner-151127649 h2';
      await expect(page.locator(bannerSelector)).toBeVisible();
    });
  }

  test('Thank-you (plain) on /eras-xin-chan-thanh-cam-on-quy-khach/ returns 200, heading, no demo badge, and clean console', async ({
    page,
  }) => {
    const response = await page.goto('/eras-xin-chan-thanh-cam-on-quy-khach/');
    expect(
      response?.ok(),
      `Route /eras-xin-chan-thanh-cam-on-quy-khach/ returned status ${response?.status()}`,
    ).toBe(true);
    await expect(page.locator('header#header')).toBeVisible();
    await expect(page.locator('footer#footer')).toBeVisible();
    await expect(page.locator('#section_430522107 h1')).toHaveText('Gửi thông tin thành công!');
    await expect(
      page.locator('.wpcf7-demo-badge'),
      'Expected no demo badge on plain route',
    ).toHaveCount(0);
  });

  test('Thank-you (demo=1) on /eras-xin-chan-thanh-cam-on-quy-khach/?demo=1 returns 200, heading, demo badge, and clean console', async ({
    page,
  }) => {
    const response = await page.goto('/eras-xin-chan-thanh-cam-on-quy-khach/?demo=1');
    expect(
      response?.ok(),
      `Route /eras-xin-chan-thanh-cam-on-quy-khach/?demo=1 returned status ${response?.status()}`,
    ).toBe(true);
    await expect(page.locator('header#header')).toBeVisible();
    await expect(page.locator('footer#footer')).toBeVisible();
    await expect(page.locator('#section_430522107 h1')).toHaveText('Gửi thông tin thành công!');
    await expect(page.locator('.wpcf7-demo-badge'), 'Expected demo badge on ?demo=1').toHaveText(
      'Bản demo — chưa gửi thông tin',
    );
  });

  test('Sample on /sample-page/ returns 200, content, blockquotes, and clean console', async ({
    page,
  }) => {
    const response = await page.goto('/sample-page/');
    expect(response?.ok(), `Route /sample-page/ returned status ${response?.status()}`).toBe(true);
    await expect(page.locator('header#header')).toBeVisible();
    await expect(page.locator('footer#footer')).toBeVisible();
    await expect(page.locator('#content')).toBeVisible();
    await expect(page.locator('#content blockquote')).toHaveCount(2);
  });

  test('Login on /login-eras/ returns 200, #login container, form elements, and clean console', async ({
    page,
  }) => {
    const response = await page.goto('/login-eras/');
    expect(response?.ok(), `Route /login-eras/ returned status ${response?.status()}`).toBe(true);
    await expect(page.locator('body')).toHaveClass(/\blogin\b/);
    await expect(page.locator('body')).toHaveClass(/\bwp-core-ui\b/);
    await expect(page.locator('#login')).toBeVisible();
    await expect(page.locator('#loginform h1')).toHaveText('Đăng nhập');
    await expect(page.locator('#user_login')).toBeVisible();
    await expect(page.locator('#user_pass')).toBeVisible();
    await expect(page.locator('#wp-submit')).toBeVisible();
  });

  test('Alias /porfolio-eras-vietnam/ redirects to EN profile and keeps clean console', async ({
    page,
  }) => {
    const response = await page.goto('/porfolio-eras-vietnam/');
    expect(
      response?.ok(),
      `Route /porfolio-eras-vietnam/ returned status ${response?.status()}`,
    ).toBe(true);
    expect(
      page.url(),
      `Expected landed URL to match /en/porfolio-eras-vietnam/, got ${page.url()}`,
    ).toMatch(/\/en\/porfolio-eras-vietnam\/$/);
    await expect(page.locator('#banner-151127649 h2')).toBeVisible();
  });

  test('Alias /dang-ky-nghi-phep/ redirects to /login-eras/ and keeps clean console', async ({
    page,
  }) => {
    const response = await page.goto('/dang-ky-nghi-phep/');
    expect(response?.ok(), `Route /dang-ky-nghi-phep/ returned status ${response?.status()}`).toBe(
      true,
    );
    expect(page.url(), `Expected landed URL to match /login-eras/, got ${page.url()}`).toMatch(
      /\/login-eras\/$/,
    );
    await expect(page.locator('#login')).toBeVisible();
  });
});
