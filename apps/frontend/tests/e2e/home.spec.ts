import type { Locator, Page } from '@playwright/test';
import { expect, expectNoDuplicateIds, KNOWN_ABSENT_CSS_ASSETS, STAGING, test } from './fixtures';
import { homePages } from '../../src/data/pages/home';
import { partners } from '../../src/data/partners';
import { posts } from '../../src/data/posts';
import { testimonials } from '../../src/data/testimonials';
import { assets } from '../../src/data/assets';
import { brandingServices } from '../../src/data/services/branding';
import { emailServices } from '../../src/data/services/email';
import { mobileServices } from '../../src/data/services/mobile';
import { seoServices } from '../../src/data/services/seo';
import { storageServices } from '../../src/data/services/storage';
import { websiteServices } from '../../src/data/services/website';
import { resolveRoute } from '../../src/lib/queries/site';

const HOME_SERVICES = [
  ...websiteServices,
  ...mobileServices,
  ...seoServices,
  ...brandingServices,
  ...storageServices,
  ...emailServices,
];

const WIDTHS = [390, 549, 550, 575, 768, 849, 850, 1199, 1280, 1380, 1440];
const STAT_VALUES = ['3500', '1500', '40', '09'];

const HOME_COPY = {
  '/': {
    lines: ['Thấu hiểu, đồng hành', 'và thiết kế trải nghiệm', 'digital toàn diện'],
    cta: { label: 'Về chúng tôi →', href: '/gioi-thieu/' },
    statsTitle: 'Thành tựu chúng tôi đạt được',
    labels: ['Khách hàng hài lòng', 'Dự án hoàn thành', 'Thành viên', 'Năm kinh nghiệm'],
  },
  '/en/home/': {
    lines: ['From Understanding', 'to Innovation', 'We Craft Digital Excellence'],
    cta: { label: 'About us →', href: '/en/about-us/' },
    statsTitle: 'Our Achievements',
    labels: ['Satisfied Clients', 'Projects Completed', 'Team members', 'Years of experience'],
  },
} as const;

/** Records every text a .count-up span shows, from first parse on. */
async function recordCountUps(page: Page) {
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __countUps: string[] }).__countUps = seen;
    new MutationObserver((records) => {
      for (const record of records) {
        const node = record.target;
        const el = (node instanceof Element ? node : node.parentElement)?.closest('.count-up');
        if (el) seen.push(el.textContent ?? '');
      }
    }).observe(document, { subtree: true, childList: true, characterData: true });
  });
}

const countUpTexts = (page: Page) =>
  page.evaluate(() => (window as unknown as { __countUps: string[] }).__countUps.slice());

test.describe('Home query, hero and stats', () => {
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
    page.on('response', (res) => {
      if (res.status() !== 404) return;
      const url = new URL(res.url());
      if (
        url.pathname.startsWith('/dev-fixtures/') ||
        url.pathname === '/fixture.png' ||
        KNOWN_ABSENT_CSS_ASSETS.has(url.pathname) ||
        url.searchParams.has('_rsc')
      )
        return;
      consoleErrors.push(`404 ${res.url()}`);
    });
    (page as unknown as { __consoleErrors: string[] }).__consoleErrors = consoleErrors;
  });

  test.afterEach(async ({ page }) => {
    const errors = (page as unknown as { __consoleErrors?: string[] }).__consoleErrors ?? [];
    expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
  });

  test('Video banner attributes, single H1, and no duplicate IDs on VI and EN home routes', async ({
    page,
  }) => {
    for (const path of ['/', '/en/home/']) {
      await page.goto(path);

      const video = page.locator('video.video-bg');
      await expect(video).toBeVisible();
      await expect(video).toHaveAttribute('autoplay', '');
      await expect(video).toHaveAttribute('muted', '');
      await expect(video).toHaveAttribute('loop', '');
      await expect(video).toHaveAttribute('playsinline', '');
      await expect(video).toHaveAttribute('preload', /auto|metadata/);
      await expect(video.locator('source')).toHaveAttribute('src', /video-banner-2\.mp4/);

      const h1s = page.locator('main h1');
      await expect(h1s).toHaveCount(1);

      await expectNoDuplicateIds(page);
    }
  });

  test('Hero heading, CTA and stats copy come from the locale record', async ({ page }) => {
    for (const [path, copy] of Object.entries(HOME_COPY)) {
      await page.goto(path);

      await expect(page.locator('main h1 .typewriter')).toHaveText([...copy.lines]);
      const cta = page.locator('.link_banner a.home-hero-cta');
      await expect(cta).toHaveText(copy.cta.label);
      await expect(cta).toHaveAttribute('href', copy.cta.href);

      const stats = page.locator('.col-thanhtuu');
      await expect(stats.locator('h2')).toHaveText(copy.statsTitle);
      await expect(stats.locator('.row-num')).toHaveCount(4);
      for (const [idx, label] of copy.labels.entries()) {
        const row = stats.locator('.row-num').nth(idx);
        await expect(row).toContainText(label);
        await expect(row).toContainText('+');
      }
    }
  });

  test('With JS, stats count up once on first intersection and end on server values', async ({
    page,
  }) => {
    await recordCountUps(page);
    await page.goto('/');
    const countUps = page.locator('.col-thanhtuu span.count-up');

    await countUps.first().scrollIntoViewIfNeeded();
    await expect(countUps).toHaveText(STAT_VALUES);
    const firstRun = await countUpTexts(page);
    expect(firstRun.some((text) => !STAT_VALUES.includes(text))).toBe(true);

    await page.evaluate(() => {
      (window as unknown as { __countUps: string[] }).__countUps.length = 0;
      window.scrollTo(0, 0);
    });
    await countUps.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    expect(await countUpTexts(page)).toEqual([]);
    await expect(countUps).toHaveText(STAT_VALUES);
  });

  test('Under reduced motion, stats keep their server values', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await recordCountUps(page);
    await page.goto('/');
    const countUps = page.locator('.col-thanhtuu span.count-up');

    await countUps.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(countUps).toHaveText(STAT_VALUES);
    expect((await countUpTexts(page)).every((text) => STAT_VALUES.includes(text))).toBe(true);
  });

  for (const width of WIDTHS) {
    test(`Typewriter lines are not clipped at width ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const path of ['/', '/en/home/']) {
        await page.goto(path);

        await page.evaluate(() => {
          document.querySelectorAll('h1 .typewriter').forEach((el) => {
            el.getAnimations().forEach((anim) => {
              try {
                anim.finish();
              } catch {
                // ignore infinite animations
              }
            });
          });
        });

        const lines = page.locator('h1 .typewriter');
        await expect(lines).toHaveCount(3);

        const clipping = await page.evaluate(() => {
          const spans = Array.from(document.querySelectorAll('h1 .typewriter'));
          return spans.map((span) => ({
            text: span.textContent,
            scrollWidth: span.scrollWidth,
            clientWidth: span.clientWidth,
            isClipped: span.scrollWidth > span.clientWidth,
          }));
        });

        for (const line of clipping) {
          expect(
            line.isClipped,
            `Line "${line.text}" is clipped at ${width}px on ${path}: scrollWidth (${line.scrollWidth}) > clientWidth (${line.clientWidth})`,
          ).toBe(false);
        }
      }
    });
  }

  test('Given JS disabled, when Stats render, then four stats show their server values', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    for (const path of ['/', '/en/home/']) {
      await page.goto(path);
      const countUps = page.locator('.col-thanhtuu span.count-up');
      await expect(countUps).toHaveCount(4);
      const values = await countUps.allInnerTexts();
      expect(values).toEqual(STAT_VALUES);
    }

    await context.close();
  });

  test('Given the empty scenario, then only the shell renders', async ({ page }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    for (const url of ['/dev-fixtures/home/empty', '/dev-fixtures/home/empty?locale=en']) {
      await page.goto(url);
      await expect(page.locator('#header')).toBeVisible();
      await expect(page.locator('#footer')).toBeVisible();
      await expect(page.locator('.banner.has-video')).toHaveCount(0);
      await expect(page.locator('.col-thanhtuu')).toHaveCount(0);
      await expect(page.locator('main#main')).toBeEmpty();
    }
  });

  test('Given the error scenario, then the localized error renders with no error message or stack', async ({
    page,
  }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    for (const [url, expectedTitle] of [
      ['/dev-fixtures/home/error', 'Đã có lỗi xảy ra'],
      ['/dev-fixtures/home/error?locale=en', 'An error occurred'],
    ]) {
      await page.goto(url);
      const error = page.locator('.page-error-main');
      await expect(error.locator('h2')).toHaveText(expectedTitle);
      const text = await error.innerText();
      expect(text).not.toContain('Transport error');
      expect(text).not.toContain('Error:');
      expect(text).not.toContain('stack');

      // Retry re-runs the server render; the error repository still rejects.
      await error.getByRole('button').click();
      await expect(page.locator('.page-error-main h2')).toHaveText(expectedTitle);
    }

    // The thrown render is expected here: a 500 document/RSC response and React's redacted
    // Server Components error (#441). Anything else still fails afterEach.
    const errors = (page as unknown as { __consoleErrors: string[] }).__consoleErrors;
    const unexpected = errors.filter(
      (e) => !e.includes('status of 500') && !e.includes('react.dev/errors/441'),
    );
    errors.splice(0, errors.length, ...unexpected);
  });

  test('Six featured project cards render in placement order on VI, and none on EN', async ({
    page,
  }) => {
    await page.goto('/');
    const section = page.locator('.horizontal-scroll-section');
    await expect(section).toBeVisible();

    const items = section.locator('.scroll-item');
    await expect(items).toHaveCount(6);

    const expectedProjects = [
      {
        path: '/featured_item/cong-ty-co-phan-phat-trien-cong-nghe-thp/',
        title: 'Công ty Cổ phần Phát triển Công nghệ THP',
        category: 'Branding',
        image: 'blight-02',
      },
      {
        path: '/featured_item/flexius-cong-ty-co-phan-the-gioi-bang/',
        title: 'FLEXIUS – Công ty Cổ phần Thế Giới Bảng',
        category: 'Website',
        image: 'Flexius-01',
      },
      {
        path: '/featured_item/sencom-home-decor-lighting-design/',
        title: 'SENCOM – Home decor – Lighting – Design',
        category: 'Website',
        image: 'sencom-01',
      },
      {
        path: '/featured_item/so-y-te-benh-vien-mat-ha-giang/',
        title: 'Sở Y Tế Bệnh Viện Mắt Hà Giang',
        category: 'Website',
        image: 'benh-vien-mat-ha-giang-01-scaled-1',
      },
      {
        path: '/featured_item/cong-ty-tnhh-konnertec-viet-nam/',
        title: 'Công ty TNHH Konnertec Việt Nam',
        category: 'Website',
        image: 'konnertec-01',
      },
      {
        path: '/featured_item/cong-ty-co-phan-square-orange/',
        title: 'CÔNG TY CỔ PHẦN SQUARE ORANGE',
        category: 'Website',
        image: 'squareorange-01-min',
      },
    ];

    for (const [idx, expected] of expectedProjects.entries()) {
      const item = items.nth(idx);
      const link = item.locator('a.item-link');
      await expect(link).toHaveAttribute('href', expected.path);
      await expect(item.locator('.item-title')).toHaveText(expected.title);
      await expect(item.locator('.item-categories .item-term')).toHaveText(expected.category);
      const content = item.locator('.item-content');
      const bgStyle = await content.evaluate((el) => el.style.backgroundImage);
      expect(bgStyle).toContain(expected.image);
    }

    // On EN home, no .horizontal-scroll-section
    await page.goto('/en/home/');
    await expect(page.locator('.horizontal-scroll-section')).toHaveCount(0);
  });

  for (const width of [1440, 390]) {
    test(`Horizontal projects pin and scrub at width ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const section = page.locator('.horizontal-scroll-section');
      await expect(section).toBeVisible();

      const { startY, distance } = await page.evaluate(() => {
        const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
        const pinSpacer = document.querySelector('.pin-spacer') as HTMLElement;
        const sec = document.querySelector('.horizontal-scroll-section') as HTMLElement;
        const trigger = pinSpacer ?? sec;
        const rect = trigger.getBoundingClientRect();
        return {
          startY: window.scrollY + rect.top,
          distance: wrapper.scrollWidth - window.innerWidth,
        };
      });

      // Scroll to 50% of distance
      await page.evaluate((y) => window.scrollTo(0, y), startY + 0.5 * distance);
      await page.waitForTimeout(300);

      const halfData = await page.evaluate(() => {
        const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
        const pinSpacer = document.querySelector('.pin-spacer') as HTMLElement;
        const transform = window.getComputedStyle(wrapper).transform;
        const matrix = transform && transform !== 'none' ? new DOMMatrixReadOnly(transform) : null;
        return {
          hasPinSpacer: Boolean(pinSpacer),
          translateX: matrix ? matrix.m41 : 0,
        };
      });

      expect(halfData.hasPinSpacer).toBe(true);
      expect(Math.abs(halfData.translateX - (-0.5 * distance))).toBeLessThanOrEqual(25);

      // Scroll to end of distance
      await page.evaluate((y) => window.scrollTo(0, y), startY + distance);
      await page.waitForTimeout(300);

      const endData = await page.evaluate(() => {
        const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
        const transform = window.getComputedStyle(wrapper).transform;
        const matrix = transform && transform !== 'none' ? new DOMMatrixReadOnly(transform) : null;
        return {
          translateX: matrix ? matrix.m41 : 0,
        };
      });

      expect(Math.abs(endData.translateX - (-distance))).toBeLessThanOrEqual(25);
    });
  }

  test('Client navigation away from / removes .pin-spacer and cleans up ScrollTrigger', async ({
    page,
  }) => {
    await page.goto('/');
    const section = page.locator('.horizontal-scroll-section');
    await expect(section).toBeVisible();

    // Verify ScrollTrigger exists if test hook is available
    const initialTriggers = await page.evaluate(() => {
      const st = (window as unknown as { ScrollTrigger?: { getAll: () => unknown[] } })
        .ScrollTrigger;
      return st ? st.getAll().length : null;
    });
    if (initialTriggers !== null) {
      expect(initialTriggers).toBeGreaterThan(0);
    }

    // Client navigate away using the language switcher link (/en/home/)
    await page.locator('#header a[href="/en/home/"]').click();
    await page.waitForURL('**/en/home/**');

    // Verify no pin-spacer remains
    await expect(page.locator('.pin-spacer')).toHaveCount(0);

    // Verify ScrollTrigger.getAll().length === 0
    const liveTriggers = await page.evaluate(() => {
      const st = (window as unknown as { ScrollTrigger?: { getAll: () => unknown[] } })
        .ScrollTrigger;
      return st ? st.getAll().length : 0;
    });
    expect(liveTriggers).toBe(0);
  });

  test('Under reduced motion, pin and translation still occur and hover leaves scale at 1', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const section = page.locator('.horizontal-scroll-section');
    await expect(section).toBeVisible();

    const { startY, distance } = await page.evaluate(() => {
      const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
      const pinSpacer = document.querySelector('.pin-spacer') as HTMLElement;
      const sec = document.querySelector('.horizontal-scroll-section') as HTMLElement;
      const trigger = pinSpacer ?? sec;
      const rect = trigger.getBoundingClientRect();
      return {
        startY: window.scrollY + rect.top,
        distance: wrapper.scrollWidth - window.innerWidth,
      };
    });

    // Hover over first card while at start (inside viewport)
    await page.evaluate((y) => window.scrollTo(0, y), startY);
    await page.waitForTimeout(300);
    const firstCard = page.locator('.scroll-item').first();
    await firstCard.hover();
    await page.waitForTimeout(350);

    const scale = await firstCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const transform = style.transform;
      if (!transform || transform === 'none') return 1;
      const matrix = new DOMMatrixReadOnly(transform);
      return matrix.a; // matrix.a is scaleX
    });

    expect(scale).toBe(1);

    // Scroll to 50%
    await page.evaluate((y) => window.scrollTo(0, y), startY + 0.5 * distance);
    await page.waitForTimeout(300);

    const halfData = await page.evaluate(() => {
      const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
      const pinSpacer = document.querySelector('.pin-spacer') as HTMLElement;
      const transform = window.getComputedStyle(wrapper).transform;
      const matrix = transform && transform !== 'none' ? new DOMMatrixReadOnly(transform) : null;
      return {
        hasPinSpacer: Boolean(pinSpacer),
        translateX: matrix ? matrix.m41 : 0,
      };
    });

    expect(halfData.hasPinSpacer).toBe(true);
    expect(Math.abs(halfData.translateX - (-0.5 * distance))).toBeLessThanOrEqual(25);
  });

  test('Hover over card scales up to 1.05 under normal motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');

    const firstCard = page.locator('.scroll-item').first();
    await firstCard.scrollIntoViewIfNeeded();
    await firstCard.hover();
    await page.waitForTimeout(400);

    const scale = await firstCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const transform = style.transform;
      if (!transform || transform === 'none') return 1;
      const matrix = new DOMMatrixReadOnly(transform);
      return Math.round(matrix.a * 100) / 100;
    });

    expect(scale).toBe(1.05);
  });
});

test.describe('Services list, accordion and marquee', () => {
  test('Six services and accordion items render in order with matching titles, summaries and arrow hrefs', async ({
    page,
  }) => {
    for (const [path, locale, expectedArrow2, expectedTitle2] of [
      ['/', 'vi', '/thiet-ke-app-mobile/', 'Thiết kế App Mobile'],
      ['/en/home/', 'en', '/en/website-development/', 'App Mobile Development'],
    ] as const) {
      await page.goto(path);
      const home = homePages.find((p) => p.locale === locale)!;
      const expected = home.serviceIds.map((id) => HOME_SERVICES.find((s) => s.id === id)!);

      const section = page.locator('section', { has: page.locator('.dich_vu') });
      await expect(section.locator('.tt_dvu p')).toHaveText(home.sectionCopy.services.eyebrow!);
      await expect(section.locator('h2')).toHaveText(home.sectionCopy.services.title);

      const desktopCards = page.locator('.hide-for-small .dich_vu');
      await expect(desktopCards).toHaveCount(6);

      const accordionItems = page.locator('.show-for-small .accordion-item');
      await expect(accordionItems).toHaveCount(6);

      // Verify card 2 arrow href (source anomaly parity for EN)
      const desktopCard2Arrow = desktopCards.nth(1).locator('.nut_xthem a');
      await expect(desktopCard2Arrow).toHaveAttribute('href', expectedArrow2);

      const accordionItem2Arrow = accordionItems.nth(1).locator('.nut_xthem a');
      await expect(accordionItem2Arrow).toHaveAttribute('href', expectedArrow2);

      // EN card 2 is the mobile service even though its arrow points at the website page.
      await expect(accordionItems.nth(1).locator('.acc-title')).toHaveText(expectedTitle2);

      // Titles, summaries and arrows follow serviceIds order in both views.
      for (let i = 0; i < 6; i++) {
        await expect(desktopCards.nth(i).locator('.name_dv')).toContainText(expected[i].title);
        await expect(desktopCards.nth(i).locator('.mta_dv')).toHaveText(expected[i].homeSummary);
        await expect(desktopCards.nth(i).locator('.nut_xthem a')).toHaveAttribute(
          'href',
          expected[i].arrowHref,
        );
        await expect(accordionItems.nth(i).locator('.acc-title')).toHaveText(expected[i].title);
        await expect(accordionItems.nth(i).locator('.mta_dv')).toHaveText(expected[i].homeSummary);
        await expect(accordionItems.nth(i).locator('.nut_xthem a')).toHaveAttribute(
          'href',
          expected[i].arrowHref,
        );
      }

      // Verify desktop titles match accordion titles
      for (let i = 0; i < 6; i++) {
        const desktopNum = desktopCards.nth(i).locator('.num_dv span');
        const expectedNum = String(i + 1).padStart(2, '0');
        await expect(desktopNum).toHaveText(expectedNum);

        const accNum = accordionItems.nth(i).locator('.acc-num');
        await expect(accNum).toHaveText(`${expectedNum}/`);

        const accTitle = await accordionItems.nth(i).locator('.acc-title').innerText();
        const desktopCard = desktopCards.nth(i);
        await expect(desktopCard.locator('.name_dv')).toContainText(accTitle);

        const accSummary = await accordionItems.nth(i).locator('.mta_dv').innerText();
        await expect(desktopCard.locator('.mta_dv')).toHaveText(accSummary);
      }

      // Check last item has dich_vu_last
      await expect(desktopCards.nth(5)).toHaveClass(/dich_vu_last/);
      await expect(accordionItems.nth(5)).toHaveClass(/dich_vu_last/);

      await expectNoDuplicateIds(page);
    }
  });

  test('VI item 5 renders sub-services Business Hosting and Cloud VPS', async ({ page }) => {
    await page.goto('/');

    const desktopSubServices = page.locator('.hide-for-small .dich_vu').nth(4).locator('.name_dv span a');
    await expect(desktopSubServices).toHaveCount(2);
    await expect(desktopSubServices.nth(0)).toHaveText('Business Hosting');
    await expect(desktopSubServices.nth(0)).toHaveAttribute('href', '/hosting-doanh-nghiep/');
    await expect(desktopSubServices.nth(1)).toHaveText('Cloud VPS');
    await expect(desktopSubServices.nth(1)).toHaveAttribute('href', '/vps-doanh-nghiep/');

    const accSubServices = page.locator('.show-for-small .accordion-item').nth(4).locator('.dv-con a');
    await expect(accSubServices).toHaveCount(2);
    await expect(accSubServices.nth(0)).toHaveText('Business Hosting');
    await expect(accSubServices.nth(0)).toHaveAttribute('href', '/hosting-doanh-nghiep/');
    await expect(accSubServices.nth(1)).toHaveText('Cloud VPS');
    await expect(accSubServices.nth(1)).toHaveAttribute('href', '/vps-doanh-nghiep/');
  });

  test('Responsive visibility: accordion visible only at 549px, list visible at 550, 849, 850px', async ({
    page,
  }) => {
    await page.goto('/');

    // 549px
    await page.setViewportSize({ width: 549, height: 900 });
    await expect(page.locator('.text.show-for-small .acc_dvu')).toBeVisible();
    await expect(page.locator('.text.hide-for-small .dich_vu').first()).toBeHidden();

    // 550px
    await page.setViewportSize({ width: 550, height: 900 });
    await expect(page.locator('.text.show-for-small .acc_dvu')).toBeHidden();
    await expect(page.locator('.text.hide-for-small .dich_vu').first()).toBeVisible();

    // 849px
    await page.setViewportSize({ width: 849, height: 900 });
    await expect(page.locator('.text.show-for-small .acc_dvu')).toBeHidden();
    await expect(page.locator('.text.hide-for-small .dich_vu').first()).toBeVisible();

    // 850px
    await page.setViewportSize({ width: 850, height: 900 });
    await expect(page.locator('.text.show-for-small .acc_dvu')).toBeHidden();
    await expect(page.locator('.text.hide-for-small .dich_vu').first()).toBeVisible();
  });

  test('Accordion keyboard interaction: Enter toggles item 2 and closes item 1; Space closes item 2', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 500, height: 900 });
    await page.goto('/');

    const trigger1 = page.locator('.acc_dvu button.accordion-title').nth(0);
    const trigger2 = page.locator('.acc_dvu button.accordion-title').nth(1);
    const panel1 = page.locator('.acc_dvu .accordion-inner').nth(0);
    const panel2 = page.locator('.acc_dvu .accordion-inner').nth(1);

    // Initial state: item 1 open, item 2 closed
    await expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger2).toHaveAttribute('aria-expanded', 'false');
    await expect(panel1).toBeVisible();
    await expect(panel2).toBeHidden();

    // Focus trigger 2 and press Enter
    await trigger2.focus();
    await page.keyboard.press('Enter');

    // Item 2 opens, item 1 closes
    await expect(trigger1).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    await expect(panel1).toBeHidden();
    await expect(panel2).toBeVisible();

    // Press Space on trigger 2 -> closes it
    await page.keyboard.press('Space');

    // Item 2 closes
    await expect(trigger2).toHaveAttribute('aria-expanded', 'false');
    await expect(panel2).toBeHidden();
  });

  const MARQUEE_SIZES = [
    { width: 575, expected: '74px' },
    { width: 1199, expected: '80px' },
    { width: 1380, expected: '100px' },
    { width: 1440, expected: '160px' },
  ];

  for (const { width, expected } of MARQUEE_SIZES) {
    test(`Marquee font-size is ${expected} at ${width}px; two tracks, second aria-hidden`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const wrap = page.locator('.cs-moving_text_wrap');
      await expect(wrap).toBeVisible();

      const fontSize = await wrap.evaluate((el) => window.getComputedStyle(el).fontSize);
      expect(fontSize).toBe(expected);

      const tracks = wrap.locator('.cs-moving_text');
      await expect(tracks).toHaveCount(2);
      await expect(tracks.nth(0)).not.toHaveAttribute('aria-hidden');
      await expect(tracks.nth(1)).toHaveAttribute('aria-hidden', 'true');

      const separators = tracks.nth(0).locator('img');
      await expect(separators).toHaveCount(homePages[0].marqueeText.length);
      await expect(separators.first()).toHaveAttribute(
        'src',
        '/wp-content/uploads/2024/02/Ellipse-2351.svg',
      );
      await expect(separators.first()).toHaveAttribute('alt', '');
    });
  }

  for (const { path, locale } of [
    { path: '/', locale: 'vi' },
    { path: '/en/home/', locale: 'en' },
  ] as const) {
    test(`Marquee renders ${locale} marqueeText in order`, async ({ page }) => {
      const record = homePages.find((p) => p.locale === locale)!;
      expect(record.marqueeText.length).toBeGreaterThan(0);
      await page.goto(path);

      const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const inOrder = new RegExp(record.marqueeText.map(escape).join('[\\s\\S]*'));
      const tracks = page.locator('.cs-moving_text_wrap .cs-moving_text');
      await expect(tracks.nth(0)).toHaveText(inOrder);
      await expect(tracks.nth(1)).toHaveText(inOrder);
      await expect(tracks.nth(0).locator('img')).toHaveCount(record.marqueeText.length);
    });
  }

  test('Marquee pauses under prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const states = await page
      .locator('.cs-moving_text')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationPlayState));
    expect(states).toEqual(['paused', 'paused']);

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const running = await page
      .locator('.cs-moving_text')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationPlayState));
    expect(running).toEqual(['running', 'running']);
  });
});

test.describe('Partner logo grid', () => {
  const partnerMap = new Map(partners.map((p) => [p.id, p]));
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const getExpectedLogoSrcs = (localeIndex: number) => {
    return homePages[localeIndex].partnerPlacements.map((placement) => {
      const partner = partnerMap.get(placement.entityId);
      if (!partner) throw new Error(`Partner not found: ${placement.entityId}`);
      const asset = assetMap.get(partner.logoId);
      if (!asset) throw new Error(`Asset not found: ${partner.logoId}`);
      return asset.src;
    });
  };

  test('VI and EN routes render 30 partner logos in placement order, all decorative (alt=""), no accessible names, and no duplicate IDs', async ({
    page,
  }) => {
    const cases = [
      { path: '/', localeIndex: 0, eyebrowId: '#text-2149017180', titleId: '#text-1007250049' },
      { path: '/en/home/', localeIndex: 1, eyebrowId: '#text-3114286333', titleId: '#text-3018448185' },
    ];

    for (const { path, localeIndex, eyebrowId, titleId } of cases) {
      await page.goto(path);

      // Section headings
      const copy = homePages[localeIndex].sectionCopy.partners;
      await expect(page.locator(`${eyebrowId} h4`)).toHaveText(copy.eyebrow!);
      await expect(page.locator(`${titleId} h2`)).toHaveText(copy.title);

      // 30 logos in placement order
      const logos = page.locator('.row.gal-doitac img.gal-doitac');
      await expect(logos).toHaveCount(30);

      const expectedSrcs = getExpectedLogoSrcs(localeIndex);
      for (let i = 0; i < 30; i++) {
        await expect(logos.nth(i)).toHaveAttribute('src', expectedSrcs[i]);
        await expect(logos.nth(i)).toHaveAttribute('alt', '');
        await expect(logos.nth(i)).toHaveAttribute('decoding', 'async');
      }

      // First VI logo is logo-wisdomland.png
      if (localeIndex === 0) {
        await expect(logos.first()).toHaveAttribute('src', /logo-wisdomland\.png/);
      }

      // No anchor / lightbox in grid
      await expect(page.locator('.row.gal-doitac a')).toHaveCount(0);

      // Logos are decorative: none has an accessible name
      const accessibleNames = await page.locator('.row.gal-doitac img, .row.gal-doitac a').evaluateAll(
        (elements) =>
          elements.map(
            (el) =>
              (el as HTMLElement).innerText ||
              el.getAttribute('aria-label') ||
              el.getAttribute('alt') ||
              '',
          ),
      );
      expect(accessibleNames.every((name) => name === '')).toBe(true);

      // Partner names never reach the DOM
      const partnerNames = homePages[localeIndex].partnerPlacements.map(
        (p) => partnerMap.get(p.entityId)!.name,
      );
      const pageText = await page.locator('.row-doitac').innerText();
      for (const name of partnerNames) {
        expect(pageText).not.toContain(name);
      }

      await expectNoDuplicateIds(page);
    }
  });

  const RESPONSIVE_COUNTS = [
    { width: 549, expectedCount: 3 },
    { width: 550, expectedCount: 3 },
    { width: 849, expectedCount: 3 },
    { width: 850, expectedCount: 6 },
  ];

  for (const { width, expectedCount } of RESPONSIVE_COUNTS) {
    test(`Partner grid renders ${expectedCount} logos per row at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const cols = page.locator('.row.gal-doitac .gallery-col');
      await expect(cols).toHaveCount(30);

      const firstRowCols = await cols.evaluateAll((elements) => {
        const htmlElements = elements as HTMLElement[];
        const top = htmlElements[0].offsetTop;
        return htmlElements.filter((el) => Math.abs(el.offsetTop - top) < 2).length;
      });
      expect(firstRowCols).toBe(expectedCount);
    });
  }

  test('Empty dev-fixture scenario renders no .row-doitac, partners section, or trailing gap', async ({
    page,
  }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    for (const url of ['/dev-fixtures/home/empty', '/dev-fixtures/home/empty?locale=en']) {
      await page.goto(url);
      await expect(page.locator('.row-doitac')).toHaveCount(0);
      await expect(page.locator('#section_62935602')).toHaveCount(0);
      await expect(page.locator('#section_841675174')).toHaveCount(0);
      await expect(page.locator('#gap-1743500161')).toHaveCount(0);
      await expect(page.locator('#gap-974238391')).toHaveCount(0);
      await expect(page.locator('#section_1900032435')).toHaveCount(0);
      await expect(page.locator('#section_1228410742')).toHaveCount(0);
    }
  });
});

function selectedSlide(slides: Locator) {
  return slides.evaluateAll((els) => els.findIndex((e) => e.classList.contains('is-selected')));
}

async function tickSlide(page: Page, slides: Locator, ms: number) {
  await page.clock.runFor(ms);
  await page.waitForTimeout(50);
  return selectedSlide(slides);
}

async function openPausedHome(page: Page, url = '/') {
  await page.clock.install();
  await page.goto(url);
  const slider = page.locator('#slider-1717467276');
  await slider.scrollIntoViewIfNeeded();
  await expect(slider.locator('.flickity-slider').first()).toHaveAttribute('style', /translate/);
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 500));
}

test.describe('Testimonials section', () => {
  const testimonialMap = new Map(testimonials.map((t) => [`${t.locale}:${t.id}`, t]));
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  test('Testimonials section markup, classes, placements and copy on VI and EN home routes', async ({
    page,
  }) => {
    const cases = [
      {
        path: '/',
        sectionId: '#section_1900032435',
        sliderId: '#slider-1717467276',
        locale: 'vi' as const,
        localeIndex: 0,
        expectedEyebrow: 'Sova',
        expectedTitle: 'Khách hàng nhận xét về chúng tôi',
        slideIds: ['row-14011233', 'row-693377910', 'row-2021009934'],
      },
      {
        path: '/en/home/',
        sectionId: '#section_1228410742',
        sliderId: '#slider-283546209',
        locale: 'en' as const,
        localeIndex: 1,
        expectedEyebrow: 'Sova',
        expectedTitle: 'Customer Reviews',
        slideIds: ['row-1450896083', 'row-1154937134', 'row-1376163772'],
      },
    ];

    for (const c of cases) {
      await page.goto(c.path);

      const section = page.locator(c.sectionId);
      await expect(section).toBeVisible();
      await expect(section).toHaveClass(/ss-kh/);

      // Section copy
      const copy = homePages[c.localeIndex].sectionCopy.testimonials;
      if (copy.eyebrow) {
        await expect(section.locator('.col-inner h4 strong').first()).toHaveText(copy.eyebrow);
      }
      await expect(section.locator('.col-inner h2').first()).toHaveText(copy.title);
      await expect(section.locator('.col-inner h2').first().locator('br')).toHaveCount(
        (copy.titleLines?.length ?? 1) - 1,
      );

      // Decorative art resolved from the record's asset ids
      const art = homePages[c.localeIndex].testimonialArtIds;
      const artSrc = (id: string) => assetMap.get(id)!.src;
      await expect(section.locator('.img-inner img')).toHaveAttribute('src', artSrc(art.photoId));
      await expect(section.locator(`p:has(+ ${c.sliderId}) img`)).toHaveAttribute(
        'src',
        artSrc(art.quoteIconId),
      );

      // 3 cards in placement order
      const homeRecord = homePages[c.localeIndex];
      const placements = homeRecord.testimonialPlacements;
      const slides = section.locator(`${c.sliderId} .flickity-slider > .row`);
      await expect(slides).toHaveCount(3);

      for (let i = 0; i < placements.length; i++) {
        const item = testimonialMap.get(`${c.locale}:${placements[i].entityId}`)!;
        const slide = slides.nth(i);
        await expect(slide).toHaveAttribute('id', c.slideIds[i]);
        await expect(slide.locator('.nd-kh')).toHaveText(item.quote.html);
        await expect(slide.locator('.nd-kh + .text img')).toHaveAttribute('src', artSrc(art.lineId));
        await expect(slide.locator('.icon-box h3 strong')).toHaveText(item.person);
        await expect(slide.locator('.icon-box p')).toHaveText(item.role!);
        await expect(slide.locator('.icon-box-img img')).toHaveAttribute(
          'src',
          assetMap.get(item.avatarId!)!.src,
        );
      }

      await expectNoDuplicateIds(page);
    }
  });

  test('Autoplay advances every 6000ms, pauses on hover, and resumes after leave', async ({ page }) => {
    await openPausedHome(page, '/');
    const slider = '#slider-1717467276';
    const slides = page.locator(`${slider} .flickity-slider > *`);
    await expect(slides).toHaveCount(3);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Hover pauses
    await page.locator(`${slider} .flickity-prev-next-button.next`).hover();
    expect(await tickSlide(page, slides, 12000)).toBe(0);

    // Mouse leave resumes and advances every 6000ms
    await page.mouse.move(10, 10);
    expect(await tickSlide(page, slides, 5500)).toBe(0);
    expect(await tickSlide(page, slides, 600)).toBe(1);

    // Next slide advances at 6000ms
    expect(await tickSlide(page, slides, 5500)).toBe(1);
    expect(await tickSlide(page, slides, 600)).toBe(2);
  });

  test('Controls: clicking next, prev, or dot navigates to matching cell', async ({ page }) => {
    await openPausedHome(page, '/');
    const slider = '#slider-1717467276';
    const slides = page.locator(`${slider} .flickity-slider > *`);
    const region = page.getByRole('region', { name: 'Khách hàng nhận xét về chúng tôi' });
    const prevBtn = region.getByRole('button', { name: 'Trước' });
    const nextBtn = region.getByRole('button', { name: 'Tiếp theo' });

    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await nextBtn.click();
    await expect(slides.nth(1)).toHaveClass(/is-selected/);
    await prevBtn.click();
    await expect(slides.nth(0)).toHaveClass(/is-selected/);
    await region.getByRole('button', { name: 'Chuyển tới slide 3' }).click();
    await expect(slides.nth(2)).toHaveClass(/is-selected/);
  });

  test('Drag: 5px does not advance; full drag advances', async ({ page }) => {
    // Flowing clock for drag release
    await page.clock.install();
    await page.goto('/');
    const slider = '#slider-1717467276';
    const viewport = page.locator(`${slider} .flickity-viewport`);
    await viewport.scrollIntoViewIfNeeded();
    const slides = page.locator(`${slider} .flickity-slider > *`);
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    const box = (await viewport.boundingBox())!;
    const startX = box.x + box.width * 0.4;
    const startY = box.y + box.height / 2;

    // 5px under dragThreshold:10
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 5, startY, { steps: 5 });
    await page.mouse.up();
    await expect(slides.nth(0)).toHaveClass(/is-selected/);

    // Full drag past threshold
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - Math.round(box.width * 0.35), startY, { steps: 15 });
    await page.mouse.up();
    await expect(slides.nth(1)).toHaveClass(/is-selected/);
  });

  test('Adaptive height at 390px width follows selected cell', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openPausedHome(page, '/');
    const slider = '#slider-1717467276';
    const slides = page.locator(`${slider} .flickity-slider > *`);
    const viewport = page.locator(`${slider} .flickity-viewport`);
    const region = page.getByRole('region', { name: 'Khách hàng nhận xét về chúng tôi' });

    for (let i = 0; i < 3; i++) {
      await region.getByRole('button', { name: `Chuyển tới slide ${i + 1}` }).click();
      await expect(slides.nth(i)).toHaveClass(/is-selected/);
      await page.clock.runFor(1000);
      const cell = (await slides.nth(i).boundingBox())!.height;
      await expect.poll(async () => (await viewport.boundingBox())!.height).toBeCloseTo(cell, 0);
    }
  });
});

test.describe('Latest posts', () => {
  const postMap = new Map(posts.map((p) => [p.id, p]));

  test('Grid holds 3 a.plain links matching placement posts, routes return 200, no duplicate IDs', async ({
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

    const hrefs = await links.evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')),
    );
    expect(hrefs).toEqual(expectedPlacementPaths);

    for (const href of hrefs) {
      if (href) {
        const resolved = await resolveRoute(href);
        expect(resolved).not.toBeNull();
        expect(resolved?.route.kind).toBe('post-detail');
        if (STAGING) {
          const res = await page.request.get(href);
          expect(res.status()).toBe(200);
        }
      }
    }

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
    test(`Slider is visible, grid is hidden, arrows and 3 dots show, no autoplay at ${width}px, wrapping works`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const grid = page.locator('#text-386464690');
      const slider = page.locator('#text-1494522260');

      await expect(grid).toBeHidden();
      await expect(slider).toBeVisible();

      const prevBtn = slider.locator('.flickity-prev-next-button.previous');
      const nextBtn = slider.locator('.flickity-prev-next-button.next');
      await expect(prevBtn).toBeAttached();
      await expect(nextBtn).toBeAttached();

      const dots = slider.locator('.flickity-page-dots .dot');
      await expect(dots).toHaveCount(3);
      await expect(dots.nth(0)).toHaveClass(/is-selected/);

      // After 7s with no input, selected dot is unchanged (no autoplay)
      await page.waitForTimeout(7000);
      await expect(dots.nth(0)).toHaveClass(/is-selected/);

      // Clicking next from the last slide wraps to the first
      await nextBtn.dispatchEvent('click');
      await expect(dots.nth(1)).toHaveClass(/is-selected/);
      await nextBtn.dispatchEvent('click');
      await expect(dots.nth(2)).toHaveClass(/is-selected/);
      await nextBtn.dispatchEvent('click');
      await expect(dots.nth(0)).toHaveClass(/is-selected/);
    });
  }

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


