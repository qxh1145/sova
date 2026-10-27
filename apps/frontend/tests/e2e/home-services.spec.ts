import { expect, expectNoDuplicateIds, test } from './fixtures';
import { homePages } from '../../src/data/pages/home';
import { brandingServices } from '../../src/data/services/branding';
import { mobileServices } from '../../src/data/services/mobile';
import { seoServices } from '../../src/data/services/seo';
import { websiteServices } from '../../src/data/services/website';

const HOME_SERVICES = [...websiteServices, ...mobileServices, ...seoServices, ...brandingServices];

test.describe('Services list, accordion and marquee', () => {
  test('Home accordion button matches source anchor metrics at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/');
    const metrics = await page
      .locator('#text-2320367842 .accordion-title')
      .first()
      .evaluate((el) => {
        const css = getComputedStyle(el);
        return [
          css.fontSize,
          css.fontWeight,
          css.lineHeight,
          css.letterSpacing,
          css.padding,
          css.margin,
          css.minHeight,
          css.textTransform,
        ];
      });
    expect(metrics).toEqual([
      '16px',
      '600',
      '25.6px',
      'normal',
      '9.6px 15px 0px',
      '0px',
      '0px',
      'none',
    ]);
  });

  test('Four services and accordion items render in order with matching titles, summaries and arrow hrefs', async ({
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
      await expect(desktopCards).toHaveCount(4);

      const accordionItems = page.locator('.show-for-small .accordion-item');
      await expect(accordionItems).toHaveCount(4);

      // Verify card 2 arrow href (source anomaly parity for EN)
      const desktopCard2Arrow = desktopCards.nth(1).locator('.nut_xthem a');
      await expect(desktopCard2Arrow).toHaveAttribute('href', expectedArrow2);

      const accordionItem2Arrow = accordionItems.nth(1).locator('.nut_xthem a');
      await expect(accordionItem2Arrow).toHaveAttribute('href', expectedArrow2);

      // EN card 2 is the mobile service even though its arrow points at the website page.
      await expect(accordionItems.nth(1).locator('.acc-title')).toHaveText(expectedTitle2);

      // Titles, summaries and arrows follow serviceIds order in both views.
      for (let i = 0; i < 4; i++) {
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
      for (let i = 0; i < 4; i++) {
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
      await expect(desktopCards.nth(3)).toHaveClass(/dich_vu_last/);
      await expect(accordionItems.nth(3)).toHaveClass(/dich_vu_last/);

      await expectNoDuplicateIds(page);
    }
  });

  test('Hidden storage, e-mail, hosting and VPS services are absent from the home list and accordion', async ({
    page,
  }) => {
    const hiddenLinks = ['luu-tru', 'storage-solution', 'e-mail', 'hosting', 'vps']
      .map((slug) => `a[href*="${slug}"]`)
      .join(', ');
    for (const path of ['/', '/en/home/']) {
      await page.goto(path);
      await expect(page.locator('.dich_vu, .acc_dvu').locator(hiddenLinks)).toHaveCount(0);
    }
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
