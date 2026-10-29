import { execFile } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';
import { routes } from '../src/data/routes.ts';
import { RENAMED_PATHS } from '../src/lib/content/brand.ts';

const execFileAsync = promisify(execFile);
const SCRIPT = path.join(__dirname, 'check-routes.ts');

const keptPathSet = new Set<string>(routes.map((r) => r.path));
const aliasMap = new Map<string, string>();
for (const r of routes) {
  for (const a of r.aliases) {
    aliasMap.set(a, r.path);
  }
}
// kept + aliases + 2 unknown slugs + 4 removed roots + 8 hidden service roots + sample page + renamed
const TOTAL = routes.length + aliasMap.size + 15 + Object.keys(RENAMED_PATHS).length;

type OverrideHandler = (req: http.IncomingMessage, res: http.ServerResponse) => boolean;

let server: http.Server;
let baseUrl: string;
let override: OverrideHandler | null = null;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    if (override && override(req, res)) {
      return;
    }
    const url = req.url ?? '/';
    const [pathname, query] = url.split('?');
    if (Object.hasOwn(RENAMED_PATHS, pathname)) {
      res.writeHead(301, { Location: `${RENAMED_PATHS[pathname]}?${query}` });
      res.end();
      return;
    }
    if (aliasMap.has(url)) {
      res.writeHead(307, { Location: aliasMap.get(url)! });
      res.end();
      return;
    }
    if (keptPathSet.has(url)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<!DOCTYPE html><html><body><a href="/legal/">Link</a></body></html>');
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address() as { port: number };
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

beforeEach(() => {
  override = null;
});

async function runCheckRoutes(url = baseUrl, secret?: string) {
  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', SCRIPT],
      {
        env: { ...process.env, STAGING_URL: url, VERCEL_AUTOMATION_BYPASS_SECRET: secret ?? '' },
        encoding: 'utf8',
      },
    );
    return { status: 0, stdout, stderr };
  } catch (err: unknown) {
    const error = err as { code?: number; stdout?: string; stderr?: string };
    return {
      status: error.code ?? 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? '',
    };
  }
}

test('all routes, aliases, unknown slugs, and removed routes pass when server behaves correctly', async () => {
  const { status, stdout } = await runCheckRoutes();
  expect(status).toBe(0);
  expect(stdout).toContain(`check:routes: ${TOTAL} URLs ok`);
});

test('one registry path 404 (removed page) fails naming it', async () => {
  override = (req, res) => {
    if (req.url === '/login-sova/') {
      res.writeHead(404);
      res.end('Not Found');
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/login-sova/: got 404');
});

test('alias redirecting to itself fails', async () => {
  override = (req, res) => {
    if (req.url === '/en/') {
      res.writeHead(307, { Location: '/en/' });
      res.end();
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/en/: redirect loop detected');
});

test('page linking /tuyen-dung/ fails', async () => {
  override = (req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body><a href="/tuyen-dung/">Tuyển dụng</a></body></html>');
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/: links to /tuyen-dung/');
});

test('unknown slug returning 200 fails', async () => {
  override = (req, res) => {
    if (req.url === '/khong-ton-tai-xyz/') {
      res.writeHead(200);
      res.end('unexpected 200');
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/khong-ton-tai-xyz/: got 200');
});

test('removed route returning 200 fails', async () => {
  override = (req, res) => {
    if (req.url === '/tuyen-dung/') {
      res.writeHead(200);
      res.end('unexpected 200');
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/tuyen-dung/: got 200');
});

test('alias ending at wrong target fails', async () => {
  override = (req, res) => {
    if (req.url === '/en/') {
      res.writeHead(307, { Location: '/wrong-target/' });
      res.end();
      return true;
    }
    if (req.url === '/wrong-target/') {
      res.writeHead(200);
      res.end('ok');
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/en/: wrong target /wrong-target/, expected /en/home/');
});

test('alias exceeding 5 hops fails', async () => {
  override = (req, res) => {
    if (req.url?.startsWith('/hop-')) {
      const hop = Number.parseInt(req.url.replace('/hop-', ''), 10);
      res.writeHead(307, { Location: `/hop-${hop + 1}` });
      res.end();
      return true;
    }
    if (req.url === '/en/') {
      res.writeHead(307, { Location: '/hop-1' });
      res.end();
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/en/: exceeded 5 hops');
});

test('server down fails and reports error', async () => {
  const { status, stderr } = await runCheckRoutes('http://127.0.0.1:59999');
  expect(status).toBe(1);
  expect(stderr).toContain(`check:routes found ${TOTAL} failure(s):`);
});

test('external link with removed route pathname does not fail', async () => {
  override = (req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(
        '<html><body><a href="https://external.example.com/tuyen-dung/">External Jobs</a></body></html>',
      );
      return true;
    }
    return false;
  };
  const { status, stdout } = await runCheckRoutes();
  expect(status).toBe(0);
  expect(stdout).toContain(`check:routes: ${TOTAL} URLs ok`);
});

test('alias redirecting off-site fails even if pathname matches canonical', async () => {
  const externalServer = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('ok');
  });
  await new Promise<void>((resolve) => externalServer.listen(0, '127.0.0.1', () => resolve()));
  const extPort = (externalServer.address() as { port: number }).port;

  override = (req, res) => {
    if (req.url === '/en/') {
      res.writeHead(307, { Location: `http://127.0.0.1:${extPort}/en/home/` });
      res.end();
      return true;
    }
    return false;
  };

  try {
    const { status, stderr } = await runCheckRoutes();
    expect(status).toBe(1);
    expect(stderr).toContain(
      `/en/: wrong target http://127.0.0.1:${extPort}/en/home/, expected /en/home/`,
    );
  } finally {
    await new Promise<void>((resolve) => externalServer.close(() => resolve()));
  }
});

function redirectChain(prefix: string, hops: number): OverrideHandler {
  // /en/ -> /<prefix>-1/ -> ... -> /en/home/, `hops` redirects in total
  return (req, res) => {
    const url = req.url ?? '';
    const step = url === '/en/' ? 0 : Number(url.match(new RegExp(`^/${prefix}-(\\d+)/$`))?.[1]);
    if (Number.isNaN(step)) return false;
    const next = step + 1 === hops ? '/en/home/' : `/${prefix}-${step + 1}/`;
    res.writeHead(307, { Location: next });
    res.end();
    return true;
  };
}

test('alias chain of exactly 5 hops passes', async () => {
  override = redirectChain('ok', 5);
  const { status, stdout } = await runCheckRoutes();
  expect(status).toBe(0);
  expect(stdout).toContain(`check:routes: ${TOTAL} URLs ok`);
});

test('alias chain of 6 hops fails', async () => {
  override = redirectChain('long', 6);
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/en/: exceeded 5 hops');
});

test('alias returning 200 directly fails', async () => {
  override = (req, res) => {
    if (req.url === '/en/') {
      res.writeHead(200);
      res.end('ok');
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/en/: expected redirect, got 200');
});

test('alias redirect without Location header fails', async () => {
  override = (req, res) => {
    if (req.url === '/en/') {
      res.writeHead(307);
      res.end();
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/en/: redirect missing location header');
});

test('kept route answering with a redirect fails', async () => {
  override = (req, res) => {
    if (req.url === '/login-sova/') {
      res.writeHead(308, { Location: '/login-sova' });
      res.end();
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/login-sova/: got 308');
});

test('renamed path answering 308 or the wrong Location fails', async () => {
  override = (req, res) => {
    if (req.url === '/login-eras/?q=1') {
      res.writeHead(308, { Location: '/login-sova/?q=1' });
      res.end();
      return true;
    }
    if (req.url === '/ho-so-nang-luc-eras-vietnam/?q=1') {
      res.writeHead(301, { Location: '/ho-so-nang-luc-sova/' });
      res.end();
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/login-eras/: got 308, expected 301');
  expect(stderr).toContain(
    '/ho-so-nang-luc-eras-vietnam/: Location /ho-so-nang-luc-sova/, expected /ho-so-nang-luc-sova/?q=1',
  );
});

test('page linking an old renamed path fails', async () => {
  override = (req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body><a href="/login-eras/?action=register">Login</a></body></html>');
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/: links to /login-eras/?action=register');
});

test('unknown featured_item slug returning 200 fails', async () => {
  override = (req, res) => {
    if (req.url === '/featured_item/khong-ton-tai-xyz/') {
      res.writeHead(200);
      res.end('unexpected 200');
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain('/featured_item/khong-ton-tai-xyz/: got 200');
});

test('absolute same-origin link to removed route fails', async () => {
  override = (req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<html><body><a href="${baseUrl}/en/tuyen-dung/">Jobs</a></body></html>`);
      return true;
    }
    return false;
  };
  const { status, stderr } = await runCheckRoutes();
  expect(status).toBe(1);
  expect(stderr).toContain(`/: links to ${baseUrl}/en/tuyen-dung/`);
});

test('relative href resolves against the page URL', async () => {
  override = (req, res) => {
    if (req.url === '/en/home/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body><a href="tuyen-dung/">Nested</a></body></html>');
      return true;
    }
    return false;
  };
  const { status, stdout } = await runCheckRoutes();
  expect(status).toBe(0);
  expect(stdout).toContain(`check:routes: ${TOTAL} URLs ok`);
});

test('bypass header authenticates same-origin routes without leaking to redirects', async () => {
  const secret = 'test-bypass-secret';
  const externalServer = http.createServer((req, res) => {
    if (req.headers['x-vercel-protection-bypass']) {
      res.writeHead(418);
    } else {
      res.writeHead(200);
    }
    res.end('ok');
  });
  await new Promise<void>((resolve) => externalServer.listen(0, '127.0.0.1', () => resolve()));
  const port = (externalServer.address() as { port: number }).port;
  override = (req, res) => {
    if (req.headers['x-vercel-protection-bypass'] !== secret) {
      res.writeHead(302, { Location: '/login' });
      res.end();
      return true;
    }
    if (req.url === '/en/') {
      res.writeHead(307, { Location: `http://127.0.0.1:${port}/en/home/` });
      res.end();
      return true;
    }
    return false;
  };
  try {
    const { status, stderr } = await runCheckRoutes(baseUrl, secret);
    expect(status).toBe(1);
    expect(stderr).toContain('/en/: wrong target');
    expect(stderr).toContain('check:routes found 1 failure(s)');
    expect(stderr).not.toContain('got 302');
    expect(stderr).not.toContain('got 418');
    expect(stderr).not.toContain(secret);
  } finally {
    await new Promise<void>((resolve) => externalServer.close(() => resolve()));
  }
});
