import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

test.describe('Accordion primitive and shared FAQ list', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.startsWith('Failed to load resource: the server responded with a status of 404')) {
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

  const locales = [
    { name: 'VI', url: '/dev-fixtures/faq/default' },
    { name: 'EN', url: '/dev-fixtures/faq/default?locale=en' },
  ];

  for (const { name, url } of locales) {
    test(`${name}: stable IDs present and matching aria-controls/aria-labelledby`, async ({
      page,
    }) => {
      await page.goto(url);

      const items = page.locator('.accordion-item');
      const count = await items.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const itemId = await item.getAttribute('id');
        expect(itemId).toBeTruthy();
        expect(itemId).toMatch(/^accordion-.+/);

        const idSuffix = itemId!.replace(/^accordion-/, '');
        const trigger = item.locator('.accordion-title');
        const content = item.locator('.accordion-inner');

        await expect(trigger).toHaveAttribute('id', `accordion-${idSuffix}-label`);
        await expect(trigger).toHaveAttribute('aria-controls', `accordion-${idSuffix}-content`);

        await expect(content).toHaveAttribute('id', `accordion-${idSuffix}-content`);
        await expect(content).toHaveAttribute('aria-labelledby', `accordion-${idSuffix}-label`);
      }
    });

    test(`${name}: initial state is first open (single) and none open (multiple)`, async ({
      page,
    }) => {
      await page.goto(url);

      // Single accordion in SEO section: first open, others closed
      const seoItems = page.locator('[data-testid="seo-faq-section"] .accordion-item');
      const seoFirstTrigger = seoItems.first().locator('.accordion-title');
      const seoFirstContent = seoItems.first().locator('.accordion-inner');

      await expect(seoFirstTrigger).toHaveAttribute('aria-expanded', 'true');
      await expect(seoFirstTrigger).toHaveClass(/active/);
      await expect(seoFirstContent).toHaveCSS('display', 'block');

      const seoCount = await seoItems.count();
      for (let i = 1; i < seoCount; i++) {
        const trigger = seoItems.nth(i).locator('.accordion-title');
        const content = seoItems.nth(i).locator('.accordion-inner');
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(trigger).not.toHaveClass(/active/);
        await expect(content).toHaveCSS('display', 'none');
      }

      // Multiple accordion in topic section: all closed
      const topicItems = page.locator('[data-testid="topic-faq-section"] .accordion-item');
      const topicCount = await topicItems.count();
      expect(topicCount).toBeGreaterThan(0);

      for (let i = 0; i < topicCount; i++) {
        const trigger = topicItems.nth(i).locator('.accordion-title');
        const content = topicItems.nth(i).locator('.accordion-inner');
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await expect(trigger).not.toHaveClass(/active/);
        await expect(content).toHaveCSS('display', 'none');
      }
    });
  }

  test('DOM matches eras-clone structure for the first item on service list', async ({ page }) => {
    await page.goto('/dev-fixtures/faq/default');

    const root = page.locator('[data-testid="seo-faq-section"] .accordion');
    await expect(root).toHaveClass(/ac-luutru/);

    const firstItem = root.locator('.accordion-item').first();
    const trigger = firstItem.locator('.accordion-title');

    await expect(trigger).toHaveClass(/plain/);
    await expect(trigger).toHaveClass(/active/);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Toggle icon
    const toggle = trigger.locator('span.toggle');
    await expect(toggle).toHaveCount(1);
    await expect(toggle.locator('i.icon-angle-down')).toHaveCount(1);

    // Inner content
    const inner = firstItem.locator('.accordion-inner');
    await expect(inner).toHaveCount(1);
    await expect(inner).toHaveAttribute('style', /display:\s*block/);
    await expect(inner.locator('.text')).toHaveCount(1);
  });

  test('Single accordion closes previous item; collapsible toggles closed', async ({ page }) => {
    await page.goto('/dev-fixtures/faq/default');

    const seoItems = page.locator('[data-testid="seo-faq-section"] .accordion-item');
    const firstTrigger = seoItems.nth(0).locator('.accordion-title');
    const firstContent = seoItems.nth(0).locator('.accordion-inner');
    const secondTrigger = seoItems.nth(1).locator('.accordion-title');
    const secondContent = seoItems.nth(1).locator('.accordion-inner');

    // Initially first is open, second is closed
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'false');

    // Clicking second item closes first and opens second
    await secondTrigger.click();
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(firstTrigger).not.toHaveClass(/active/);
    await expect(firstContent).toHaveCSS('display', 'none');

    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(secondTrigger).toHaveClass(/active/);
    await expect(secondContent).toHaveCSS('display', 'block');

    // Clicking second item again toggles it closed
    await secondTrigger.click();
    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(secondTrigger).not.toHaveClass(/active/);
    await expect(secondContent).toHaveCSS('display', 'none');
  });

  test('Multiple accordion keeps several items open simultaneously', async ({ page }) => {
    await page.goto('/dev-fixtures/faq/default');

    const topicItems = page.locator('[data-testid="topic-faq-section"] .accordion-item');
    const firstTrigger = topicItems.nth(0).locator('.accordion-title');
    const firstContent = topicItems.nth(0).locator('.accordion-inner');
    const secondTrigger = topicItems.nth(1).locator('.accordion-title');
    const secondContent = topicItems.nth(1).locator('.accordion-inner');

    // Open first item
    await firstTrigger.click();
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(firstTrigger).toHaveClass(/active/);
    await expect(firstContent).toHaveCSS('display', 'block');

    // Open second item — first should stay open
    await secondTrigger.click();
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(firstTrigger).toHaveClass(/active/);
    await expect(firstContent).toHaveCSS('display', 'block');

    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(secondTrigger).toHaveClass(/active/);
    await expect(secondContent).toHaveCSS('display', 'block');
  });

  test('Keyboard interaction: Enter, Space, and ArrowDown work', async ({ page }) => {
    await page.goto('/dev-fixtures/faq/default');

    const seoItems = page.locator('[data-testid="seo-faq-section"] .accordion-item');
    const firstTrigger = seoItems.nth(0).locator('.accordion-title');
    const secondTrigger = seoItems.nth(1).locator('.accordion-title');

    // Focus first trigger
    await firstTrigger.focus();
    await expect(firstTrigger).toBeFocused();

    // Enter toggles first item closed
    await page.keyboard.press('Enter');
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');

    // Enter toggles first item open again
    await page.keyboard.press('Enter');
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');

    // Space toggles first item closed
    await page.keyboard.press('Space');
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');

    // Space toggles first item open
    await page.keyboard.press('Space');
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');

    // ArrowDown moves focus to the next trigger
    await page.keyboard.press('ArrowDown');
    await expect(secondTrigger).toBeFocused();

    // Space on second trigger opens it and closes first
    await page.keyboard.press('Space');
    await expect(secondTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('Variant comparison: edited FAQ differs, SEO A05 revision answer remains identical', async ({
    page,
  }) => {
    // 1. Visit default variant
    await page.goto('/dev-fixtures/faq/default');

    const defaultFirstFaq = page
      .locator('[data-testid="seo-faq-section"] .accordion-item')
      .first()
      .locator('.accordion-inner');
    const defaultFirstHtml = await defaultFirstFaq.innerHTML();

    // Locate SEO FAQ #7 (A05 revision item with id accordion-faq-vi-752892835)
    const defaultA05Faq = page.locator(
      '[data-testid="seo-faq-section"] #accordion-faq-vi-752892835-content',
    );
    const defaultA05Html = await defaultA05Faq.innerHTML();

    // The SEO revision (not the base answer) is rendered: only it carries the escaped `</p` text
    expect(defaultA05Html).toContain('&lt;/p');

    // 2. Visit changed variant
    await page.goto('/dev-fixtures/faq/changed');

    const changedFirstFaq = page
      .locator('[data-testid="seo-faq-section"] .accordion-item')
      .first()
      .locator('.accordion-inner');
    const changedFirstHtml = await changedFirstFaq.innerHTML();

    const changedA05Faq = page.locator(
      '[data-testid="seo-faq-section"] #accordion-faq-vi-752892835-content',
    );
    const changedA05Html = await changedA05Faq.innerHTML();

    // The edited FAQ has different HTML in changed variant
    expect(changedFirstHtml).not.toBe(defaultFirstHtml);
    expect(changedFirstHtml).toContain('Nội dung câu hỏi FAQ đã được chỉnh sửa');

    // The SEO A05 revision panel HTML is completely identical between default and changed
    expect(changedA05Html).toBe(defaultA05Html);
  });
});
