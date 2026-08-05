import { test, expect } from '@playwright/test'

test.describe('macOS Tahoe Web Shell — E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('desktop shell loads with wallpaper, menu bar, and dock', async ({ page }) => {
    await expect(page.getByTestId('desktop')).toBeVisible()
    await expect(page.getByTestId('menu-bar')).toBeVisible()
    await expect(page.getByTestId('dock')).toBeVisible()
  })

  test('opens Finder window from Dock', async ({ page }) => {
    await page.getByTestId('dock-item-finder').click()
    await expect(page.getByTestId('finder-app')).toBeVisible()
    await expect(page.getByTestId('window-frame')).toBeVisible()
  })

  test('Spotlight opens and launches an app', async ({ page }) => {
    await page.getByTestId('menu-spotlight').click()
    await expect(page.getByTestId('spotlight-panel')).toBeVisible()
    const input = page.getByTestId('spotlight-input')
    await input.fill('calc')
    await expect(page.getByTestId('spotlight-result-calculator')).toBeVisible()
    await input.press('Enter')
    await expect(page.getByTestId('calculator-app')).toBeVisible()
  })

  test('Control Center toggles Do Not Disturb', async ({ page }) => {
    await page.getByTestId('menu-control-center').click()
    await expect(page.getByTestId('control-center-panel')).toBeVisible()
    const dnd = page.getByTestId('cc-dnd')
    await expect(dnd).toHaveAttribute('aria-pressed', 'false')
    await dnd.click()
    await expect(dnd).toHaveAttribute('aria-pressed', 'true')
  })

  test('window can be minimized and closed', async ({ page }) => {
    await page.getByTestId('dock-item-finder').click()
    const frame = page.getByTestId('window-frame')
    await expect(frame).toBeVisible()

    await page.getByTestId('window-minimize').click()
    await expect(frame).toBeHidden()

    await page.getByTestId('dock-item-finder').click()
    await expect(frame).toBeVisible()
    await page.getByTestId('window-close').click()
    await expect(page.getByTestId('finder-app')).toBeHidden()
  })
})
