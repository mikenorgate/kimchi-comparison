import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('[data-testid="dock-icon"]', { timeout: 10000 })
})

test('Spotlight opens with Cmd+Space, filters apps, and opens a window', async ({ page }) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text())
    }
  })

  await page.keyboard.press('Meta+Space')
  await expect(page.getByTestId('spotlight-overlay')).toBeVisible()

  const input = page.getByTestId('spotlight-input')
  await expect(input).toBeFocused()

  await input.fill('notes')
  const result = page.getByTestId('spotlight-result-notes')
  await expect(result).toBeVisible()

  await result.click()
  await page.screenshot({ path: 'e2e-report/spotlight-after-click.png' })
  await expect(page.getByTestId('spotlight-overlay')).not.toBeVisible()

  // Two sample windows are already open; opening Notes should make three.
  await expect(page.getByTestId('window-frame')).toHaveCount(3)

  // Wait for the new Notes window frame to appear.
  const notesWindow = page.getByTestId('window-frame').filter({ hasText: 'Notes' })
  await page.screenshot({ path: 'e2e-report/spotlight-notes-open.png' })
  await expect(notesWindow).toBeVisible()
})

test('Control Center opens from menu bar and shows toggles and sliders', async ({ page }) => {
  await page.getByRole('button', { name: 'Control Center' }).click()

  const panel = page.getByTestId('control-center-panel')
  await expect(panel).toBeVisible()
  await expect(panel).toHaveCSS('backdrop-filter', /blur/)

  await expect(page.getByTestId('control-center-wifi-toggle')).toBeVisible()
  await expect(page.getByTestId('control-center-bluetooth-toggle')).toBeVisible()
  await expect(page.getByTestId('control-center-airplane-toggle')).toBeVisible()
  await expect(page.getByTestId('control-center-focus-toggle')).toBeVisible()

  await expect(page.getByTestId('control-center-brightness-slider')).toBeVisible()
  await expect(page.getByTestId('control-center-volume-slider')).toBeVisible()
})

test('Menu bar app menu and standard menus show mocked dropdowns', async ({ page }) => {
  await page.getByTestId('menubar-app-menu-button').click()
  const appDropdown = page.getByTestId('menu-dropdown')
  await expect(appDropdown).toBeVisible()
  await expect(appDropdown).toContainText('About Finder')
  await expect(appDropdown).toContainText('Quit Finder')

  // Click elsewhere to close the app menu (use the menu bar background)
  await page.keyboard.press('Escape')
  await expect(appDropdown).not.toBeVisible()

  await page.getByTestId('menu-button-file').click()
  const fileDropdown = page.getByTestId('menu-dropdown')
  await expect(fileDropdown).toBeVisible()
  await expect(fileDropdown).toContainText('New Window')
  await expect(fileDropdown).toContainText('Move to Trash')
})
