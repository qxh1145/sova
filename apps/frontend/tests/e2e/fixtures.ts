import { test as base, expect, type Page } from '@playwright/test';

// Fail-closed: any non-local host is a violation unless listed here.
export const MAPS_EMBED_ALLOWLIST = [
  'www.google.com',
  'maps.google.com',
  'maps.googleapis.com',
  'maps.gstatic.com',
];

export const KNOWN_ABSENT_CSS_ASSETS = new Set([
  '/wp-content/uploads/2024/02/Deco-1-1.svg',
  '/wp-content/uploads/2024/02/Deco-1-3-1.svg',
  '/wp-content/uploads/2024/02/Deco-1-3.svg',
  '/wp-content/uploads/2024/02/Vector.svg',
  '/wp-content/uploads/2024/02/svgexport-7.svg',
  '/wp-content/uploads/2024/03/bg_td.png',
  '/wp-content/uploads/2025/02/a067a9c40c98e463438f8a4ef6f20af3.png',
  '/wp-content/uploads/2025/04/7baaead6a082fd23a17276ebd3294f66.png',
]);

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

export const STAGING = Boolean(process.env.STAGING_URL);

function extractHostname(input?: string | null): string | null {
  if (!input) return null;
  try {
    return new URL(input.includes('://') ? input : `http://${input}`).hostname;
  } catch {
    return null;
  }
}

const defaultStagingHost = extractHostname(process.env.STAGING_URL);
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export function isAllowedUrl(url: string, overrideStagingHost?: string | null): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return true; // data:, blob:, etc.
    const effectiveStagingHost =
      overrideStagingHost !== undefined ? extractHostname(overrideStagingHost) : defaultStagingHost;
    if (effectiveStagingHost && hostname === effectiveStagingHost) {
      return true;
    }
    return LOCAL_HOSTS.includes(hostname) || MAPS_EMBED_ALLOWLIST.includes(hostname);
  } catch {
    return false;
  }
}

export async function expectNoDuplicateIds(page: Page) {
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

export const getBodyOverflow = (page: Page) =>
  page.evaluate(() => window.getComputedStyle(document.body).overflow);

export async function installRafCounter(page: Page) {
  await page.addInitScript(() => {
    let count = 0;
    const nativeRaf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => {
      count++;
      return nativeRaf(cb);
    };
    const target = window as unknown as {
      __getRafCount: () => number;
      __resetRafCount: () => void;
    };
    target.__getRafCount = () => count;
    target.__resetRafCount = () => {
      count = 0;
    };
  });
}

export const test = base.extend<{ networkGuard: string[] }>({
  networkGuard: [
    async ({ context }, use) => {
      const blocked: string[] = [];
      await context.route('**/*', (route) => {
        const request = route.request();
        const url = request.url();
        // Bypass secret goes to the staging host only, never to allowlisted third parties.
        if (bypassSecret && defaultStagingHost && extractHostname(url) === defaultStagingHost)
          return route.continue({
            headers: { ...request.headers(), 'x-vercel-protection-bypass': bypassSecret },
          });
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
