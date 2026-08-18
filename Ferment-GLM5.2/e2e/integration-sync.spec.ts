import { test, expect } from '@playwright/test'

test('Active-app menu reflects the focused window', async ({ page }) => {
  await page.goto('/')

  // Initially no windows open → menu bar shows "Finder"
  await expect(page.getByTestId('active-app-menu')).toHaveText('Finder')

  // Open Calculator → menu shows "Calculator"
  await page.getByTestId('dock-icon-calculator').click()
  await expect(page.getByTestId('active-app-menu')).toHaveText('Calculator')

  // Open Notes → menu switches to "Notes" (newer window = higher z)
  await page.getByTestId('dock-icon-notes').click()
  await expect(page.getByTestId('active-app-menu')).toHaveText('Notes')

  // Click back on Calculator window titlebar → menu switches back
  await page.locator('[data-testid="window-frame"][data-app-id="calculator"] [data-testid="window-titlebar"]').click()
  await expect(page.getByTestId('active-app-menu')).toHaveText('Calculator')
})

test('Dock indicator dot appears for open windows and disappears on close', async ({ page }) => {
  await page.goto('/')

  // Before opening — indicator should be transparent (not visible)
  const calcIndicator = page.getByTestId('dock-indicator-calculator')
  await expect(calcIndicator).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

  // Open Calculator — indicator should appear (white dot)
  await page.getByTestId('dock-icon-calculator').click()
  await expect(calcIndicator).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.9)')

  // Close the window — indicator should disappear
  await page.locator('[data-testid="window-frame"][data-app-id="calculator"] [data-testid="window-close"]').click()
  await expect(calcIndicator).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
})

test('Mission Control tiles update as windows open', async ({ page }) => {
  await page.goto('/')

  // Open two apps
  await page.getByTestId('dock-icon-calculator').click()
  await page.getByTestId('dock-icon-notes').click()

  // Open Mission Control via event
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent('toggle-mission-control'))
  })

  const overlay = page.getByTestId('mission-control-overlay')
  await expect(overlay).toBeVisible()

  // Should have 2 window tiles
  const tiles = page.locator('[data-testid^="mission-control-tile-"]')
  await expect(tiles).toHaveCount(2)

  // Close Mission Control
  await page.keyboard.press('Escape')
  await expect(overlay).not.toBeVisible()

  // Open a third app
  await page.getByTestId('dock-icon-calendar').click()

  // Reopen Mission Control — should now have 3 tiles
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent('toggle-mission-control'))
  })
  await expect(overlay).toBeVisible()
  await expect(tiles).toHaveCount(3)
})
