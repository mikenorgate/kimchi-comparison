import { test, expect } from '@playwright/test'

test.describe('System Panels — Spotlight, Control Center, Notification Center', () => {
  // ── Spotlight ──────────────────────────────────────────────────

  test('Cmd+Space opens Spotlight search panel', async ({ page }) => {
    await page.goto('/')

    // Spotlight not visible initially
    await expect(page.getByTestId('spotlight-panel')).not.toBeVisible()

    // Dispatch Cmd+Space via evaluate (Meta+Space is intercepted by macOS Spotlight)
    await page.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { metaKey: true, code: 'Space', key: ' ', bubbles: true }))
    })

    // Spotlight panel appears
    await expect(page.getByTestId('spotlight-panel')).toBeVisible()

    // Search input is focused and visible
    const input = page.getByTestId('spotlight-input')
    await expect(input).toBeVisible()
    await expect(input).toBeFocused()
  })

  test('Spotlight shows app results and clicking launches app window', async ({ page }) => {
    await page.goto('/')

    // Open via icon click (Meta+Space is intercepted by macOS)
    await page.getByTestId('menubar-spotlight').click()
    await expect(page.getByTestId('spotlight-panel')).toBeVisible()

    // Results list is visible (shows apps even without query)
    await expect(page.getByTestId('spotlight-results')).toBeVisible()

    // Type "calc" to filter for Calculator
    await page.getByTestId('spotlight-input').fill('calc')

    // Calculator result should be visible
    const calcResult = page.getByTestId('spotlight-result-calculator')
    await expect(calcResult).toBeVisible()
    await expect(calcResult).toContainText('Calculator')

    // Click it — should launch app and close Spotlight
    await calcResult.click()

    await expect(page.getByTestId('spotlight-panel')).not.toBeVisible()

    // A Calculator window should now be open
    const calcWindow = page.locator('[data-app="calculator"]')
    await expect(calcWindow).toBeVisible()
  })

  test('Spotlight search filters results by app name', async ({ page }) => {
    await page.goto('/')

    // Open Spotlight via icon click (Meta+Space is flaky on macOS)
    await page.getByTestId('menubar-spotlight').click()
    await expect(page.getByTestId('spotlight-panel')).toBeVisible()
    const input = page.getByTestId('spotlight-input')

    // Search for "safari"
    await input.fill('safari')
    await expect(page.getByTestId('spotlight-result-safari')).toBeVisible()

    // Notes should NOT be in results
    await expect(page.getByTestId('spotlight-result-notes')).not.toBeVisible()

    // Clear and search "notes"
    await input.fill('notes')
    await expect(page.getByTestId('spotlight-result-notes')).toBeVisible()
    await expect(page.getByTestId('spotlight-result-safari')).not.toBeVisible()
  })

  test('Escape closes Spotlight', async ({ page }) => {
    await page.goto('/')

    // Open via icon click
    await page.getByTestId('menubar-spotlight').click()
    await expect(page.getByTestId('spotlight-panel')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('spotlight-panel')).not.toBeVisible()
  })

  test('Spotlight icon in menu bar toggles panel', async ({ page }) => {
    await page.goto('/')

    // Click spotlight icon in menu bar
    await page.getByTestId('menubar-spotlight').click()
    await expect(page.getByTestId('spotlight-panel')).toBeVisible()

    // Click again to close
    await page.getByTestId('menubar-spotlight').click()
    await expect(page.getByTestId('spotlight-panel')).not.toBeVisible()
  })

  test('clicking outside Spotlight closes it', async ({ page }) => {
    await page.goto('/')

    // Open Spotlight via icon click (Meta+Space is flaky on macOS)
    await page.getByTestId('menubar-spotlight').click()
    await expect(page.getByTestId('spotlight-panel')).toBeVisible()

    // Click on the spotlight backdrop (below menubar)
    await page.getByTestId('spotlight-backdrop').click({ position: { x: 50, y: 300 } })
    await expect(page.getByTestId('spotlight-panel')).not.toBeVisible()
  })

  test('Spotlight Enter key launches selected app', async ({ page }) => {
    await page.goto('/')

    // Open via icon click
    await page.getByTestId('menubar-spotlight').click()
    const input = page.getByTestId('spotlight-input')
    await input.fill('notes')

    // Press Enter to launch the selected (first) result
    await input.press('Enter')

    // Spotlight closes
    await expect(page.getByTestId('spotlight-panel')).not.toBeVisible()

    // Notes window opens
    await expect(page.locator('[data-app="notes"]')).toBeVisible()
  })

  // ── Control Center ────────────────────────────────────────────

  test('Control Center icon toggles panel', async ({ page }) => {
    await page.goto('/')

    // Panel not visible initially
    await expect(page.getByTestId('control-center-panel')).not.toBeVisible()

    // Click Control Center icon
    await page.getByTestId('menubar-control-center').click()
    await expect(page.getByTestId('control-center-panel')).toBeVisible()

    // Toggle modules visible
    await expect(page.getByTestId('cc-wifi')).toBeVisible()
    await expect(page.getByTestId('cc-bluetooth')).toBeVisible()
    await expect(page.getByTestId('cc-airdrop')).toBeVisible()
    await expect(page.getByTestId('cc-focus')).toBeVisible()

    // Sliders visible
    await expect(page.getByTestId('cc-brightness')).toBeVisible()
    await expect(page.getByTestId('cc-sound')).toBeVisible()

    // Appearance toggle visible
    await expect(page.getByTestId('cc-appearance')).toBeVisible()

    // Close by clicking icon again
    await page.getByTestId('menubar-control-center').click()
    await expect(page.getByTestId('control-center-panel')).not.toBeVisible()
  })

  test('Control Center appearance button cycles appearance modes', async ({ page }) => {
    await page.goto('/')

    // Initially light
    await expect(page.locator('html')).toHaveClass(/appearance-light/)

    // Open Control Center
    await page.getByTestId('menubar-control-center').click()
    await expect(page.getByTestId('control-center-panel')).toBeVisible()

    // Appearance button shows "light" initially
    const appearanceBtn = page.getByTestId('cc-appearance')
    await expect(appearanceBtn).toContainText('light')

    // Click to switch to dark
    await appearanceBtn.click()
    await expect(page.locator('html')).toHaveClass(/appearance-dark/)
    await expect(appearanceBtn).toContainText('dark')

    // Click again to switch to tinted
    await appearanceBtn.click()
    await expect(page.locator('html')).toHaveClass(/appearance-tinted/)
    await expect(appearanceBtn).toContainText('tinted')

    // Click again to cycle back to light
    await appearanceBtn.click()
    await expect(page.locator('html')).toHaveClass(/appearance-light/)
  })

  test('Control Center toggles change state when clicked', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('menubar-control-center').click()
    await expect(page.getByTestId('control-center-panel')).toBeVisible()

    // Wi-Fi toggle — initially active (sublabel says "Connected")
    const wifiToggle = page.getByTestId('cc-wifi')
    await expect(wifiToggle).toContainText('Connected')

    // Click to turn off
    await wifiToggle.click()
    await expect(wifiToggle).toContainText('Off')

    // Click to turn back on
    await wifiToggle.click()
    await expect(wifiToggle).toContainText('Connected')
  })

  test('Escape closes Control Center', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('menubar-control-center').click()
    await expect(page.getByTestId('control-center-panel')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('control-center-panel')).not.toBeVisible()
  })

  // ── Notification Center ──────────────────────────────────────

  test('Notification Center icon toggles panel', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('notification-center-panel')).not.toBeVisible()

    await page.getByTestId('menubar-notification-center').click()
    await expect(page.getByTestId('notification-center-panel')).toBeVisible()

    // Widgets present
    await expect(page.getByTestId('nc-calendar-widget')).toBeVisible()
    await expect(page.getByTestId('nc-weather-widget')).toBeVisible()

    // Notification list present
    await expect(page.getByTestId('nc-notification-list')).toBeVisible()

    // At least one notification card visible
    await expect(page.getByTestId('nc-notification-n1')).toBeVisible()

    // Toggle off
    await page.getByTestId('menubar-notification-center').click()
    await expect(page.getByTestId('notification-center-panel')).not.toBeVisible()
  })

  test('Notification Center shows mock notifications', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('menubar-notification-center').click()
    await expect(page.getByTestId('notification-center-panel')).toBeVisible()

    // Check specific notifications exist
    await expect(page.getByTestId('nc-notification-n1')).toContainText('Alex Chen')
    await expect(page.getByTestId('nc-notification-n2')).toContainText('GitHub')
    await expect(page.getByTestId('nc-notification-n3')).toContainText('Team Standup')
    await expect(page.getByTestId('nc-notification-n4')).toContainText('Pick up groceries')
  })

  test('Clear All removes notifications from Notification Center', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('menubar-notification-center').click()
    await expect(page.getByTestId('notification-center-panel')).toBeVisible()

    // Notifications present
    await expect(page.getByTestId('nc-notification-n1')).toBeVisible()

    // Click Clear All
    await page.getByTestId('nc-clear-all').click()

    // Empty state visible
    await expect(page.getByTestId('nc-empty')).toBeVisible()
    await expect(page.getByTestId('nc-notification-n1')).not.toBeVisible()
  })

  test('Escape closes Notification Center', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('menubar-notification-center').click()
    await expect(page.getByTestId('notification-center-panel')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('notification-center-panel')).not.toBeVisible()
  })

  // ── Panel mutual exclusion ───────────────────────────────────

  test('opening one panel closes the other', async ({ page }) => {
    await page.goto('/')

    // Open Control Center
    await page.getByTestId('menubar-control-center').click()
    await expect(page.getByTestId('control-center-panel')).toBeVisible()

    // Open Notification Center — Control Center should close
    await page.getByTestId('menubar-notification-center').click()
    await expect(page.getByTestId('notification-center-panel')).toBeVisible()
    await expect(page.getByTestId('control-center-panel')).not.toBeVisible()

    // Open Spotlight via icon click — Notification Center should close
    await page.getByTestId('menubar-spotlight').click()
    await expect(page.getByTestId('spotlight-panel')).toBeVisible()
    await expect(page.getByTestId('notification-center-panel')).not.toBeVisible()
  })
})
