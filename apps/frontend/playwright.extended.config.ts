import { defineConfig, devices } from '@playwright/test';

const port = 3200;

export default defineConfig({
  testDir: './tests/extended',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx next dev --port ${port}`,
    url: `http://localhost:${port}/`,
    reuseExistingServer: false,
    env: {
      CONTENT_SCENARIO: 'extended',
    },
  },
});
