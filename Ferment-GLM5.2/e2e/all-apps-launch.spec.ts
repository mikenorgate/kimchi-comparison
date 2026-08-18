import { test, expect } from '@playwright/test'

const APPS = [
  { id: 'finder', name: 'Finder' },
  { id: 'safari', name: 'Safari' },
  { id: 'notes', name: 'Notes' },
  { id: 'calculator', name: 'Calculator' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'mail', name: 'Mail' },
  { id: 'terminal', name: 'Terminal' },
  { id: 'settings', name: 'System Settings' },
]

async function pressSpotlightHotkey(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    }))
  })
}

test('All 8 apps open via Spotlight and show correct title', async ({ page }) => {
  await page.goto('/')

  for (const app of APPS) {
    // Open Spotlight
    await pressSpotlightHotkey(page)
    await expect(page.getByTestId('spotlight-overlay')).toBeVisible()

    // Type the app name and launch
    await page.getByTestId('spotlight-input').fill(app.name)
    await page.keyboard.press('Enter')

    // Window should mount with correct app id
    const win = page.locator(`[data-testid="window-frame"][data-app-id="${app.id}"]`)
    await expect(win).toBeVisible()

    // Titlebar should show the app name
    const titlebar = win.locator('[data-testid="window-titlebar"]')
    await expect(titlebar).toContainText(app.name)

    // Close the window
    await win.locator('[data-testid="window-close"]').click()
    await expect(win).not.toBeVisible()
  }
})

test('All 8 apps open via Dock click', async ({ page }) => {
  await page.goto('/')

  for (const app of APPS) {
    await page.getByTestId(`dock-icon-${app.id}`).click()

    const win = page.locator(`[data-testid="window-frame"][data-app-id="${app.id}"]`)
    await expect(win).toBeVisible()

    // Titlebar should show the app name
    await expect(win.locator('[data-testid="window-titlebar"]')).toContainText(app.name)

    // Close it
    await win.locator('[data-testid="window-close"]').click()
    await expect(win).not.toBeVisible()
  }
})
