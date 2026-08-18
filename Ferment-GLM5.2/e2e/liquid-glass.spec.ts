import { test, expect } from '@playwright/test'

test('Liquid Glass backdropFilter is applied on all glass surfaces', async ({ page }) => {
  await page.goto('/')

  // 1. Dock
  const dock = page.getByTestId('dock')
  const dockBF = await dock.evaluate((el) => window.getComputedStyle(el).backdropFilter)
  expect(dockBF.length).toBeGreaterThan(0)
  expect(dockBF).toContain('blur')

  // 2. Menu bar
  const menuBar = page.getByTestId('menu-bar')
  const menuBF = await menuBar.evaluate((el) => window.getComputedStyle(el).backdropFilter)
  expect(menuBF.length).toBeGreaterThan(0)
  expect(menuBF).toContain('blur')

  // 3. Control Center panel — open it first
  await page.getByTestId('control-center-button').click()
  const ccPanel = page.getByTestId('control-center-panel')
  await expect(ccPanel).toBeVisible()
  const ccBF = await ccPanel.evaluate((el) => window.getComputedStyle(el).backdropFilter)
  expect(ccBF.length).toBeGreaterThan(0)
  expect(ccBF).toContain('blur')

  // Close Control Center by clicking outside
  await page.mouse.click(400, 300)

  // 4. Window frame (titlebar area has the glass material on the frame itself)
  await page.getByTestId('dock-icon-calculator').click()
  const winFrame = page.locator('[data-testid="window-frame"][data-app-id="calculator"]')
  await expect(winFrame).toBeVisible()
  const winBF = await winFrame.evaluate((el) => window.getComputedStyle(el).backdropFilter)
  expect(winBF.length).toBeGreaterThan(0)
  expect(winBF).toContain('blur')
})

test('Liquid Glass saturate filter is applied', async ({ page }) => {
  await page.goto('/')

  const dock = page.getByTestId('dock')
  const dockBF = await dock.evaluate((el) => window.getComputedStyle(el).backdropFilter)
  expect(dockBF).toContain('saturate')
})
