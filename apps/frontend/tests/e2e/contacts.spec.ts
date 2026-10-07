import { expect, KNOWN_ABSENT_CSS_ASSETS, test } from './fixtures';

test.describe('Floating contacts and mobile contact bar', () => {
  test('Mobile 390px (VI): bar visible with 5 links, localized labels; widget button visible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const barOuter = page.locator('#azt-contact-footer-outer');
    await expect(barOuter).toBeVisible();

    const bar = page.locator('#azt-contact-footer');
    const links = bar.locator('> a');
    await expect(links).toHaveCount(5);

    // Labels
    await expect(links.nth(0).locator('.azt-contact-footer-btn-label')).toHaveText('Menu');
    await expect(links.nth(1).locator('.azt-contact-footer-btn-label')).toHaveText('Liên hệ');
    await expect(links.nth(1)).toHaveAttribute('href', '/lien-he/');

    // Center button
    const centerBtn = bar.locator('#azt-contact-footer-btn-center');
    await expect(centerBtn).toBeVisible();
    await expect(centerBtn.locator('.phone-vr-circle-fill')).toBeVisible();
    await expect(centerBtn.locator('.azt-contact-footer-btn-label')).toContainText('Gọi ngay');

    // Messenger & Zalo
    await expect(links.nth(3).locator('.azt-contact-footer-btn-label')).toHaveText('Messenger');
    await expect(links.nth(4).locator('.azt-contact-footer-btn-label')).toHaveText('Zalo');

    // Widget button is present
    const widgetBtn = page.locator('#arcontactus .arcu-message-button');
    await expect(widgetBtn).toBeVisible();
  });

  test('Mobile 390px (EN): bar visible with localized EN labels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en/home/');

    const barOuter = page.locator('#azt-contact-footer-outer');
    await expect(barOuter).toBeVisible();

    const bar = page.locator('#azt-contact-footer');
    const links = bar.locator('> a');
    await expect(links).toHaveCount(5);

    await expect(links.nth(0).locator('.azt-contact-footer-btn-label')).toHaveText('Menu');
    await expect(links.nth(1).locator('.azt-contact-footer-btn-label')).toHaveText('Contact');
    await expect(links.nth(1)).toHaveAttribute('href', '/en/contact-us/');

    const centerBtn = bar.locator('#azt-contact-footer-btn-center');
    await expect(centerBtn.locator('.azt-contact-footer-btn-label')).toContainText('Call now');

    await expect(links.nth(3).locator('.azt-contact-footer-btn-label')).toHaveText('Messenger');
    await expect(links.nth(4).locator('.azt-contact-footer-btn-label')).toHaveText('Zalo');
  });

  test('Desktop 1440px: bar hidden; widget button visible bottom-right', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const barOuter = page.locator('#azt-contact-footer-outer');
    await expect(barOuter).toBeHidden();

    const widget = page.locator('#arcontactus');
    await expect(widget).toBeVisible();
    const widgetBtn = widget.locator('.arcu-message-button');
    await expect(widgetBtn).toBeVisible();
    await expect(widgetBtn.locator('p')).toHaveText('Contact us');

    // Icon slider (contactus.min.js B()): after the 2s pause the icons replace the static text
    await expect(widgetBtn.locator('.icons')).not.toHaveClass(/arcu-hide/, { timeout: 5000 });
    await expect(widgetBtn.locator('.static')).toHaveClass(/arcu-hide/);
    await expect(widgetBtn.locator('.icons-line > span')).toHaveCount(4);
  });

  test('Desktop 1440px (EN): bar hidden; widget button visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en/home/');

    await expect(page.locator('#azt-contact-footer-outer')).toBeHidden();
    await expect(page.locator('#arcontactus .arcu-message-button')).toBeVisible();
  });

  test('Widget opens by keyboard (Enter) showing header + 4 items with aria-expanded=true', async ({
    page,
  }) => {
    await page.goto('/');

    const widgetBtn = page.locator('#arcontactus .arcu-message-button');
    await expect(widgetBtn).toHaveAttribute('aria-expanded', 'false');

    await widgetBtn.focus();
    await page.keyboard.press('Enter');

    await expect(widgetBtn).toHaveAttribute('aria-expanded', 'true');
    const menuBlock = page.locator('#arcontactus .messangers-block');
    await expect(menuBlock).toHaveClass(/arcu-show/);
    await expect(menuBlock.locator('.arcu-menu-header-content')).toHaveText(
      'Xin chào, Chúng tôi có thể giúp gì cho bạn.',
    );

    const items = menuBlock.locator('.messangers-list li a');
    await expect(items).toHaveCount(4);
    await expect(items.nth(0).locator('.arcu-item-title')).toHaveText('Hotline');
    await expect(items.nth(1).locator('.arcu-item-title')).toHaveText('Messenger');
    await expect(items.nth(2).locator('.arcu-item-title')).toHaveText('Chat Zalo');
    await expect(items.nth(3).locator('.arcu-item-title')).toHaveText('Email us');

    await page.keyboard.press('Space');
    await expect(widgetBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('EN widget displays EN menu header', async ({ page }) => {
    await page.goto('/en/home/');

    const widgetBtn = page.locator('#arcontactus .arcu-message-button');
    await widgetBtn.click();

    const menuBlock = page.locator('#arcontactus .messangers-block');
    await expect(menuBlock.locator('.arcu-menu-header-content')).toHaveText(
      'How would you like to contact us?',
    );
  });

  test('Widget closes on Escape and returns focus to button', async ({ page }) => {
    await page.goto('/');

    const widgetBtn = page.locator('#arcontactus .arcu-message-button');
    await widgetBtn.focus();
    await page.keyboard.press('Enter');
    await expect(widgetBtn).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(widgetBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(widgetBtn).toBeFocused();
  });

  test('Widget closes on backdrop click', async ({ page }) => {
    await page.goto('/');

    const widgetBtn = page.locator('#arcontactus .arcu-message-button');
    await widgetBtn.click();
    await expect(widgetBtn).toHaveAttribute('aria-expanded', 'true');

    const backdrop = page.locator('#arcontactus .arcu-backdrop');
    await backdrop.click({ position: { x: 10, y: 10 } });
    await expect(widgetBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('Widget closes on item click', async ({ page }) => {
    await page.goto('/');

    const widgetBtn = page.locator('#arcontactus .arcu-message-button');
    await widgetBtn.click();
    await expect(widgetBtn).toHaveAttribute('aria-expanded', 'true');

    // The item is target=_blank to an external host; stop the navigation so the network guard stays quiet.
    const messengerItem = page.locator('#msg-item-11');
    await messengerItem.evaluate((el) => el.addEventListener('click', (e) => e.preventDefault()));
    await messengerItem.click();
    await expect(widgetBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('Widget closes whenever a shell overlay opens', async ({ page }) => {
    // Desktop: at 390px the source CSS stacks the contact bar over the widget button.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const widgetBtn = page.locator('#arcontactus .arcu-message-button');
    await widgetBtn.click();
    await expect(widgetBtn).toHaveAttribute('aria-expanded', 'true');

    // Open the drawer from the header trigger by keyboard (the open widget's backdrop covers the page)
    const headerMenu = page.locator('.flex-col a[aria-controls="main-menu"]:visible');
    await headerMenu.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-menu')).toBeVisible();

    // Widget menu should close
    await expect(widgetBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('Bar Menu tap at 390px opens drawer with consult form and Escape returns focus to Menu', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const barMenu = page.locator('#azt-contact-footer a[data-open="#main-menu"]');
    await expect(barMenu).toHaveAttribute('aria-haspopup', 'dialog');
    await barMenu.click();

    const drawer = page.locator('#main-menu');
    await expect(drawer).toBeVisible();

    // Consult form is inside drawer
    await expect(drawer.locator('form.wpcf7-form')).toBeVisible();

    // Escape closes drawer and restores focus to Menu trigger
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(barMenu).toBeFocused();
  });

  test('Settings change to Variant B updates bar and widget hrefs', async ({ page }) => {
    await page.goto('/dev-fixtures/shell/variant-b/');

    // Bar
    await expect(page.locator('#azt-contact-footer-btn-center')).toHaveAttribute(
      'href',
      'tel:0999888777',
    );
    await expect(
      page.locator('#azt-contact-footer a[href="https://example.com/messenger-b"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('#azt-contact-footer a[href="https://example.com/zalo-b"]'),
    ).toHaveCount(1);

    // Widget items
    await expect(page.locator('#msg-item-10')).toHaveAttribute('href', 'tel:0999888777');
    await expect(page.locator('#msg-item-11')).toHaveAttribute(
      'href',
      'https://example.com/messenger-b',
    );
    await expect(page.locator('#msg-item-12')).toHaveAttribute(
      'href',
      'https://example.com/zalo-b',
    );
    await expect(page.locator('#msg-item-13')).toHaveAttribute(
      'href',
      'mailto:contact@brand-b.example.com',
    );
  });

  test('No phones fixture omits Hotline item and bar centre link without crash', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/shell/no-phones/');

    // Bar centre link omitted
    await expect(page.locator('#azt-contact-footer-btn-center')).toHaveCount(0);
    // 4 links remain in the bar
    await expect(page.locator('#azt-contact-footer > a')).toHaveCount(4);

    // Widget hotline omitted
    await expect(page.locator('#msg-item-10')).toHaveCount(0);
    // 3 items remain in widget (Messenger, Zalo, Email)
    await expect(page.locator('#arcontactus .messangers-list li a')).toHaveCount(3);
  });

  test('No cookies or storage writes, no duplicate ids, and no console errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const failedResponses: string[] = [];
    page.on('console', (msg) => {
      // Resource failures are checked by URL below (console text carries no URL)
      if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));
    page.on('response', (res) => {
      // Link prefetches of routes later epics build (`?_rsc=`) 404 today; anything else is a real failure
      if (res.status() >= 400 && !res.url().includes('_rsc=')) {
        try {
          const url = new URL(res.url());
          if (!KNOWN_ABSENT_CSS_ASSETS.has(url.pathname)) {
            failedResponses.push(res.url());
          }
        } catch {
          failedResponses.push(res.url());
        }
      }
    });

    await page.goto('/');

    // Open and close widget
    const widgetBtn = page.locator('#arcontactus .arcu-message-button');
    await widgetBtn.click();
    await page.keyboard.press('Escape');

    // Check cookies: no arcumenu cookie written
    expect(await page.context().cookies()).toEqual([]);

    // Check storage: no localStorage or sessionStorage writes
    const storageKeys = await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    }));
    expect(storageKeys.local).toHaveLength(0);
    expect(storageKeys.session).toHaveLength(0);

    // Check for duplicate IDs on the page
    const duplicates = await page.evaluate(() => {
      const allIds = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
      const seen = new Set<string>();
      const dups = new Set<string>();
      for (const id of allIds) {
        if (seen.has(id)) dups.add(id);
        else seen.add(id);
      }
      return Array.from(dups);
    });
    expect(duplicates).toEqual([]);

    expect(consoleErrors).toEqual([]);
    expect(failedResponses).toEqual([]);
  });
});
