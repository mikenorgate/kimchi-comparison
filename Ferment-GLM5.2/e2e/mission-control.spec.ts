import { test, expect } from '@playwright/test'

// Helper: open a window via dock icon
async function openWindow(page: import('@playwright/test').Page, appId: string) {
  await page.getByTestId(`dock-icon-${appId}`).click()
  await expect(page.locator(`[data-testid="window-frame"][data-app-id="${appId}"]`)).toBeVisible()
}

test('Mission Control opens on F3 and shows tiles for open windows', async ({ page }) => {
  await page.goto('/')
  await openWindow(page, 'calculator')
  await openWindow(page, 'notes')
  await openWindow(page, 'calendar')

  await page.keyboard.press('F3')
  await expect(page.getByTestId('mission-control-overlay')).toBeVisible()
  await expect(page.getByTestId('mission-control-tile-calculator')).toBeVisible()
  await expect(page.getByTestId('mission-control-tile-notes')).toBeVisible()
  await expect(page.getByTestId('mission-control-tile-calendar')).toBeVisible()
})

test('clicking a tile focuses the window and closes overview', async ({ page }) => {
  await page.goto('/')
  await openWindow(page, 'calculator')
  await openWindow(page, 'notes')
  await openWindow(page, 'calendar')

  await page.keyboard.press('F3')
  await expect(page.getByTestId('mission-control-overlay')).toBeVisible()

  // Click the calculator tile
  await page.getByTestId('mission-control-tile-calculator').click()

  // Overview should close
  await expect(page.getByTestId('mission-control-overlay')).not.toBeVisible()

  // Calculator window should be focused (highest z-index)
  const calcZ = await page.locator('[data-testid="window-frame"][data-app-id="calculator"]')
    .evaluate((el) => parseInt(window.getComputedStyle(el).zIndex))
  const notesZ = await page.locator('[data-testid="window-frame"][data-app-id="notes"]')
    .evaluate((el) => parseInt(window.getComputedStyle(el).zIndex))
  const calendarZ = await page.locator('[data-testid="window-frame"][data-app-id="calendar"]')
    .evaluate((el) => parseInt(window.getComputedStyle(el).zIndex))
  expect(calcZ).toBeGreaterThan(notesZ)
  expect(calcZ).toBeGreaterThan(calendarZ)
})

test('Escape closes Mission Control without focusing', async ({ page }) => {
  await page.goto('/')
  await openWindow(page, 'calculator')
  await openWindow(page, 'notes')

  // Notes is the last opened, so it should have the highest z-index
  const notesZBefore = await page.locator('[data-testid="window-frame"][data-app-id="notes"]')
    .evaluate((el) => parseInt(window.getComputedStyle(el).zIndex))
  const calcZBefore = await page.locator('[data-testid="window-frame"][data-app-id="calculator"]')
    .evaluate((el) => parseInt(window.getComputedStyle(el).zIndex))
  expect(notesZBefore).toBeGreaterThan(calcZBefore)

  await page.keyboard.press('F3')
  await expect(page.getByTestId('mission-control-overlay')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByTestId('mission-control-overlay')).not.toBeVisible()

  // Z-order should be unchanged (Escape doesn't focus)
  const notesZAfter = await page.locator('[data-testid="window-frame"][data-app-id="notes"]')
    .evaluate((el) => parseInt(window.getComputedStyle(el).zIndex))
  const calcZAfter = await page.locator('[data-testid="window-frame"][data-app-id="calculator"]')
    .evaluate((el) => parseInt(window.getComputedStyle(el).zIndex))
  expect(notesZAfter).toBeGreaterThan(calcZAfter)
})
