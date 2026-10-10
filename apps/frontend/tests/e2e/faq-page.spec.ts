import { expect, expectNoDuplicateIds, test } from './fixtures';
import { faqPages } from '../../src/data/pages/faq';
import { getFAQPreset, topicSlug } from '../../src/components/faq/faqIds';
import { faqTopics } from '../../src/data/faq';

test.describe('FAQ Pages (Story FAQ Topics Page)', () => {
  for (const record of faqPages) {
    const locale = record.locale;
    const expectedPlacements = locale === 'vi' ? 65 : 66;
    const topics = faqTopics.filter((t) => t.locale === locale);

    test(`Route ${record.path} renders 200 within shell with correct banner, breadcrumbs, 7 tabs, and accordion items`, async ({
      page,
    }) => {
      const response = await page.goto(record.path);
      expect(response?.status()).toBe(200);

      // Metadata from record.seo
      expect(await page.title()).toBe(record.seo.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        record.seo.description!,
      );

      // Shell header and footer
      const header = page.locator('header#header');
      await expect(header).toBeVisible();
      const footer = page.locator('footer#footer');
      await expect(footer).toBeVisible();

      // Banner id and heading
      const preset = getFAQPreset(locale);
      const banner = page.locator(`#${preset.heroIds.banner}`);
      await expect(banner).toBeVisible();

      const h2 = banner.locator('h2');
      await expect(h2).toHaveCount(1);
      await expect(h2).toHaveText(record.title);
      await expect(h2.locator('b')).toHaveText(record.title);

      // Breadcrumb in banner
      const breadcrumb = banner.locator('p');
      await expect(breadcrumb).toBeVisible();
      const homeLink = breadcrumb.locator('a');
      await expect(homeLink).toHaveText(record.breadcrumb.homeLabel);
      await expect(homeLink).toHaveAttribute('href', locale === 'en' ? '/en/' : '/');
      const currentSpan = breadcrumb.locator('span');
      await expect(currentSpan).toHaveText(record.breadcrumb.current);

      // Section, row, col IDs
      const section = page.locator(`section#${preset.sectionId}`);
      await expect(section).toBeVisible();
      const row = section.locator(`div#${preset.rowId}`);
      await expect(row).toBeVisible();
      const col = row.locator(`div#${preset.colId}`);
      await expect(col).toBeVisible();

      // Tabs container
      const tabs = col.locator('.tabbed-content.tab_cus_new');
      await expect(tabs).toBeVisible();

      // 7 tabs in source order with source ids
      const tabTriggers = tabs.locator('ul[role="tablist"] > li > a[role="tab"]');
      await expect(tabTriggers).toHaveCount(7);

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        const slug = topicSlug(topic.label);
        const trigger = tabTriggers.nth(i);
        await expect(trigger).toHaveAttribute('id', `tab-${slug}`);
        await expect(trigger).toHaveAttribute('href', `#tab_${slug}`);
        await expect(trigger).toHaveAttribute('aria-controls', `tab_${slug}`);
        await expect(trigger.locator('span')).toHaveText(topic.label);

        const panel = tabs.locator(`div[id="tab_${slug}"][role="tabpanel"]`);
        await expect(panel).toHaveCount(1);
        await expect(panel).toHaveAttribute('aria-labelledby', `tab-${slug}`);
      }

      // Initial active tab state: first tab active
      const firstSlug = topicSlug(topics[0].label);
      await expect(tabTriggers.first()).toHaveAttribute('aria-selected', 'true');
      const firstPanel = tabs.locator(`div[id="tab_${firstSlug}"][role="tabpanel"]`);
      await expect(firstPanel).toHaveClass(/active/);

      // Total accordion items in the page
      const allAccordionItems = tabs.locator('.accordion-item');
      await expect(allAccordionItems).toHaveCount(expectedPlacements);

      // First accordion item in the first panel is open by default
      const firstAccordionTitle = firstPanel.locator('.accordion-title').first();
      await expect(firstAccordionTitle).toHaveAttribute('aria-expanded', 'true');

      // Keyboard navigation between tabs: ArrowDown, ArrowUp, End, Home
      await tabTriggers.first().focus();
      await expect(tabTriggers.first()).toBeFocused();

      // ArrowDown moves to second tab
      await page.keyboard.press('ArrowDown');
      const secondTrigger = tabTriggers.nth(1);
      await expect(secondTrigger).toBeFocused();
      await expect(secondTrigger).toHaveAttribute('aria-selected', 'true');
      await expect(tabTriggers.first()).toHaveAttribute('aria-selected', 'false');

      // ArrowUp moves back to first tab
      await page.keyboard.press('ArrowUp');
      await expect(tabTriggers.first()).toBeFocused();
      await expect(tabTriggers.first()).toHaveAttribute('aria-selected', 'true');

      // End moves to last tab
      await page.keyboard.press('End');
      const lastTrigger = tabTriggers.last();
      await expect(lastTrigger).toBeFocused();
      await expect(lastTrigger).toHaveAttribute('aria-selected', 'true');

      // Home moves back to first tab
      await page.keyboard.press('Home');
      await expect(tabTriggers.first()).toBeFocused();
      await expect(tabTriggers.first()).toHaveAttribute('aria-selected', 'true');

      // Accordion Enter/Space toggle
      await firstAccordionTitle.focus();
      await expect(firstAccordionTitle).toBeFocused();
      await expect(firstAccordionTitle).toHaveAttribute('aria-expanded', 'true');

      // Enter collapses
      await page.keyboard.press('Enter');
      await expect(firstAccordionTitle).toHaveAttribute('aria-expanded', 'false');

      // Space expands
      await page.keyboard.press('Space');
      await expect(firstAccordionTitle).toHaveAttribute('aria-expanded', 'true');

      // No duplicate IDs
      await expectNoDuplicateIds(page);
    });
  }
});
