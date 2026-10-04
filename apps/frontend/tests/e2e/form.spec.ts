import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from './fixtures';

test.describe('FormField and deterministic SubmitAdapter fixture contract', () => {
  test('FormField source imports nothing from src/data or src/dev', () => {
    const formFieldSource = readFileSync(
      path.resolve(__dirname, '../../src/components/ui/FormField.tsx'),
      'utf8',
    );
    expect(formFieldSource).not.toMatch(/from\s+['"].*(?:data|dev)/);
  });

  for (const variant of ['success', 'error'] as const) {
    test(`Invalid submit shows tip, links aria-describedby, and sets aria-invalid on ${variant} variant`, async ({
      page,
    }) => {
      await page.goto(`/dev-fixtures/form/${variant}`);

      const input = page.locator('input.wpcf7-tel');
      const label = page.locator('label');
      const submitBtn = page.locator('input.wpcf7-submit');

      // Label for matches input id
      const inputId = await input.getAttribute('id');
      expect(inputId).toBeTruthy();
      await expect(label).toHaveAttribute('for', inputId!);

      // Initially, no error tip exists
      await expect(page.locator('.wpcf7-not-valid-tip')).toHaveCount(0);

      // Submitting empty phone triggers validation
      await submitBtn.click();

      const tip = page.locator('.wpcf7-not-valid-tip');
      await expect(tip).toBeVisible();
      await expect(tip).toHaveAttribute('role', 'alert');
      const tipId = await tip.getAttribute('id');
      expect(tipId).toBeTruthy();

      await expect(input).toHaveAttribute('aria-invalid', 'true');
      const describedBy = await input.getAttribute('aria-describedby');
      expect(describedBy).toContain(tipId!);

      // Fill invalid phone (e.g. letters)
      await input.fill('invalid-phone');
      await submitBtn.click();

      await expect(tip).toBeVisible();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  }

  test('Success variant: valid submit enters submitting state, resolves upon release to demo-success with demo badge', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/form/success');

    const input = page.locator('input.wpcf7-tel');
    const submitBtn = page.locator('input.wpcf7-submit');
    const releaseBtn = page.locator('[data-testid="fixture-release"]');

    await input.fill('0988606539');
    await submitBtn.click();

    // While gate is unresolved: button is disabled and aria-busy
    await expect(submitBtn).toBeDisabled();
    await expect(submitBtn).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('form.wpcf7-form')).toHaveClass(/submitting/);

    // Release deferred gate
    await releaseBtn.click();

    // After release: status output appears with demo-success and demo label
    const responseOutput = page.locator('.wpcf7-response-output');
    await expect(responseOutput).toBeVisible();
    await expect(responseOutput).toContainText('Bản demo — chưa gửi thông tin');
    await expect(page.locator('form.wpcf7-form')).toHaveClass(/sent/);

    // Submit button re-enabled
    await expect(submitBtn).toBeEnabled();
  });

  test('Error variant: valid submit enters submitting state, resolves upon release to demo-error, retains phone value and allows resubmit', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/form/error');

    const input = page.locator('input.wpcf7-tel');
    const submitBtn = page.locator('input.wpcf7-submit');
    const releaseBtn = page.locator('[data-testid="fixture-release"]');

    const testPhone = '0912345678';
    await input.fill(testPhone);
    await submitBtn.click();

    // Button disabled during submitting
    await expect(submitBtn).toBeDisabled();
    await expect(submitBtn).toHaveAttribute('aria-busy', 'true');

    // Release deferred gate
    await releaseBtn.click();

    // Demo-error appears with demo badge
    const responseOutput = page.locator('.wpcf7-response-output');
    await expect(responseOutput).toBeVisible();
    await expect(responseOutput).toContainText('Bản demo — chưa gửi thông tin');
    await expect(page.locator('form.wpcf7-form')).toHaveClass(/failed/);

    // Input retains its value after demo-error
    await expect(input).toHaveValue(testPhone);

    // Form stays editable and resubmit is allowed
    await expect(submitBtn).toBeEnabled();
    await input.fill('0988606539');
    await submitBtn.click();
    await expect(submitBtn).toBeDisabled();
    await releaseBtn.click();
    await expect(input).toHaveValue('0988606539');
  });

  test('Storage and privacy: localStorage/sessionStorage length 0 and no cookies set', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/form/success');

    const input = page.locator('input.wpcf7-tel');
    const submitBtn = page.locator('input.wpcf7-submit');
    const releaseBtn = page.locator('[data-testid="fixture-release"]');

    await input.fill('0988606539');
    await submitBtn.click();
    await releaseBtn.click();
    await expect(page.locator('.wpcf7-response-output')).toBeVisible();

    const storage = await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    }));
    expect(storage.local).toBe(0);
    expect(storage.session).toBe(0);

    const cookies = await page.context().cookies();
    expect(cookies).toEqual([]);
  });

  test('Unknown variant returns 404', async ({ page }) => {
    const response = await page.goto('/dev-fixtures/form/unknown-variant');
    expect(response?.status()).toBe(404);
  });
});
