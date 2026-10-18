import { test as base, expect, type Locator, type Page } from '@playwright/test';

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
    if (effectiveStagingHost && (hostname === effectiveStagingHost || hostname === 'vercel.live')) {
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

export async function expectNoClientStorage(page: Page) {
  const storage = await page.evaluate(() => ({
    local: localStorage.length,
    session: sessionStorage.length,
  }));
  expect(storage.local).toBe(0);
  expect(storage.session).toBe(0);

  const cookies = await page.context().cookies();
  expect(cookies).toEqual([]);
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

export async function installListenerCounter(page: Page) {
  await page.addInitScript(() => {
    // Composite map: target (Window | Document) -> type -> Set<listener_capture_key>
    // or Map keyed by listener with Set/Map of contexts to preserve exact object identity
    const windowListeners = new Map<
      string,
      Map<EventListenerOrEventListenerObject, Set<boolean>>
    >();
    const docListeners = new Map<string, Map<EventListenerOrEventListenerObject, Set<boolean>>>();

    function getRegistry(target: EventTarget) {
      return target === window ? windowListeners : docListeners;
    }

    function normalizeCapture(
      options?: boolean | AddEventListenerOptions | EventListenerOptions,
    ): boolean {
      if (typeof options === 'boolean') return options;
      return Boolean(options?.capture);
    }

    const origAdd = EventTarget.prototype.addEventListener;
    const origRemove = EventTarget.prototype.removeEventListener;

    EventTarget.prototype.addEventListener = function (
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (listener && (this === window || this === document)) {
        const registry = getRegistry(this);
        let typeMap = registry.get(type);
        if (!typeMap) {
          typeMap = new Map();
          registry.set(type, typeMap);
        }
        let captureSet = typeMap.get(listener);
        if (!captureSet) {
          captureSet = new Set();
          typeMap.set(listener, captureSet);
        }
        captureSet.add(normalizeCapture(options));
      }
      return origAdd.call(this, type, listener as EventListenerOrEventListenerObject, options);
    };

    EventTarget.prototype.removeEventListener = function (
      this: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | EventListenerOptions,
    ) {
      if (listener && (this === window || this === document)) {
        const registry = getRegistry(this);
        const typeMap = registry.get(type);
        if (typeMap) {
          const captureSet = typeMap.get(listener);
          if (captureSet) {
            captureSet.delete(normalizeCapture(options));
            if (captureSet.size === 0) {
              typeMap.delete(listener);
            }
          }
          if (typeMap.size === 0) {
            registry.delete(type);
          }
        }
      }
      return origRemove.call(this, type, listener as EventListenerOrEventListenerObject, options);
    };

    (window as unknown as { __liveListeners: () => Record<string, number> }).__liveListeners =
      () => {
        const counts: Record<string, number> = {};
        for (const registry of [windowListeners, docListeners]) {
          for (const [type, typeMap] of registry.entries()) {
            let count = 0;
            for (const captureSet of typeMap.values()) {
              count += captureSet.size;
            }
            if (count > 0) {
              counts[type] = (counts[type] || 0) + count;
            }
          }
        }
        return counts;
      };
  });
}

function isMapFrameRequest(request: import('@playwright/test').Request): boolean {
  let frame: import('@playwright/test').Frame | null = request.frame();
  while (frame) {
    if (frame.parentFrame()) {
      const host = extractHostname(frame.url());
      if (host && MAPS_EMBED_ALLOWLIST.includes(host)) {
        return true;
      }
    }
    frame = frame.parentFrame();
  }
  return false;
}

export const GLOBAL_CONSOLE_ALLOW: RegExp[] = [
  // Network guard deliberate abort on un-allowlisted outbound requests
  /net::ERR_BLOCKED_BY_CLIENT/,
  ...(STAGING
    ? [
        // Vercel toolbar injection on staging
        /vercel\.live/,
        /_vercel\/insights/,
      ]
    : []),
];

/** Intentional 404 navigations: the browser logs the document's resource-load failure. */
export const ALLOW_404 = /^Failed to load resource: the server responded with a status of 404/;

/** Error fixtures: the thrown render returns a 500 and React logs redacted Server Components error #441. */
export const ALLOW_SERVER_ERROR =
  /^Failed to load resource: the server responded with a status of 500|react\.dev\/errors\/441/;

export interface FixtureOptions {
  allowConsole: RegExp[];
}

export const test = base.extend<
  FixtureOptions & {
    networkGuard: string[];
    consoleGuard: void;
  }
>({
  allowConsole: [[], { option: true }],

  consoleGuard: [
    async ({ page, allowConsole }, use) => {
      const errors: string[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error') {
          // Ignore errors originating while browsing the external eras-clone source mirror
          if (page.url().startsWith('https://erasvietnam.vn')) return;
          const loc = m.location();
          if (loc?.url) {
            try {
              const url = new URL(loc.url);
              if (url.hostname === 'erasvietnam.vn') return;
              if (url.pathname.startsWith('/fixture')) return;
              if (KNOWN_ABSENT_CSS_ASSETS.has(url.pathname)) return;
            } catch {}
          }
          errors.push(m.text());
        }
      });
      page.on('pageerror', (e) => {
        if (page.url().startsWith('https://erasvietnam.vn')) return;
        errors.push(e.message);
      });
      await use();
      const allow = [...GLOBAL_CONSOLE_ALLOW, ...allowConsole];
      const unexpected = errors.filter((t) => !allow.some((r) => r.test(t)));
      expect(unexpected, `Unexpected console/page errors:\n${unexpected.join('\n')}`).toEqual([]);
    },
    { auto: true },
  ],

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
        if (isAllowedUrl(url) || isMapFrameRequest(request)) return route.continue();
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

export async function dragSlider(page: Page, viewport: Locator, distance: number, steps = 15) {
  const box = (await viewport.boundingBox())!;
  const startX = box.x + box.width * 0.4;
  const startY = box.y + box.height / 2;
  const deltaX = Math.abs(distance) <= 1 ? Math.round(box.width * distance) : distance;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - deltaX, startY, { steps });
  await page.mouse.up();
}
