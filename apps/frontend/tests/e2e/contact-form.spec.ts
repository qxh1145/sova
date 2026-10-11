import { expect, test } from './fixtures';
import { shellContent } from '../../src/data/shell';

test.describe('Contact Form (Story Contact form with demo submit)', () => {
  const viShell = shellContent.find((s) => s.locale === 'vi')!;
  const enShell = shellContent.find((s) => s.locale === 'en')!;

  test('Empty submit on VI renders 5 validation tips and sets invalid form class', async ({
    page,
  }) => {
    await page.goto('/lien-he/');
    const form = page.locator('form.wpcf7-form');
    await expect(form).toBeVisible();

    const submitBtn = form.locator('input.wpcf7-submit');
    await submitBtn.click();

    await expect(form).toHaveClass(/invalid/);
    const tips = form.locator('.wpcf7-not-valid-tip');
    await expect(tips).toHaveCount(5);

    // Verify all 5 controls have aria-invalid="true"
    await expect(form.locator('input[name="your-name"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(form.locator('input[name="your-email"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(form.locator('select[name="dynamic_select-682"]')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(form.locator('input[name="tel-584"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(form.locator('textarea[name="your-message"]')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  test('Empty submit on EN renders 5 validation tips and sets invalid form class', async ({
    page,
  }) => {
    await page.goto('/en/contact-us/');
    const form = page.locator('form.wpcf7-form');
    await expect(form).toBeVisible();

    const submitBtn = form.locator('input.wpcf7-submit');
    await submitBtn.click();

    await expect(form).toHaveClass(/invalid/);
    const tips = form.locator('.wpcf7-not-valid-tip');
    await expect(tips).toHaveCount(5);

    await expect(form.locator('input[name="your-name"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(form.locator('input[name="your-email"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(form.locator('select[name="dynamic_select-6827"]')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(form.locator('input[name="tel-584"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(form.locator('textarea[name="your-message"]')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  test('Bad email retains other field values and shows email tip only', async ({
    page,
  }) => {
    await page.goto('/lien-he/');
    const form = page.locator('form.wpcf7-form');
    await expect(form).toBeVisible();

    await form.locator('input[name="your-name"]').fill('Nguyễn Văn A');
    await form.locator('input[name="your-email"]').fill('abc');
    await form.locator('select[name="dynamic_select-682"]').selectOption('Dịch Vụ Thiết Kế Website');
    await form.locator('input[name="tel-584"]').fill('0988606539');
    await form.locator('textarea[name="your-message"]').fill('Mô tả dự án');

    await form.locator('input.wpcf7-submit').click();

    await expect(form).toHaveClass(/invalid/);
    const tips = form.locator('.wpcf7-not-valid-tip');
    await expect(tips).toHaveCount(1);
    await expect(tips).toHaveText('Địa chỉ email không hợp lệ.');

    await expect(form.locator('input[name="your-name"]')).toHaveValue('Nguyễn Văn A');
    await expect(form.locator('input[name="your-email"]')).toHaveValue('abc');
    await expect(form.locator('select[name="dynamic_select-682"]')).toHaveValue('Dịch Vụ Thiết Kế Website');
    await expect(form.locator('input[name="tel-584"]')).toHaveValue('0988606539');
    await expect(form.locator('textarea[name="your-message"]')).toHaveValue('Mô tả dự án');
  });

  test('Bad phone retains other field values and shows phone tip only', async ({
    page,
  }) => {
    await page.goto('/lien-he/');
    const form = page.locator('form.wpcf7-form');
    await expect(form).toBeVisible();

    await form.locator('input[name="your-name"]').fill('Nguyễn Văn A');
    await form.locator('input[name="your-email"]').fill('vana@example.com');
    await form.locator('select[name="dynamic_select-682"]').selectOption('Dịch Vụ Thiết Kế Website');
    await form.locator('input[name="tel-584"]').fill('12');
    await form.locator('textarea[name="your-message"]').fill('Mô tả dự án');

    await form.locator('input.wpcf7-submit').click();

    await expect(form).toHaveClass(/invalid/);
    const tips = form.locator('.wpcf7-not-valid-tip');
    await expect(tips).toHaveCount(1);
    await expect(tips).toHaveText('Số điện thoại không hợp lệ');

    await expect(form.locator('input[name="your-name"]')).toHaveValue('Nguyễn Văn A');
    await expect(form.locator('input[name="your-email"]')).toHaveValue('vana@example.com');
    await expect(form.locator('select[name="dynamic_select-682"]')).toHaveValue('Dịch Vụ Thiết Kế Website');
    await expect(form.locator('input[name="tel-584"]')).toHaveValue('12');
    await expect(form.locator('textarea[name="your-message"]')).toHaveValue('Mô tả dự án');
  });

  test('Fixture error variant retains all 5 values, displays demo error, and keeps URL', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/contact-form/error?locale=vi');
    const form = page.locator('form.wpcf7-form');
    await expect(form).toBeVisible();

    const nameInput = form.locator('input[name="your-name"]');
    const emailInput = form.locator('input[name="your-email"]');
    const selectInput = form.locator('select[name="dynamic_select-682"]');
    const phoneInput = form.locator('input[name="tel-584"]');
    const messageInput = form.locator('textarea[name="your-message"]');
    const submitBtn = form.locator('input.wpcf7-submit');
    const releaseBtn = page.locator('[data-testid="fixture-release"]');

    await nameInput.fill('Nguyễn Văn A');
    await emailInput.fill('vana@example.com');
    await selectInput.selectOption('Dịch Vụ Thiết Kế Website');
    await phoneInput.fill('0988606539');
    await messageInput.fill('Mô tả dự án đầy đủ');

    await submitBtn.click();

    // Submitting state before release
    await expect(submitBtn).toBeDisabled();
    await expect(submitBtn).toHaveAttribute('aria-busy', 'true');
    await expect(submitBtn).toHaveValue(viShell.consult.submitting);
    await expect(form).toHaveClass(/submitting/);

    // Release gate
    await releaseBtn.click();

    // Demo error state
    await expect(form).toHaveClass(/failed/);
    const responseOutput = form.locator('.wpcf7-response-output');
    await expect(responseOutput).toBeVisible();
    await expect(responseOutput).toHaveClass(/failed/);
    await expect(responseOutput).toContainText(viShell.consult.error);
    await expect(responseOutput).toContainText(viShell.consult.demoBadge);

    // All 5 values kept
    await expect(nameInput).toHaveValue('Nguyễn Văn A');
    await expect(emailInput).toHaveValue('vana@example.com');
    await expect(selectInput).toHaveValue('Dịch Vụ Thiết Kế Website');
    await expect(phoneInput).toHaveValue('0988606539');
    await expect(messageInput).toHaveValue('Mô tả dự án đầy đủ');

    // URL unchanged
    expect(page.url()).toContain('/dev-fixtures/contact-form/error');
  });

  test('Real VI contact page navigates to thank-you demo page on valid submit', async ({
    page,
  }) => {
    await page.goto('/lien-he/');
    const form = page.locator('form.wpcf7-form');
    await expect(form).toBeVisible();

    await form.locator('input[name="your-name"]').fill('Nguyễn Văn B');
    await form.locator('input[name="your-email"]').fill('vanb@example.com');
    await form.locator('select[name="dynamic_select-682"]').selectOption('Dịch Vụ Thiết Kế App Mobile');
    await form.locator('input[name="tel-584"]').fill('0988606539');
    await form.locator('textarea[name="your-message"]').fill('Mô tả dự án VI');

    const submitBtn = form.locator('input.wpcf7-submit');
    await submitBtn.click();

    await page.waitForURL('**/eras-xin-chan-thanh-cam-on-quy-khach/?demo=1');
    expect(page.url()).toContain('/eras-xin-chan-thanh-cam-on-quy-khach/?demo=1');

    // Demo badge visible on thank-you page
    const badge = page.locator('.wpcf7-demo-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(viShell.consult.demoBadge);
  });

  test('Real EN contact page navigates to thank-you demo page on valid submit', async ({
    page,
  }) => {
    await page.goto('/en/contact-us/');
    const form = page.locator('form.wpcf7-form');
    await expect(form).toBeVisible();

    await form.locator('input[name="your-name"]').fill('John Doe');
    await form.locator('input[name="your-email"]').fill('john@example.com');
    await form.locator('select[name="dynamic_select-6827"]').selectOption('Website Development');
    await form.locator('input[name="tel-584"]').fill('0988606539');
    await form.locator('textarea[name="your-message"]').fill('Project description EN');

    const submitBtn = form.locator('input.wpcf7-submit');
    await submitBtn.click();

    await page.waitForURL('**/eras-xin-chan-thanh-cam-on-quy-khach/?demo=1');
    expect(page.url()).toContain('/eras-xin-chan-thanh-cam-on-quy-khach/?demo=1');

    // Demo badge visible on thank-you page (thank-you page is VI-only)
    const badge = page.locator('.wpcf7-demo-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(viShell.consult.demoBadge);
  });

  test('Privacy: no form values written to localStorage, sessionStorage or cookies', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/contact-form/error?locale=vi');
    const form = page.locator('form.wpcf7-form');

    await form.locator('input[name="your-name"]').fill('Test Privacy');
    await form.locator('input[name="your-email"]').fill('privacy@example.com');
    await form.locator('select[name="dynamic_select-682"]').selectOption('Dịch Vụ SEO Từ Khoá Website');
    await form.locator('input[name="tel-584"]').fill('0988606539');
    await form.locator('textarea[name="your-message"]').fill('Privacy check message');

    await form.locator('input.wpcf7-submit').click();
    await page.locator('[data-testid="fixture-release"]').click();
    await expect(form).toHaveClass(/failed/);

    const storage = await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    }));
    expect(storage.local).toBe(0);
    expect(storage.session).toBe(0);

    const cookies = await page.context().cookies();
    expect(cookies).toEqual([]);
  });

  test('Unknown fixture variant returns 404', async ({ page }) => {
    const response = await page.goto('/dev-fixtures/contact-form/unknown-variant');
    expect(response?.status()).toBe(404);
  });
});
