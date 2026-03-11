import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: 'https://corporate-voucher-stg.fam-stg.click',
    trace: 'on-first-retry',
    screenshot: 'on', // Changed from 'only-on-failure' to 'on' to capture all tests
    video: 'on', // Changed from 'retain-on-failure' to 'on' to record all tests
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },
  timeout: 120000,
  expect: {
    timeout: 10000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
