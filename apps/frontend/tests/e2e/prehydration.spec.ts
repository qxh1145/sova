import { expect, test } from './fixtures';

// With JS disabled the page never hydrates. Every submit must stay disabled so a
// native submit cannot send field values (GET puts them in the URL).
const cases = [
  { path: '/lien-he/', field: 'input[name="your-name"]', value: 'Nguyen Van A' },
  { path: '/en/contact-us/', field: 'input[name="your-name"]', value: 'John Doe' },
  { path: '/thiet-ke-website/', field: 'input[name="your-name"]', value: 'Nguyen Van A' },
  { path: '/en/website-development/', field: 'input[name="your-name"]', value: 'John Doe' },
  { path: '/login-sova/', field: '#user_login', value: 'testuser' },
];

test.describe('Pre-hydration submit guard', () => {
  for (const { path, field, value } of cases) {
    test(`all submits disabled and Enter does not submit on ${path}`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(path);

      const submits = page.locator('form input[type="submit"], form button[type="submit"]');
      expect(await submits.count()).toBeGreaterThan(0);
      for (const submit of await submits.all()) {
        await expect(submit).toBeDisabled();
      }

      // A native submit is a navigation request (GET or POST); none may happen.
      const navigations: string[] = [];
      page.on('request', (request) => {
        if (request.isNavigationRequest()) navigations.push(`${request.method()} ${request.url()}`);
      });

      const input = page.locator(field).first();
      await input.fill(value);
      if (path === '/login-sova/') await page.locator('#user_pass').fill('secret123');
      await input.press('Enter');

      await page.waitForLoadState('load');
      expect(navigations).toEqual([]);
      expect(new URL(page.url()).pathname).toBe(path);
      expect(new URL(page.url()).search).toBe('');

      await context.close();
    });
  }
});
