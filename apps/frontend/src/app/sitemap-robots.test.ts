import { afterEach, expect, test, vi } from 'vitest';
import sitemap from './sitemap';
import robots from './robots';
import { routes } from '@/data/routes';

afterEach(() => {
  vi.unstubAllEnvs();
});

test('sitemap generates one absolute loc per registry path (148 URLs, no aliases)', async () => {
  vi.stubEnv('SITE_URL', 'https://example.com');
  const items = await sitemap();

  expect(items).toHaveLength(148);
  expect(items.map((i) => i.url)).toEqual(routes.map((r) => `https://example.com${r.path}`));
});

test('robots generates allow rule and sitemap index URL', () => {
  vi.stubEnv('SITE_URL', 'https://example.com');
  const res = robots();

  expect(res.rules).toEqual({
    userAgent: '*',
    allow: '/',
  });
  expect(res.sitemap).toBe('https://example.com/sitemap.xml');
});
