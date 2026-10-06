import { defineConfig, devices } from '@playwright/test';

const port = 3100;
const stagingUrl = process.env.STAGING_URL;
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: './tests/e2e',
  preserveOutput: 'always',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: stagingUrl || `http://localhost:${port}`,
    ...(bypassSecret
      ? {
          extraHTTPHeaders: {
            'x-vercel-protection-bypass': bypassSecret,
          },
        }
      : {}),
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
