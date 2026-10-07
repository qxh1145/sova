import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 3100);
const stagingUrl = process.env.STAGING_URL;

if (process.env.npm_lifecycle_event === 'test:e2e:staging' && !stagingUrl) {
  throw new Error('test:e2e:staging requires STAGING_URL');
}

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: stagingUrl || `http://localhost:${port}`,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(stagingUrl
    ? {}
    : {
        webServer: {
          command: `npm run start -- --port ${port}`,
          url: `http://localhost:${port}/`,
          reuseExistingServer: !process.env.CI,
          env: {
            FIXTURE_HARNESS: '1',
          },
        },
      }),
});
