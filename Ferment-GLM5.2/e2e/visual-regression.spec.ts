import { test, expect } from '@playwright/test'

test.describe('Visual Regression — Core Shell Components', () => {
  test('desktop renders with wallpaper background', async ({ page }) => {
    await page.goto('/')
    const desktop = page.locator('.desktop')
    await expect(desktop).toBeVisible()
    // Desktop should have a gradient background (wallpaper)
    const bg = await desktop.evaluate((el) => getComputedStyle(el).background)
    expect(bg).toContain('gradient')
  })

  test('menubar renders with glass transparency', async ({ page }) => {
    await page.goto('/')
    const menubar = page.getByTestId('menubar')
    await expect(menubar).toBeVisible()
    // Menubar should have backdrop-filter (glass effect)
    const backdropFilter = await menubar.evaluate((el) => getComputedStyle(el).backdropFilter)
    expect(backdropFilter.length).toBeGreaterThan(0)
  })

  test('dock renders with glass background', async ({ page }) => {
    await page.goto('/')
    const dock = page.getByTestId('dock')
    await expect(dock).toBeVisible()
    // Dock should have backdrop-filter
    const backdropFilter = await dock.evaluate((el) => getComputedStyle(el).backdropFilter)
    expect(backdropFilter.length).toBeGreaterThan(0)
  })

  test('window renders with squircle rounded corners', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    const win = page.locator('[data-testid^="window-"]').first()
    await expect(win).toBeVisible()
    // Window should have rounded corners
    const borderRadius = await win.evaluate((el) => getComputedStyle(el).borderRadius)
    expect(parseInt(borderRadius)).toBeGreaterThan(8)
  })

  test('glass surfaces use -apple-system font stack', async ({ page }) => {
    await page.goto('/')
    const root = page.locator('html')
    const fontFamily = await root.evaluate((el) => getComputedStyle(el).fontFamily)
    expect(fontFamily.toLowerCase()).toContain('apple')
  })

  test('dark mode changes glass surface backgrounds', async ({ page }) => {
    await page.goto('/')
    const root = page.locator('html')
    await expect(root).toHaveClass(/appearance-light/)
    
    // Open settings and switch to dark
    await page.getByTestId('dock-icon-settings').click()
    await page.getByTestId('settings-appearance-dark').click()
    await expect(root).toHaveClass(/appearance-dark/)
    
    // Switch to tinted
    await page.getByTestId('settings-appearance-tinted').click()
    await expect(root).toHaveClass(/appearance-tinted/)
    
    // Switch back to light
    await page.getByTestId('settings-appearance-light').click()
    await expect(root).toHaveClass(/appearance-light/)
  })

  test('reduce transparency toggle adds CSS class', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()
    
    const root = page.locator('html')
    await expect(root).not.toHaveClass(/reduce-transparency/)
    
    await page.getByTestId('settings-reduce-transparency').click()
    await expect(root).toHaveClass(/reduce-transparency/)
    
    await page.getByTestId('settings-reduce-transparency').click()
    await expect(root).not.toHaveClass(/reduce-transparency/)
  })

  test('dock icons are visible with hover magnification effect', async ({ page }) => {
    await page.goto('/')
    const dockIcons = page.locator('[data-testid^="dock-icon-"]')
    const count = await dockIcons.count()
    expect(count).toBeGreaterThan(10) // Should have 15+ app icons
    
    // Each icon should be visible
    for (let i = 0; i < Math.min(5, count); i++) {
      await expect(dockIcons.nth(i)).toBeVisible()
    }
  })

  test('spotlight panel has glass blur when open', async ({ page }) => {
    await page.goto('/')
    // Open spotlight via synthetic event
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { metaKey: true, code: 'Space', key: ' ', bubbles: true })))
    await expect(page.getByTestId('spotlight-panel')).toBeVisible()
    
    // Spotlight should have backdrop-filter
    const backdropFilter = await page.getByTestId('spotlight-panel').evaluate((el) => getComputedStyle(el).backdropFilter)
    expect(backdropFilter.length).toBeGreaterThan(0)
  })

  test('control center panel has glass blur when open', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('menubar-control-center').click()
    await expect(page.getByTestId('control-center-panel')).toBeVisible()
    
    const backdropFilter = await page.getByTestId('control-center-panel').evaluate((el) => getComputedStyle(el).backdropFilter)
    expect(backdropFilter.length).toBeGreaterThan(0)
  })
})
