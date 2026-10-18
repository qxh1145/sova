import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.RESPONSIVE_PORT ?? 3100);

export default defineConfig({
  testDir: './tests/responsive',
  fullyParallel: true,
  workers: 4,
  timeout: 600_000,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${port}`,
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
    locale: 'vi-VN',
  },
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: `http://localhost:${port}/`,
    reuseExistingServer: !process.env.CI,
  },
});
