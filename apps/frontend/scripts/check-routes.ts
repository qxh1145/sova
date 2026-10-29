// Post-build / staging crawl (CAP-2): crawl every registry route and alias over HTTP against
// STAGING_URL or local next start, and fail on any CAP-2 violation.
import { routes } from '../src/data/routes.ts';
import { RENAMED_PATHS } from '../src/lib/content/brand.ts';

const BASE_URL = (
  process.env.STAGING_URL || `http://localhost:${process.env.PORT || 3000}`
).replace(/\/+$/, '');
const BASE_ORIGIN = new URL(BASE_URL).origin;
const BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

function requestHeaders(url: string): HeadersInit | undefined {
  return BYPASS_SECRET && new URL(url).origin === BASE_ORIGIN
    ? { 'x-vercel-protection-bypass': BYPASS_SECRET }
    : undefined;
}

const CONCURRENCY = 8;
const MAX_HOPS = 5;
const REQUEST_TIMEOUT_MS = 10000;
const REDIRECT_STATUSES = new Set([301, 302, 307, 308]);

// ROUTE_MAP excluded families plus the hidden storage/email services (from
// src/data/navigation.test.ts:17-21) and the hidden WordPress sample page.
const EXCLUDED_RE =
  /^\/(?:en\/)?(?:tuyen-dung|giai-phap-truyen-thong-so|digital-communications-solutions|e-mail-doanh-nghiep|giai-phap-luu-tru|hosting-doanh-nghiep|vps-doanh-nghiep|business-e-mail|business-hosting|business-vps|storage-solution|sample-page)\//;

const UNKNOWN_SLUGS = ['/featured_item/khong-ton-tai-xyz/', '/khong-ton-tai-xyz/'];

const REMOVED_ROUTES = [
  '/tuyen-dung/',
  '/en/tuyen-dung/',
  '/giai-phap-truyen-thong-so/',
  '/en/digital-communications-solutions/',
  // Storage, email, hosting and VPS are hidden until further notice (stakeholder review 2026-10-27).
  '/giai-phap-luu-tru/',
  '/en/storage-solution/',
  '/e-mail-doanh-nghiep/',
  '/en/business-e-mail/',
  '/hosting-doanh-nghiep/',
  '/en/business-hosting/',
  '/vps-doanh-nghiep/',
  '/en/business-vps/',
  // WordPress "Sample Page" leftover, hidden (stakeholder review 2026-10-27).
  '/sample-page/',
];

function isRemovedRouteHref(href: string, pageUrl: string): boolean {
  try {
    const url = new URL(href, pageUrl);
    if (url.origin !== BASE_ORIGIN) return false;
    const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
    return EXCLUDED_RE.test(path) || Object.hasOwn(RENAMED_PATHS, path);
  } catch {
    return false;
  }
}

async function runConcurrent<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const i = index++;
      await fn(items[i]);
    }
  });
  await Promise.all(workers);
}

async function checkKeptRoute(path: string, failures: string[]): Promise<void> {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: requestHeaders(url),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (res.status !== 200) {
      failures.push(`${path}: got ${res.status}`);
      return;
    }
    const html = await res.text();
    const badHrefs = new Set<string>();
    for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
      const href = match[1].trim();
      if (isRemovedRouteHref(href, url)) {
        badHrefs.add(href);
      }
    }
    for (const href of badHrefs) {
      failures.push(`${path}: links to ${href}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`${path}: ${msg}`);
  }
}

async function checkAlias(alias: string, canonical: string, failures: string[]): Promise<void> {
  let currentUrl = `${BASE_URL}${alias}`;
  const visited = new Set<string>([currentUrl]);
  let hops = 0;

  try {
    while (true) {
      const res = await fetch(currentUrl, {
        redirect: 'manual',
        headers: requestHeaders(currentUrl),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (REDIRECT_STATUSES.has(res.status)) {
        const location = res.headers.get('location');
        if (!location) {
          failures.push(`${alias}: redirect missing location header`);
          break;
        }
        const nextUrl = new URL(location, currentUrl).href;
        if (visited.has(nextUrl)) {
          failures.push(`${alias}: redirect loop detected (${nextUrl})`);
          break;
        }
        hops++;
        if (hops > MAX_HOPS) {
          failures.push(`${alias}: exceeded ${MAX_HOPS} hops`);
          break;
        }
        visited.add(nextUrl);
        currentUrl = nextUrl;
      } else if (res.status === 200) {
        if (hops === 0) {
          failures.push(`${alias}: expected redirect, got 200`);
          break;
        }
        const target = new URL(currentUrl);
        if (target.origin !== BASE_ORIGIN || target.pathname !== canonical) {
          failures.push(
            `${alias}: wrong target ${target.origin !== BASE_ORIGIN ? target.href : target.pathname}, expected ${canonical}`,
          );
        }
        break;
      } else {
        failures.push(`${alias}: got ${res.status}`);
        break;
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`${alias}: ${msg}`);
  }
}

async function checkUnknownSlug(slug: string, failures: string[]): Promise<void> {
  const url = `${BASE_URL}${slug}`;
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: requestHeaders(url),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (res.status !== 404) {
      failures.push(`${slug}: got ${res.status}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`${slug}: ${msg}`);
  }
}

// Renamed paths must answer 301 straight to the new path (query kept), not 308 or a chain.
async function checkRenamed(from: string, to: string, failures: string[]): Promise<void> {
  const url = `${BASE_URL}${from}?q=1`;
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: requestHeaders(url),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const location = res.headers.get('location');
    const target = location ? new URL(location, url) : null;
    if (res.status !== 301) failures.push(`${from}: got ${res.status}, expected 301`);
    else if (target?.origin !== BASE_ORIGIN || `${target.pathname}${target.search}` !== `${to}?q=1`)
      failures.push(`${from}: Location ${location}, expected ${to}?q=1`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`${from}: ${msg}`);
  }
}

async function checkRemovedRoute(route: string, failures: string[]): Promise<void> {
  const url = `${BASE_URL}${route}`;
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: requestHeaders(url),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (res.status !== 404) {
      failures.push(`${route}: got ${res.status}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`${route}: ${msg}`);
  }
}

type Task =
  | { kind: 'kept'; path: string }
  | { kind: 'alias'; alias: string; canonical: string }
  | { kind: 'unknown'; path: string }
  | { kind: 'removed'; path: string }
  | { kind: 'renamed'; from: string; to: string };

const aliasTasks: Task[] = routes.flatMap((r) =>
  r.aliases.map((alias) => ({ kind: 'alias' as const, alias, canonical: r.path })),
);
const keptTasks: Task[] = routes.map((r) => ({ kind: 'kept' as const, path: r.path }));
const unknownTasks: Task[] = UNKNOWN_SLUGS.map((path) => ({ kind: 'unknown' as const, path }));
const removedTasks: Task[] = REMOVED_ROUTES.map((path) => ({ kind: 'removed' as const, path }));
const renamedTasks: Task[] = Object.entries(RENAMED_PATHS).map(([from, to]) => ({
  kind: 'renamed' as const,
  from,
  to,
}));

const allTasks: Task[] = [
  ...keptTasks,
  ...aliasTasks,
  ...unknownTasks,
  ...removedTasks,
  ...renamedTasks,
];

const failures: string[] = [];

await runConcurrent(allTasks, CONCURRENCY, async (task) => {
  switch (task.kind) {
    case 'kept':
      await checkKeptRoute(task.path, failures);
      break;
    case 'alias':
      await checkAlias(task.alias, task.canonical, failures);
      break;
    case 'unknown':
      await checkUnknownSlug(task.path, failures);
      break;
    case 'removed':
      await checkRemovedRoute(task.path, failures);
      break;
    case 'renamed':
      await checkRenamed(task.from, task.to, failures);
      break;
  }
});

if (failures.length > 0) {
  failures.sort();
  console.error(`check:routes found ${failures.length} failure(s):\n${failures.join('\n')}`);
  process.exit(1);
}

console.log(`check:routes: ${allTasks.length} URLs ok`);
