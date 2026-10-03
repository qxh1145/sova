import { defineConfig, devices } from '@playwright/test';

const port = 3100;
// Sova compare specs (page epics) need `next start`; capture, hash and source self-compare stay server-free.
const sova = process.env.BASELINE_SOVA === '1';

// Offline source baseline harness: never part of `npm run test:e2e` or CI.
export default defineConfig({
  testDir: './tests/baseline',
  snapshotPathTemplate: '{testDir}/../../baseline/{arg}{ext}',
  updateSnapshots: 'none',
  fullyParallel: true,
  workers: 4,
  timeout: 120_000,
  expect: { timeout: 30_000 },
  reporter: 'list',
  use: {
    reducedMotion: 'reduce',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    serviceWorkers: 'block',
    ...(sova && { baseURL: `http://localhost:${port}` }),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(sova && {
    webServer: {
      command: `npm run start -- --port ${port}`,
      url: `http://localhost:${port}/`,
      reuseExistingServer: !process.env.CI,
    },
  }),
});
