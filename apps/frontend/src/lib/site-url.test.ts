import { afterEach, expect, test, vi } from 'vitest';
import { getSiteUrl } from './site-url';

afterEach(() => {
  vi.unstubAllEnvs();
});

test('SITE_URL wins and loses its trailing slash', () => {
  vi.stubEnv('SITE_URL', 'https://example.com/');
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'sova.vercel.app');
  expect(getSiteUrl()).toBe('https://example.com');
});

test('falls back to https VERCEL_PROJECT_PRODUCTION_URL', () => {
  vi.stubEnv('SITE_URL', '');
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'sova.vercel.app');
  expect(getSiteUrl()).toBe('https://sova.vercel.app');
});

test('falls back to localhost on PORT, default 3000', () => {
  vi.stubEnv('SITE_URL', '');
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
  vi.stubEnv('PORT', '3100');
  expect(getSiteUrl()).toBe('http://localhost:3100');
  vi.stubEnv('PORT', undefined);
  expect(getSiteUrl()).toBe('http://localhost:3000');
});
