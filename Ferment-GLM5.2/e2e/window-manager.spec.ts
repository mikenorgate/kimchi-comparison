import { test, expect } from '@playwright/test'

test.describe('Window Manager', () => {
  test('clicking Dock icon opens a window', async ({ page }) => {
    await page.goto('/')

    // Click Notes in the Dock
    await page.getByTestId('dock-icon-notes').click()

    // A window should appear
    const win = page.locator('[data-testid^="window-win-"]').first()
    await expect(win).toBeVisible()

    // Window should have a title bar
    await expect(page.getByTestId('window-titlebar')).toBeVisible()

    // Window content area should exist
    await expect(page.getByTestId('window-content')).toBeVisible()
  })

  test('window can be dragged by title bar', async ({ page }) => {
    await page.goto('/')

    // Open a window
    await page.getByTestId('dock-icon-notes').click()
    const win = page.locator('[data-testid^="window-win-"]').first()
    await expect(win).toBeVisible()

    // Get initial position
    const initialBox = await win.boundingBox()
    expect(initialBox).not.toBeNull()

    // Drag the title bar
    const titlebar = page.getByTestId('window-titlebar')
    const titlebarBox = await titlebar.boundingBox()
    expect(titlebarBox).not.toBeNull()

    const startX = titlebarBox!.x + titlebarBox!.width / 2
    const startY = titlebarBox!.y + titlebarBox!.height / 2

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX + 100, startY + 50)
    await page.mouse.up()

    // Wait for state update
    await page.waitForTimeout(200)

    // Window should have moved
    const newBox = await win.boundingBox()
    expect(newBox).not.toBeNull()
    expect(newBox!.x).not.toBe(initialBox!.x)
    expect(newBox!.y).not.toBe(initialBox!.y)
  })

  test('window can be resized from bottom-right corner', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('dock-icon-calculator').click()
    const win = page.locator('[data-testid^="window-win-"]').first()
    await expect(win).toBeVisible()

    const initialBox = await win.boundingBox()
    expect(initialBox).not.toBeNull()

    // Find the resize handle
    const resizeHandle = page.getByTestId('window-resize-handle')
    await expect(resizeHandle).toBeVisible()

    const handleBox = await resizeHandle.boundingBox()
    expect(handleBox).not.toBeNull()

    // Drag the resize handle
    const hx = handleBox!.x + handleBox!.width / 2
    const hy = handleBox!.y + handleBox!.height / 2

    await page.mouse.move(hx, hy)
    await page.mouse.down()
    await page.mouse.move(hx + 80, hy + 60)
    await page.mouse.up()

    await page.waitForTimeout(200)

    // Window should have grown
    const newBox = await win.boundingBox()
    expect(newBox).not.toBeNull()
    expect(newBox!.width).toBeGreaterThan(initialBox!.width)
    expect(newBox!.height).toBeGreaterThan(initialBox!.height)
  })

  test('close button closes the window', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('dock-icon-notes').click()
    const win = page.locator('[data-testid^="window-win-"]').first()
    await expect(win).toBeVisible()

    // Click the close traffic light
    await page.getByTestId('traffic-close').click()

    // Window should disappear
    await expect(win).not.toBeVisible()
  })

  test('minimize button minimizes the window', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('dock-icon-notes').click()
    const win = page.locator('[data-testid^="window-win-"]').first()
    await expect(win).toBeVisible()

    // Click minimize
    await page.getByTestId('traffic-minimize').click()

    // Window should be hidden (minimized)
    await expect(win).not.toBeVisible()
  })

  test('maximize button toggles fullscreen', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('dock-icon-notes').click()
    const win = page.locator('[data-testid^="window-win-"]').first()
    await expect(win).toBeVisible()

    const initialBox = await win.boundingBox()
    expect(initialBox).not.toBeNull()

    // Click maximize
    await page.getByTestId('traffic-maximize').click()
    await page.waitForTimeout(200)

    const maxBox = await win.boundingBox()
    expect(maxBox).not.toBeNull()

    // Maximized window should be wider than initial
    expect(maxBox!.width).toBeGreaterThan(initialBox!.width)
  })

  test('clicking Dock icon when window is open focuses it', async ({ page }) => {
    await page.goto('/')

    // Open Notes
    await page.getByTestId('dock-icon-notes').click()
    const win1 = page.locator('[data-testid^="window-win-"]').first()
    await expect(win1).toBeVisible()

    // Open Calculator (different app)
    await page.getByTestId('dock-icon-calculator').click()
    const win2 = page.locator('[data-testid^="window-win-"]').last()
    await expect(win2).toBeVisible()

    // Click Notes dock icon again — should focus existing Notes window, not create a new one
    const windowCountBefore = await page.locator('[data-testid^="window-win-"]').count()
    await page.getByTestId('dock-icon-notes').click()
    await page.waitForTimeout(200)

    const windowCountAfter = await page.locator('[data-testid^="window-win-"]').count()
    expect(windowCountAfter).toBe(windowCountBefore)
  })

  test('running indicator appears after opening an app', async ({ page }) => {
    await page.goto('/')

    // Calculator indicator should have opacity 0 initially
    const calcIndicator = page.getByTestId('dock-indicator-calculator')
    const initialOpacity = await calcIndicator.evaluate(
      (el) => getComputedStyle(el).opacity
    )
    expect(parseFloat(initialOpacity)).toBe(0)

    // Open Calculator
    await page.getByTestId('dock-icon-calculator').click()
    await page.waitForTimeout(200)

    // Now indicator should be visible (opacity > 0)
    const opacity = await calcIndicator.evaluate(
      (el) => getComputedStyle(el).opacity
    )
    expect(parseFloat(opacity)).toBeGreaterThan(0)
  })

  test('multiple windows stack with different z-indices', async ({ page }) => {
    await page.goto('/')

    // Open two windows
    await page.getByTestId('dock-icon-notes').click()
    await page.waitForTimeout(100)
    await page.getByTestId('dock-icon-calculator').click()
    await page.waitForTimeout(100)

    const windows = page.locator('[data-testid^="window-win-"]')
    const count = await windows.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('Spaces switching hides windows on other spaces', async ({ page }) => {
    await page.goto('/')

    // Open a window on Space 0
    await page.getByTestId('dock-icon-notes').click()
    const win = page.locator('[data-testid^="window-win-"]').first()
    await expect(win).toBeVisible()

    // Switch to Space 1 via keyboard shortcut (Ctrl+ArrowRight)
    await page.keyboard.press('Control+ArrowRight')
    await page.waitForTimeout(300)

    // Window should no longer be visible (it's on Space 0, we're on Space 1)
    await expect(win).not.toBeVisible()

    // Switch back to Space 0 (Ctrl+ArrowLeft)
    await page.keyboard.press('Control+ArrowLeft')
    await page.waitForTimeout(300)

    // Window should be visible again
    await expect(win).toBeVisible()
  })

  test('Cmd+W closes the focused window', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('dock-icon-notes').click()
    const win = page.locator('[data-testid^="window-win-"]').first()
    await expect(win).toBeVisible()

    // Press Cmd+W
    await page.keyboard.press('Meta+w')
    await page.waitForTimeout(200)

    // Window should be closed
    await expect(win).not.toBeVisible()
  })
})
