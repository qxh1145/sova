import { expect, expectNoDuplicateIds, STAGING, test } from './fixtures';

const WIDTHS = [390, 549, 550, 575, 768, 849, 850, 1199, 1280, 1380, 1440];

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
      await expect(video).toHaveAttribute('src', /video-banner-2\.mp4/);

      const h1s = page.locator('main h1');
      await expect(h1s).toHaveCount(1);

      await expectNoDuplicateIds(page);
    }
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
      expect(values).toEqual(['3500', '1500', '40', '09']);
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
      await expect(page.locator('.home-error-main h2')).toHaveText(expectedTitle);
      const text = await page.locator('.home-error-main').innerText();
      expect(text).not.toContain('Transport error');
      expect(text).not.toContain('Error:');
      expect(text).not.toContain('stack');
    }
  });
});
