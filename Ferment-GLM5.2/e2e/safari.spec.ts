import { test, expect } from '@playwright/test'

test('Safari loads example.com in an iframe', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('dock-icon-safari').click()
  await expect(page.locator('[data-testid="window-frame"][data-app-id="safari"]')).toBeVisible()

  // The default URL (example.com) should load in an iframe
  const iframe = page.locator('[data-testid="safari-iframe"]')
  await expect(iframe).toBeVisible()
  await expect(iframe).toHaveAttribute('src', 'https://example.com')
})

test('Safari shows fallback screen for blocklisted domain', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('dock-icon-safari').click()
  await expect(page.locator('[data-testid="window-frame"][data-app-id="safari"]')).toBeVisible()

  // Enter a blocklisted URL
  const urlInput = page.getByTestId('safari-url-input')
  await urlInput.fill('https://google.com')
  await urlInput.press('Enter')

  // Fallback screen should appear
  await expect(page.getByTestId('safari-fallback')).toBeVisible()
  await expect(page.getByTestId('safari-fallback-url')).toContainText('google.com')
  // Iframe should not be visible
  await expect(page.locator('[data-testid="safari-iframe"]')).not.toBeVisible()
})

test('Safari back and forward navigation works', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('dock-icon-safari').click()

  // Start at example.com (default)
  await expect(page.locator('[data-testid="safari-iframe"]')).toHaveAttribute('src', 'https://example.com')

  // Navigate to example.org
  const urlInput = page.getByTestId('safari-url-input')
  await urlInput.fill('https://example.org')
  await urlInput.press('Enter')
  await expect(page.locator('[data-testid="safari-iframe"]')).toHaveAttribute('src', 'https://example.org')

  // Go back
  await page.getByTestId('safari-back').click()
  await expect(page.locator('[data-testid="safari-iframe"]')).toHaveAttribute('src', 'https://example.com')

  // Go forward
  await page.getByTestId('safari-forward').click()
  await expect(page.locator('[data-testid="safari-iframe"]')).toHaveAttribute('src', 'https://example.org')
})

test('Safari reload button refreshes the iframe', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('dock-icon-safari').click()

  // Click reload — iframe should still be present
  await page.getByTestId('safari-reload').click()
  await expect(page.locator('[data-testid="safari-iframe"]')).toBeVisible()
  await expect(page.locator('[data-testid="safari-iframe"]')).toHaveAttribute('src', 'https://example.com')
})
