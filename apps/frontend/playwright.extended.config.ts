import { defineConfig, devices } from '@playwright/test';

const port = 3200;

export default defineConfig({
  testDir: './tests/extended',
  timeout: 120_000,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build:e2e && npx next start --port ${port}`,
    url: `http://localhost:${port}/`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      CONTENT_SCENARIO: 'extended',
      NEXT_DIST_DIR: '.next-extended',
    },
  },
});
