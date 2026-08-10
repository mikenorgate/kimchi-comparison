import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for macOS Tahoe Web Recreation.
 *
 * Starts the Vite dev server on port 5173 and runs Chromium e2e tests.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5180',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm exec vite --port 5180 --strictPort',
    url: 'http://localhost:5180',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
