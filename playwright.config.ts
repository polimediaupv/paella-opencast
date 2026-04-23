import { defineConfig, devices } from '@playwright/test'
import type { GitHubActionOptions } from '@estruyf/github-actions-reporter';

const engageRoot = './examples/engage-paella-player'

export default defineConfig({
  testDir: `${engageRoot}/e2e`,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI     
    ? [['list'], ['html', { open: 'never' }], ['@estruyf/github-actions-reporter', <GitHubActionOptions>{
        title: 'Playwright Test Results',
        useDetails: true,
        showError: true
      }]]     
    : [['list'], ['html', { open: 'never' }]],

  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://127.0.0.1:7070/paella8/ui',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev --workspace=engage-paella-player -- --host 127.0.0.1 --strictPort',
    
    url: 'http://127.0.0.1:7070/paella8/ui/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // }
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // }

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // }
  ],
})
