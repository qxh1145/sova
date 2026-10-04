import { test as base, expect } from '@playwright/test';

// Fail-closed: any non-local host is a violation unless listed here.
export const MAPS_EMBED_ALLOWLIST = [
  'www.google.com',
  'maps.google.com',
  'maps.googleapis.com',
  'maps.gstatic.com',
];

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

export function isAllowedUrl(url: string): boolean {
  const { protocol, hostname } = new URL(url);
  if (protocol !== 'http:' && protocol !== 'https:') return true; // data:, blob:, etc.
  return LOCAL_HOSTS.includes(hostname) || MAPS_EMBED_ALLOWLIST.includes(hostname);
}

export const test = base.extend<{ networkGuard: string[] }>({
  networkGuard: [
    async ({ context }, use) => {
      const blocked: string[] = [];
      await context.route('**/*', (route) => {
        const url = route.request().url();
        if (isAllowedUrl(url)) return route.continue();
        blocked.push(url);
        return route.abort('blockedbyclient');
      });
      await use(blocked);
      expect(blocked, `Blocked external requests:\n${blocked.join('\n')}`).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
