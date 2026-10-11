import { expect, expectNoDuplicateIds, test } from './fixtures';
import { getUtilityContent } from '../../src/lib/queries/pages';
import { getSiteSettings, getShellContent } from '../../src/lib/queries/site';

test.describe('Legacy Login UI (/login-eras/)', () => {
  test('Page load: GET /login-eras/ renders #login, no shell, 1 h1, support panel, wordmark, and no duplicate IDs', async ({
    page,
  }) => {
    const response = await page.goto('/login-eras/');
    expect(response?.status()).toBe(200);

    // No shell header or footer
    await expect(page.locator('header#header')).toHaveCount(0);
    await expect(page.locator('footer#footer')).toHaveCount(0);
    await expect(page.locator('.site-shell')).toHaveCount(0);

    // #login renders
    const loginEl = page.locator('#login');
    await expect(loginEl).toBeVisible();

    // Exactly one h1 "Đăng nhập"
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Đăng nhập');

    // Support panel shows SiteSettings values
    const settings = await getSiteSettings('vi');
    const shortInfo = page.locator('.short-info');
    await expect(shortInfo).toBeVisible();
    await expect(shortInfo).toContainText(settings.phones[0]!.label);
    await expect(shortInfo).toContainText(settings.email);

    // Both logo slots render SiteSettings.wordmark
    const desktopLogo = page.locator('#logo');
    await expect(desktopLogo).toBeVisible();
    await expect(desktopLogo).toHaveText(settings.wordmark);

    const mobileLogo = page.locator('.logo.d-block.d-md-none');
    await expect(mobileLogo).toContainText(settings.wordmark);

    // Privacy link renders
    const privacyLink = page.locator('.privacy-policy-page-link a');
    await expect(privacyLink).toHaveAttribute('href', '/chinh-sach-bao-mat/');

    // No duplicate IDs
    await expectNoDuplicateIds(page);
  });

  test('Empty submit: both fields blank shows required error per field, aria-invalid="true", no notice', async ({
    page,
  }) => {
    await page.goto('/login-eras/');
    const submitBtn = page.locator('#wp-submit');
    const userInput = page.locator('#user_login');
    const passInput = page.locator('#user_pass');

    await submitBtn.click();

    await expect(userInput).toHaveAttribute('aria-invalid', 'true');
    await expect(passInput).toHaveAttribute('aria-invalid', 'true');

    const record = await getUtilityContent('login-vi');
    expect(record?.login).toBeDefined();

    await expect(page.locator('.form-wrapper')).toContainText(record!.login!.usernameRequired);
    await expect(page.locator('.form-wrapper')).toContainText(record!.login!.passwordRequired);

    // Notice is not shown
    await expect(page.locator('div.notice')).toHaveCount(0);
  });

  test('One field blank: username filled, password blank keeps username value and shows password error only', async ({
    page,
  }) => {
    await page.goto('/login-eras/');
    const userInput = page.locator('#user_login');
    const passInput = page.locator('#user_pass');
    const submitBtn = page.locator('#wp-submit');

    await userInput.fill('testuser');
    await submitBtn.click();

    // Username value kept
    await expect(userInput).toHaveValue('testuser');
    await expect(userInput).toHaveAttribute('aria-invalid', 'false');

    // Password invalid
    await expect(passInput).toHaveAttribute('aria-invalid', 'true');

    const record = await getUtilityContent('login-vi');
    await expect(page.locator('.form-wrapper')).not.toContainText(record!.login!.usernameRequired);
    await expect(page.locator('.form-wrapper')).toContainText(record!.login!.passwordRequired);

    await expect(page.locator('div.notice')).toHaveCount(0);
  });

  test('Password reveal button: toggles type, aria-pressed, data-toggle, aria-label, and icon class', async ({
    page,
  }) => {
    await page.goto('/login-eras/');
    const passInput = page.locator('#user_pass');
    const revealBtn = page.locator('button.wp-hide-pw');
    const icon = revealBtn.locator('span.dashicons');

    const record = await getUtilityContent('login-vi');
    const { showPasswordLabel, hidePasswordLabel } = record!.login!;

    await passInput.fill('secret123');

    // Initial state: password hidden
    await expect(passInput).toHaveAttribute('type', 'password');
    await expect(revealBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(revealBtn).toHaveAttribute('data-toggle', '0');
    await expect(revealBtn).toHaveAttribute('aria-label', showPasswordLabel);
    await expect(icon).toHaveClass(/dashicons-visibility/);

    // First click: reveal password
    await revealBtn.click();
    await expect(passInput).toHaveAttribute('type', 'text');
    await expect(revealBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(revealBtn).toHaveAttribute('data-toggle', '1');
    await expect(revealBtn).toHaveAttribute('aria-label', hidePasswordLabel);
    await expect(icon).toHaveClass(/dashicons-hidden/);

    // Second click: hide password again
    await revealBtn.click();
    await expect(passInput).toHaveAttribute('type', 'password');
    await expect(revealBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(revealBtn).toHaveAttribute('data-toggle', '0');
    await expect(revealBtn).toHaveAttribute('aria-label', showPasswordLabel);
    await expect(icon).toHaveClass(/dashicons-visibility/);
  });

  test('Valid submit: shows demo notice, no network requests after submit, URL unchanged, no storage or cookies', async ({
    page,
  }) => {
    await page.goto('/login-eras/');
    const userInput = page.locator('#user_login');
    const passInput = page.locator('#user_pass');
    const rememberCheckbox = page.locator('#rememberme');
    const submitBtn = page.locator('#wp-submit');

    await userInput.fill('testuser');
    await passInput.fill('secret123');
    await rememberCheckbox.check();

    // Track requests after submit
    const submittedUrls: string[] = [];
    page.on('request', (req) => submittedUrls.push(req.url()));

    await submitBtn.click();

    // Demo notice shown with role="status"
    const notice = page.locator('div.notice[role="status"]');
    await expect(notice).toBeVisible();
    const shell = await getShellContent('vi');
    await expect(notice).toContainText(shell.consult.demoBadge);

    // URL unchanged
    expect(page.url()).toMatch(/\/login-eras\/$/);

    // No network requests were dispatched by submit
    expect(submittedUrls).toHaveLength(0);

    // Local/session storage and cookies unchanged / empty
    const storage = await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    }));
    expect(storage.local).toBe(0);
    expect(storage.session).toBe(0);

    const cookies = await page.context().cookies();
    expect(cookies).toEqual([]);
  });

  test('Alias: GET /dang-ky-nghi-phep/ permanently redirects to /login-eras/', async ({
    page,
  }) => {
    const response = await page.goto('/dang-ky-nghi-phep/');
    expect(response?.status()).toBe(200);
    const redirect = await response!.request().redirectedFrom()!.response();
    expect(redirect?.status()).toBe(308);
    expect(page.url()).toMatch(/\/login-eras\/$/);

    await expect(page.locator('#login')).toBeVisible();
    await expectNoDuplicateIds(page);
  });
});
