import { expect, test } from './fixtures';

test('home renders the company name from mock SiteSettings', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.getByText('Sova').first()).toBeVisible();
});
