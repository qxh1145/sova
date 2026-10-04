import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

async function expectNoDuplicateIds(page: Page) {
  const ids = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[id]'));
    return els.map((el) => el.id).filter(Boolean);
  });
  const unique = new Set(ids);
  expect(
    ids.length,
    `Duplicate ids found: ${ids.filter((id, i) => ids.indexOf(id) !== i).join(', ')}`,
  ).toBe(unique.size);
}

const getBodyOverflow = (page: Page) =>
  page.evaluate(() => window.getComputedStyle(document.body).overflow);

const COPIES = {
  vi: {
    heading: 'Đăng ký',
    placeholder: 'Số điện thoại',
    submit: 'Gửi đi  →',
    submitting: 'Đang gửi...',
    required: 'Vui lòng nhập số điện thoại',
    invalid: 'Số điện thoại không hợp lệ',
    success: 'Cảm ơn bạn đã gửi yêu cầu. Chúng tôi sẽ liên hệ lại sớm nhất.',
    error: 'Đã có lỗi xảy ra trong quá trình gửi. Vui lòng thử lại.',
    demoBadge: 'Bản demo — chưa gửi thông tin',
    note: 'Đăng ký để nhận những thông tin mới nhất về các chương trình ưu đãi của Sova',
  },
  en: {
    heading: 'Register',
    placeholder: 'Phone Number',
    submit: 'Submit →',
    submitting: 'Sending...',
    required: 'Please enter your phone number',
    invalid: 'Invalid phone number',
    success: 'Thank you for your submission. We will contact you soon.',
    error: 'An error occurred while sending. Please try again.',
    demoBadge: 'Demo — no data was sent',
    note: "Register to receive the latest information about Sova's promotional programs",
  },
};

test.describe('ConsultForm and drawer demo flow contract', () => {
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
    (page as unknown as { __consoleErrors: string[] }).__consoleErrors = consoleErrors;
  });

  test.afterEach(async ({ page }) => {
    const errors = (page as unknown as { __consoleErrors?: string[] }).__consoleErrors ?? [];
    expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
  });

  test('ConsultForm and FormResponse import nothing from src/data or src/dev', () => {
    const consultFormSource = readFileSync(
      path.resolve(__dirname, '../../src/components/forms/ConsultForm.tsx'),
      'utf8',
    );
    expect(consultFormSource).not.toMatch(/from\s+['"].*(?:data|dev)/);

    const formResponseSource = readFileSync(
      path.resolve(__dirname, '../../src/components/ui/FormResponse.tsx'),
      'utf8',
    );
    expect(formResponseSource).not.toMatch(/from\s+['"].*(?:data|dev)/);
  });

  const viewports = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  const routes = [
    { locale: 'vi' as const, path: '/' },
    { locale: 'en' as const, path: '/en/home/' },
  ];

  for (const vp of viewports) {
    for (const route of routes) {
      test(`Root ${route.path} on ${vp.name} (${vp.width}px): open drawer, localized copy, empty/invalid/valid submit, Escape, privacy`, async ({
        page,
      }) => {
        const copy = COPIES[route.locale];
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route.path);

        const trigger = page.locator('a[aria-controls="main-menu"]:visible');
        await expect(trigger).toBeVisible();
        await trigger.focus();
        await page.keyboard.press('Enter');

        const drawer = page.locator('#main-menu');
        await expect(drawer).toBeVisible();

        await expectNoDuplicateIds(page);

        const form = drawer.locator('form.wpcf7-form');
        const input = form.locator('input.wpcf7-tel');
        const submitBtn = form.locator('input.wpcf7-submit');

        // Check localized form copy
        const heading = drawer.locator('h4').filter({ hasText: copy.heading });
        await expect(heading).toBeVisible();
        await expect(input).toHaveAttribute('placeholder', copy.placeholder);
        await expect(submitBtn).toHaveValue(copy.submit);
        const note = drawer.locator('p').filter({ hasText: copy.note });
        await expect(note).toBeVisible();

        // 1. Empty submit
        await submitBtn.click();
        const tip = form.locator('.wpcf7-not-valid-tip');
        await expect(tip).toHaveText(copy.required);
        await expect(tip).toHaveAttribute('role', 'alert');
        await expect(input).toBeFocused();
        await expect(input).toHaveAttribute('aria-invalid', 'true');

        // 2. Invalid phone submit
        await input.fill('invalid-phone');
        await submitBtn.click();
        await expect(tip).toHaveText(copy.invalid);
        await expect(input).toHaveAttribute('aria-invalid', 'true');

        // 3. Valid submit -> demo-success
        await input.fill('0988606539');
        await submitBtn.click();

        const responseOutput = form.locator('.wpcf7-response-output');
        await expect(responseOutput).toBeVisible();
        await expect(responseOutput).toHaveClass(/sent/);
        await expect(responseOutput).toContainText(copy.success);
        await expect(responseOutput).toContainText(copy.demoBadge);
        await expect(form).toHaveClass(/sent/);

        // Drawer stays open on submit
        await expect(drawer).toBeVisible();

        // 4. Escape closes drawer, returns focus to trigger, releases scroll lock
        await page.keyboard.press('Escape');
        await expect(drawer).toBeHidden();
        await expect(trigger).toBeFocused();
        expect(await getBodyOverflow(page)).not.toBe('hidden');

        // 5. Storage and privacy checks
        const storage = await page.evaluate(() => ({
          local: localStorage.length,
          session: sessionStorage.length,
        }));
        expect(storage.local).toBe(0);
        expect(storage.session).toBe(0);

        const cookies = await page.context().cookies();
        expect(cookies).toEqual([]);
      });
    }
  }

  for (const locale of ['vi', 'en'] as const) {
    const copy = COPIES[locale];

    test(`Fixture consult-error (${locale}): submitting state, release gate, demo-error retains value and allows resubmit`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/dev-fixtures/shell/consult-error?locale=${locale}`);

      const trigger = page.locator('a[aria-controls="main-menu"]:visible');
      await trigger.focus();
      await page.keyboard.press('Enter');

      const drawer = page.locator('#main-menu');
      await expect(drawer).toBeVisible();

      const form = drawer.locator('form.wpcf7-form');
      const input = form.locator('input.wpcf7-tel');
      const submitBtn = form.locator('input.wpcf7-submit');

      const testPhone = '0912345678';
      await input.fill(testPhone);
      await submitBtn.click();

      // Submitting state (before release): disabled, aria-busy, submitting label
      await expect(submitBtn).toBeDisabled();
      await expect(submitBtn).toHaveAttribute('aria-busy', 'true');
      await expect(submitBtn).toHaveValue(copy.submitting);
      await expect(form).toHaveClass(/submitting/);

      // Release gate
      await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="fixture-release"]') as HTMLButtonElement | null;
        btn?.click();
      });

      // Demo-error state
      const responseOutput = form.locator('.wpcf7-response-output');
      await expect(responseOutput).toBeVisible();
      await expect(responseOutput).toHaveClass(/failed/);
      await expect(responseOutput).toContainText(copy.error);
      await expect(responseOutput).toContainText(copy.demoBadge);
      await expect(form).toHaveClass(/failed/);

      // Input value is kept
      await expect(input).toHaveValue(testPhone);

      // Resubmit allowed
      await expect(submitBtn).toBeEnabled();
      await input.fill('0988606539');
      await submitBtn.click();
      await expect(submitBtn).toBeDisabled();
      await expect(submitBtn).toHaveAttribute('aria-busy', 'true');

      // Release second submit
      await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="fixture-release"]') as HTMLButtonElement | null;
        btn?.click();
      });
      await expect(form).toHaveClass(/failed/);
      await expect(input).toHaveValue('0988606539');
    });

    test(`Fixture consult-success (${locale}): submitting state, release gate, demo-success shows sent`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/dev-fixtures/shell/consult-success?locale=${locale}`);

      const trigger = page.locator('a[aria-controls="main-menu"]:visible');
      await trigger.focus();
      await page.keyboard.press('Enter');

      const drawer = page.locator('#main-menu');
      await expect(drawer).toBeVisible();

      const form = drawer.locator('form.wpcf7-form');
      const input = form.locator('input.wpcf7-tel');
      const submitBtn = form.locator('input.wpcf7-submit');

      await input.fill('0988606539');
      await submitBtn.click();

      // Submitting state
      await expect(submitBtn).toBeDisabled();
      await expect(submitBtn).toHaveAttribute('aria-busy', 'true');
      await expect(submitBtn).toHaveValue(copy.submitting);
      await expect(form).toHaveClass(/submitting/);

      // Release gate
      await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="fixture-release"]') as HTMLButtonElement | null;
        btn?.click();
      });

      // Demo-success state
      const responseOutput = form.locator('.wpcf7-response-output');
      await expect(responseOutput).toBeVisible();
      await expect(responseOutput).toHaveClass(/sent/);
      await expect(responseOutput).toContainText(copy.success);
      await expect(responseOutput).toContainText(copy.demoBadge);
      await expect(form).toHaveClass(/sent/);
      await expect(submitBtn).toBeEnabled();
    });
  }
});
