import { test, expect } from '@playwright/test'

test('System Settings: toggle dark mode changes shell root class', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('dock-icon-settings').click()
  await expect(page.locator('[data-testid="window-frame"][data-app-id="settings"]')).toBeVisible()

  // Root should start with dark class
  const root = page.getByTestId('desktop-root')
  await expect(root).toHaveClass(/dark/)

  // Toggle dark mode off
  await page.getByTestId('dark-mode-toggle').click()
  await expect(root).toHaveClass(/light/)
  await expect(root).not.toHaveClass(/dark/)

  // Toggle back on
  await page.getByTestId('dark-mode-toggle').click()
  await expect(root).toHaveClass(/dark/)
})

test('System Settings: select wallpaper changes desktop background', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('dock-icon-settings').click()

  // Get initial background
  const root = page.getByTestId('desktop-root')
  const initialBg = await root.evaluate((el) => window.getComputedStyle(el).background)

  // Go to Wallpaper section and select Sunset
  await page.getByTestId('settings-section-wallpaper').click()
  await page.getByTestId('wallpaper-sunset').click()

  // Background should change
  const newBg = await root.evaluate((el) => window.getComputedStyle(el).background)
  expect(newBg).not.toBe(initialBg)
})

test('System Settings: Dock has non-empty backdropFilter', async ({ page }) => {
  await page.goto('/')

  const dock = page.getByTestId('dock')
  const backdropFilter = await dock.evaluate((el) => window.getComputedStyle(el).backdropFilter)
  expect(backdropFilter).not.toBe('')
  expect(backdropFilter.length).toBeGreaterThan(0)
})

test('System Settings: menu bar has non-empty backdropFilter', async ({ page }) => {
  await page.goto('/')

  const menuBar = page.getByTestId('menu-bar')
  const backdropFilter = await menuBar.evaluate((el) => window.getComputedStyle(el).backdropFilter)
  expect(backdropFilter).not.toBe('')
  expect(backdropFilter.length).toBeGreaterThan(0)
})
