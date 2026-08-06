import { test, expect } from '@playwright/test'

/**
 * Step-1 shell smoke test: dev server boots and the desktop, transparent
 * menu bar, and Dock are present. Extended per-element in later steps.
 */
test('desktop shell boots', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('desktop')).toBeVisible()
  await expect(page.getByTestId('menu-bar')).toBeVisible()
  await expect(page.getByTestId('dock')).toBeVisible()
})
