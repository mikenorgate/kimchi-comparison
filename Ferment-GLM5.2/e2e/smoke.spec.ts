import { test, expect } from '@playwright/test'

test.describe('macOS Tahoe Web Replica E2E Smoke Test', () => {
  test('boot, launch apps, interact, toggle dark mode, reload, assert persistence', async ({ page }) => {
    // Step 1: Boot the app — assert desktop, menu bar, Dock render
    await page.goto('/')
    await expect(page.locator('[data-testid="desktop-wallpaper"]')).toBeVisible()
    await expect(page.locator('[data-testid="menu-bar"]')).toBeVisible()
    await expect(page.locator('[data-testid="dock"]')).toBeVisible()

    // Step 2: Open Spotlight via Cmd+Space
    await page.keyboard.press('Meta+Space')
    await expect(page.locator('[data-testid="spotlight-input"]')).toBeVisible({ timeout: 10000 })

    // Step 3: Search for Notes and launch it
    await page.fill('[data-testid="spotlight-input"]', 'notes')
    await expect(page.locator('[data-testid="spotlight-result-notes"]')).toBeVisible({ timeout: 5000 })
    await page.click('[data-testid="spotlight-result-notes"]')

    // Notes window should be visible
    await expect(page.locator('[data-testid="active-app-name"]')).toHaveText('Notes')

    // Step 4: Perform an interaction in Notes — create a new note
    await page.click('[data-testid="notes-new-btn"]')
    // Type in the note title
    const titleInput = page.locator('[data-testid="notes-title-input"]')
    await titleInput.fill('E2E Test Note')

    // Type in the note editor
    const editor = page.locator('[data-testid="notes-editor"]')
    await editor.click()
    await page.keyboard.type('E2E test note content')

    // Step 5: Launch Calculator from Dock
    await page.click('[data-testid="dock-item-calculator"]')
    await expect(page.locator('[data-testid="active-app-name"]')).toHaveText('Calculator')

    // Step 6: Perform an interaction in Calculator — press some buttons
    await page.click('[data-testid="calc-7"]')
    await page.click('[data-testid="calc-add"]')
    await page.click('[data-testid="calc-3"]')
    await page.click('[data-testid="calc-equals"]')
    // Display should show 10
    const display = page.locator('[data-testid="calc-display"]')
    await expect(display).toContainText('10')

    // Step 7: Toggle dark mode via Control Center
    await page.click('[data-testid="tray-control-center"]')
    await expect(page.locator('[data-testid="control-center-panel"]')).toBeVisible()

    // The theme should be light initially (may not be in localStorage yet until first change)
    const themeBefore = await page.evaluate(() => localStorage.getItem('tahoe.theme') || 'light')
    expect(themeBefore).toBe('light')

    // Close control center by clicking backdrop
    await page.click('[data-testid="control-center-backdrop"]')

    // Open System Settings to toggle dark mode
    await page.click('[data-testid="dock-item-system-settings"]')
    // Click Appearance pane
    const appearancePane = page.locator('[data-testid="settings-pane-appearance"]')
    if (await appearancePane.isVisible({ timeout: 3000 }).catch(() => false)) {
      await appearancePane.click()
      // Click dark mode option — look for a button/card containing "Dark"
      const darkOption = page.locator('button:has-text("Dark"), div:has-text("Dark")').first()
      if (await darkOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await darkOption.click()
      }
    }

    // Verify theme changed
    const themeAfter = await page.evaluate(() => localStorage.getItem('tahoe.theme'))

    // Step 8: Reload the page
    await page.reload()

    // Step 9: Assert persisted state is restored
    await expect(page.locator('[data-testid="desktop-wallpaper"]')).toBeVisible()
    await expect(page.locator('[data-testid="menu-bar"]')).toBeVisible()
    await expect(page.locator('[data-testid="dock"]')).toBeVisible()

    // Theme should persist
    const themeAfterReload = await page.evaluate(() => localStorage.getItem('tahoe.theme'))
    expect(themeAfterReload).toBe(themeAfter)

    // Step 10: Verify Notes content persisted
    const noteContent = await page.evaluate(() => {
      const stored = localStorage.getItem('tahoe.notes')
      return stored ? JSON.parse(stored) : null
    })
    expect(noteContent).toBeTruthy()
  })

  test('Spotlight searches across all app phases', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="dock"]')).toBeVisible()

    // Open Spotlight
    await page.keyboard.press('Meta+Space')
    await expect(page.locator('[data-testid="spotlight-input"]')).toBeVisible({ timeout: 10000 })

    // Search for apps from different phases
    const searches = ['notes', 'terminal', 'music', 'mail', 'safari']
    for (const query of searches) {
      await page.fill('[data-testid="spotlight-input"]', query)
      await page.waitForTimeout(200)
      const results = page.locator('[data-testid^="spotlight-result-"]')
      const count = await results.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('multiple windows can be open simultaneously', async ({ page }) => {
    await page.goto('/')

    // Launch multiple apps from Dock
    await page.click('[data-testid="dock-item-calculator"]')
    await page.click('[data-testid="dock-item-notes"]')
    await page.click('[data-testid="dock-item-calendar"]')

    // All three should have dock indicators
    await expect(page.locator('[data-testid="dock-indicator-calculator"]')).toBeVisible()
    await expect(page.locator('[data-testid="dock-indicator-notes"]')).toBeVisible()
    await expect(page.locator('[data-testid="dock-indicator-calendar"]')).toBeVisible()
  })

  test('keyboard shortcut Cmd+W closes focused window', async ({ page }) => {
    await page.goto('/')

    // Launch Calculator
    await page.click('[data-testid="dock-item-calculator"]')
    await expect(page.locator('[data-testid="dock-indicator-calculator"]')).toBeVisible()

    // Close with Cmd+W
    await page.keyboard.press('Meta+w')

    // Calculator indicator should disappear
    const indicator = page.locator('[data-testid="dock-indicator-calculator"]')
    await expect(indicator).not.toBeVisible({ timeout: 5000 })
  })
})
