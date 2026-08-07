import { test, expect } from '@playwright/test'

/**
 * Menu bar e2e — step 4 acceptance: the Apple menu + per-app menus open with
 * correct items reflecting the focused app, and menus close on item-click /
 * click-away.
 */
test.describe('Menu bar', () => {
  test('Apple menu opens with system items', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('menu-apple').click()
    await expect(page.getByTestId('menu-item-about-mac')).toBeVisible()
    await expect(page.getByTestId('menu-item-system-settings')).toBeVisible()
    await expect(page.getByTestId('menu-item-lock-screen')).toBeVisible()
  })

  test('default app menu is Finder when the desktop is focused', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('menu-app-name')).toHaveText('Finder')
  })

  test('Apple menu closes on item click', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('menu-apple').click()
    await expect(page.getByTestId('menu-dropdown')).toBeVisible()
    await page.getByTestId('menu-item-about-mac').click()
    await expect(page.getByTestId('menu-dropdown')).toHaveCount(0)
  })

  test('Apple menu closes on click-away', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('menu-apple').click()
    await expect(page.getByTestId('menu-dropdown')).toBeVisible()
    await page.getByTestId('wallpaper').click({ position: { x: 100, y: 500 } })
    await expect(page.getByTestId('menu-dropdown')).toHaveCount(0)
  })

  test('opening Calculator switches the app menu and items', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await expect(page.getByTestId('menu-app-name')).toHaveText('Calculator')

    // The app-name (bold) menu reflects the focused app.
    await page.getByTestId('menu-app-name').click()
    await expect(page.getByTestId('menu-item-about-app')).toContainText('About Calculator')
    await expect(page.getByTestId('menu-item-quit-app')).toContainText('Quit Calculator')

    // Calculator's File menu offers "New Calculator Window".
    await page.getByTestId('menu-file').click()
    await expect(page.getByTestId('menu-item-new-window')).toContainText('New Calculator Window')
  })

  test('hovering another menu title switches the open menu', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-notes').click()
    await page.getByTestId('menu-app-name').click()
    await expect(page.getByTestId('menu-item-about-app')).toHaveText('About Notes')
    // Hover the File title while the app-name menu is open → switches.
    await page.getByTestId('menu-file').hover()
    await expect(page.getByTestId('menu-item-new-window')).toContainText('New Note')
  })

  test('File → Close Window closes the focused window', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await expect(page.getByTestId('window')).toBeVisible()
    await page.getByTestId('menu-file').click()
    await page.getByTestId('menu-item-close-window').click()
    await expect(page.getByTestId('window')).toHaveCount(0)
  })

  test('Window → Minimize minimizes the focused window', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await expect(page.getByTestId('window')).toBeVisible()
    await page.getByTestId('menu-window').click()
    await page.getByTestId('menu-item-minimize').click()
    await expect(page.getByTestId('window')).toHaveCount(0)
  })

  test('closing the focused window reverts the app menu to Finder', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await expect(page.getByTestId('menu-app-name')).toHaveText('Calculator')
    await page.getByTestId('traffic-close').click()
    await expect(page.getByTestId('menu-app-name')).toHaveText('Finder')
  })

  test('Dock shows a running indicator for open apps', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await expect(page.getByTestId('dock-indicator-calculator')).toBeVisible()
    // Apps without an open window have no indicator.
    await expect(page.getByTestId('dock-indicator-notes')).toHaveCount(0)
  })
})
