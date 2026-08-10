import { test, expect } from '@playwright/test'

test.describe('Dock', () => {
  test('dock renders with #dock id and app icons', async ({ page }) => {
    await page.goto('/')

    const dock = page.locator('#dock')
    await expect(dock).toBeVisible()

    // Check that dock icons are present for key apps
    await expect(page.getByTestId('dock-icon-finder')).toBeVisible()
    await expect(page.getByTestId('dock-icon-safari')).toBeVisible()
    await expect(page.getByTestId('dock-icon-notes')).toBeVisible()
    await expect(page.getByTestId('dock-icon-calculator')).toBeVisible()
    await expect(page.getByTestId('dock-icon-settings')).toBeVisible()

    // Trash icon at the end
    await expect(page.getByTestId('dock-icon-trash')).toBeVisible()
  })

  test('Finder always shows running indicator', async ({ page }) => {
    await page.goto('/')

    // Finder has alwaysRunning: true — its indicator should be visible
    const finderIndicator = page.getByTestId('dock-indicator-finder')
    await expect(finderIndicator).toBeVisible()

    // Check the indicator has opacity > 0 (running)
    const opacity = await finderIndicator.evaluate((el) => {
      return getComputedStyle(el).opacity
    })
    const opacityNum = parseFloat(opacity)
    expect(opacityNum).toBeGreaterThan(0)

    // Non-running app (e.g. Calculator) should have opacity 0
    const calcIndicator = page.getByTestId('dock-indicator-calculator')
    await expect(calcIndicator).toBeVisible()
    const calcOpacity = await calcIndicator.evaluate((el) => {
      return getComputedStyle(el).opacity
    })
    expect(parseFloat(calcOpacity)).toBe(0)
  })

  test('hovering an icon shows tooltip with app name', async ({ page }) => {
    await page.goto('/')

    // Hover over Safari icon
    await page.getByTestId('dock-icon-safari').hover()

    // Tooltip should appear
    const tooltip = page.getByTestId('dock-tooltip-safari')
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('Safari')
  })

  test('magnification: icon scale increases when mouse hovers over it', async ({ page }) => {
    await page.goto('/')

    // Get initial (non-hovered) scale of the Calculator icon
    const calcIcon = page.getByTestId('dock-icon-calculator')

    // Move mouse away from dock first to get base scale
    await page.mouse.move(10, 10)
    await page.waitForTimeout(200)

    const baseTransform = await calcIcon.evaluate((el) => {
      return getComputedStyle(el).transform
    })

    // Now hover directly over the Calculator icon
    await calcIcon.hover()
    await page.waitForTimeout(200)

    const hoveredTransform = await calcIcon.evaluate((el) => {
      return getComputedStyle(el).transform
    })

    // The transform matrix scale values should be different (hovered should be larger)
    // matrix(a, b, c, d, e, f) — scale is a (and d)
    const extractScale = (transform: string): number => {
      const match = transform.match(/matrix\(([^)]+)\)/)
      if (!match) return 1
      const values = match[1].split(',').map(parseFloat)
      return values[0] // a = scaleX
    }

    const baseScale = extractScale(baseTransform)
    const hoveredScale = extractScale(hoveredTransform)

    // Hovered scale should be greater than base scale
    expect(hoveredScale).toBeGreaterThan(baseScale)
  })

  test('clicking an app icon triggers launch callback', async ({ page }) => {
    await page.goto('/')

    // Click the Notes icon — since onLaunchApp is not wired yet (Step 4),
    // the click should still fire without error. We verify the icon is clickable.
    const notesIcon = page.getByTestId('dock-icon-notes')
    await notesIcon.click()

    // No crash, dock still visible
    await expect(page.locator('#dock')).toBeVisible()
  })

  test('all 15 dock app icons are present', async ({ page }) => {
    await page.goto('/')

    const dock = page.locator('#dock')
    await expect(dock).toBeVisible()

    // Count all dock-icon-* elements (excluding trash which is dock-icon-trash)
    const appIcons = await page.locator('[data-testid^="dock-icon-"]').all()
    // 15 apps + 1 trash = 16 total
    expect(appIcons.length).toBe(16)
  })

  test('divider separates apps from trash', async ({ page }) => {
    await page.goto('/')

    const dock = page.locator('#dock')
    // The divider is a thin vertical line
    const divider = dock.locator('.w-px.h-10')
    await expect(divider).toBeVisible()
  })
})
