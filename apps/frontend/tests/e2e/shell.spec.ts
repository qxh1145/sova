import { expect, test } from './fixtures';

test.describe('Site shell and primitives', () => {
  test('VI root renders one shell with VI labels and switcher linking to EN', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.locator('#header')).toHaveCount(1);
    await expect(page.locator('#footer')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');

    // Switcher
    const switcher = page.locator('.lang-switcher-inline');
    await expect(switcher.locator('.current-lang')).toHaveText('VI');
    const enLink = switcher.locator('a');
    await expect(enLink).toHaveText('EN');
    await expect(enLink).toHaveAttribute('href', '/en/home/');

    // Header CTA
    const headerCtaVi = page.locator('#masthead .header-button-1 a');
    await expect(headerCtaVi.first()).toBeVisible();
    await expect(headerCtaVi.first()).toHaveAttribute('href', '/lien-he/');
    await expect(headerCtaVi.first()).toHaveText('Liên hệ');

    // Logo wordmark (missing asset renders wordmark)
    await expect(page.locator('#logo .header-wordmark')).toHaveText('Sova');
    await expect(page.locator('#logo img')).toHaveCount(0);

    // Footer CTA
    const footerCta = page.locator('footer#footer section.ss-last');
    await expect(footerCta).toBeVisible();
    await expect(footerCta.locator('h1 a')).toHaveAttribute('href', '/lien-he/');
    await expect(footerCta.locator('h1')).toContainText('Hiện thực hoá');
    await expect(footerCta.locator('h1')).toContainText('ý tưởng của bạn');

    // Footer company name and copyright
    await expect(page.locator('footer#footer h3').first()).toHaveText('Sova');
    await expect(page.locator('#text-1252042670')).toContainText('Copyright © 2026');
    await expect(page.locator('#text-1252042670 a')).toHaveText('Sova');
    await expect(page.locator('#text-1252042670')).toContainText('All Rights Reserved.');
    await expect(page.locator('.copyright-footer')).toHaveText(
      'Copyright 2026 © Flatsome Theme',
    );
  });

  test('EN root renders one shell with EN labels and switcher linking to VI', async ({
    page,
  }) => {
    await page.goto('/en/home/');

    await expect(page.locator('#header')).toHaveCount(1);
    await expect(page.locator('#footer')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');

    // Switcher
    const switcher = page.locator('.lang-switcher-inline');
    await expect(switcher.locator('.current-lang')).toHaveText('EN');
    const viLink = switcher.locator('a');
    await expect(viLink).toHaveText('VI');
    await expect(viLink).toHaveAttribute('href', '/');

    // Header CTA
    const headerCtaEn = page.locator('#masthead .header-button-2 a');
    await expect(headerCtaEn.first()).toBeVisible();
    await expect(headerCtaEn.first()).toHaveAttribute('href', '/en/contact-us/');
    await expect(headerCtaEn.first()).toHaveText('Contact Us');

    // Footer CTA
    const footerCta = page.locator('footer#footer section.ss-last');
    await expect(footerCta).toBeVisible();
    await expect(footerCta.locator('h1 a')).toHaveAttribute('href', '/en/contact-us/');
    await expect(footerCta.locator('h1')).toContainText(
      'Realize your amazing digital experience!',
    );
  });

  test('Switcher with no counterpart shows current-locale label only', async ({ page }) => {
    await page.goto('/dev-fixtures/shell/no-counterpart/');

    const switcher = page.locator('.lang-switcher-inline');
    await expect(switcher.locator('.current-lang')).toHaveText('VI');
    await expect(switcher.locator('a')).toHaveCount(0);
  });

  test('Destination-free parent renders with submenu and no href', async ({ page }) => {
    await page.goto('/');

    const parentItem = page.locator('#masthead .header-nav-main > li.has-dropdown');
    await expect(parentItem).toHaveCount(1);
    const parentLink = parentItem.locator('> a.nav-top-link');
    await expect(parentLink).toContainText('Dịch vụ');
    await expect(parentLink).not.toHaveAttribute('href');
    await expect(parentItem.locator('.sub-menu li')).not.toHaveCount(0);

    // Also check on EN
    await page.goto('/en/home/');
    const enParentItem = page.locator('#masthead .header-nav-main > li.has-dropdown');
    await expect(enParentItem).toHaveCount(1);
    const enParentLink = enParentItem.locator('> a.nav-top-link');
    await expect(enParentLink).toContainText('Services');
    await expect(enParentLink).not.toHaveAttribute('href');
    await expect(enParentItem.locator('.sub-menu li')).not.toHaveCount(0);
  });

  test('Header and footer nav items link to their registry paths', async ({ page }) => {
    const cases = [
      { path: '/', top: ['Giới thiệu', '/gioi-thieu/'], child: ['Thiết kế website', '/thiet-ke-website/'] },
      { path: '/en/home/', top: ['About Us', '/en/about-us/'], child: ['Website Development', '/en/website-development/'] },
    ];
    for (const { path, top, child } of cases) {
      await page.goto(path);
      const nav = page.locator('#masthead .header-nav-main');
      await expect(nav.locator('> li > a', { hasText: top[0] })).toHaveAttribute('href', top[1]);
      await expect(nav.locator('.sub-menu a', { hasText: child[0] }).first()).toHaveAttribute('href', child[1]);
      await expect(
        page.locator('footer#footer .ux-menu-link__link', { hasText: top[0] }).first(),
      ).toHaveAttribute('href', top[1]);
    }
  });

  test('/en/ redirects to /en/home/', async ({ page }) => {
    await page.goto('/en/');
    await expect(page).toHaveURL(/\/en\/home\/$/);
  });

  test('Excluded routes are never linked in the shell', async ({ page }) => {
    for (const path of ['/', '/en/home/']) {
      await page.goto(path);
      const links = await page.locator('a[href]').evaluateAll((els) =>
        els.map((e) => (e as HTMLAnchorElement).href),
      );

      for (const link of links) {
        expect(link).not.toContain('/tuyen-dung/');
        expect(link).not.toContain('/giai-phap-truyen-thong-so/');
        expect(link).not.toContain('/en/tuyen-dung/');
        expect(link).not.toContain('/en/digital-communications-solutions/');
        expect(link).not.toContain('themes.erasvietnam');
      }
    }
  });

  test('Settings change to Variant B updates all brand and contact placements', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/shell/variant-b/');

    // Header and footer should show Variant B values
    await expect(page.locator('#logo a img')).toHaveAttribute('alt', 'Brand B');
    await expect(page.locator('#logo a')).toHaveAttribute('title', 'Brand B Corp');
    await expect(page.locator('footer#footer h3').first()).toHaveText('Brand B Corp');
    await expect(page.locator('footer#footer')).toContainText('456 Second St, Hanoi');
    await expect(page.locator('footer#footer')).toContainText('0999 888 777');
    await expect(page.locator('footer#footer')).toContainText('contact@brand-b.example.com');
    await expect(page.locator('#text-1252042670 a')).toHaveText('Brand B Corp');

    // None of Variant A values should appear
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('Fixture Co');
    expect(bodyText).not.toContain('Fixture address');
    expect(bodyText).not.toContain('fixture@example.com');
  });

  test('Logo present renders img with src and alt; missing logo renders wordmark', async ({
    page,
  }) => {
    // Default fixture has local asset-1
    await page.goto('/dev-fixtures/shell/default/');
    const logoImg = page.locator('#logo a img');
    await expect(logoImg).toHaveCount(1);
    await expect(logoImg).toHaveAttribute('src', '/fixture.png');
    await expect(logoImg).toHaveAttribute('alt', 'Fixture');

    // Missing logo fixture
    await page.goto('/dev-fixtures/shell/missing-logo/');
    await expect(page.locator('#logo a img')).toHaveCount(0);
    await expect(page.locator('#logo .header-wordmark')).toHaveText('Fixture');
  });

  test('Unknown fixture variant returns 404', async ({ page }) => {
    const res = await page.goto('/dev-fixtures/shell/non-existent-variant/');
    expect(res?.status()).toBe(404);
  });
});
