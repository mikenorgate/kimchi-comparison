import { test, expect } from '@playwright/test'

test.describe('Window Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="window-frame"]', { timeout: 10000 })
  })

  test('renders sample Finder and Safari windows', async ({ page }) => {
    const frames = page.locator('[data-testid="window-frame"]')
    await expect(frames).toHaveCount(2)
    await expect(page.getByRole('dialog', { name: 'Finder' })).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Safari' })).toBeVisible()
  })

  test('focuses a window on click and raises its z-index', async ({ page }) => {
    const finder = page.locator('[data-window-id="finder-1"]')
    const safari = page.locator('[data-window-id="safari-1"]')

    const initialFinderZ = await finder.evaluate((el) =>
      Number(window.getComputedStyle(el).zIndex),
    )
    const initialSafariZ = await safari.evaluate((el) =>
      Number(window.getComputedStyle(el).zIndex),
    )
    expect(initialFinderZ).toBeLessThan(initialSafariZ)

    // Click on the Finder window (currently behind Safari) to bring it front.
    await finder.locator('[data-testid="window-titlebar"]').click()

    const nextFinderZ = await finder.evaluate((el) =>
      Number(window.getComputedStyle(el).zIndex),
    )
    const nextSafariZ = await safari.evaluate((el) =>
      Number(window.getComputedStyle(el).zIndex),
    )
    expect(nextFinderZ).toBeGreaterThan(nextSafariZ)
  })

  test('drags a window by the title bar', async ({ page }) => {
    const finder = page.locator('[data-window-id="finder-1"]')
    const boxBefore = await finder.boundingBox()
    expect(boxBefore).not.toBeNull()

    const titlebar = finder.locator('[data-testid="window-titlebar"]')
    await titlebar.dragTo(titlebar, {
      sourcePosition: { x: 200, y: 10 },
      targetPosition: { x: 280, y: 80 },
    })

    const boxAfter = await finder.boundingBox()
    expect(boxAfter!.x).toBeGreaterThan(boxBefore!.x)
    expect(boxAfter!.y).toBeGreaterThan(boxBefore!.y)
  })

  test('resizes a window from the bottom-right corner', async ({ page }) => {
    const finder = page.locator('[data-window-id="finder-1"]')
    const boxBefore = await finder.boundingBox()
    expect(boxBefore).not.toBeNull()

    const handle = finder.locator('.cursor-nwse-resize')
    await handle.dragTo(handle, {
      sourcePosition: { x: 8, y: 8 },
      targetPosition: { x: 80, y: 60 },
    })

    const boxAfter = await finder.boundingBox()
    expect(boxAfter!.width).toBeGreaterThan(boxBefore!.width)
    expect(boxAfter!.height).toBeGreaterThan(boxBefore!.height)
  })

  test('maximizes and restores a window', async ({ page }) => {
    const finder = page.locator('[data-window-id="finder-1"]')
    const boxBefore = await finder.boundingBox()

    await finder.getByRole('button', { name: 'Maximize' }).click()
    const boxMax = await finder.boundingBox()
    expect(boxMax!.x).toBe(0)
    expect(boxMax!.y).toBe(32)
    expect(boxMax!.width).toBeGreaterThan(boxBefore!.width)
    expect(boxMax!.height).toBeGreaterThan(boxBefore!.height)

    await finder.getByRole('button', { name: 'Maximize' }).click()
    const boxRestored = await finder.boundingBox()
    expect(boxRestored!.width).toBe(boxBefore!.width)
    expect(boxRestored!.height).toBe(boxBefore!.height)
    expect(boxRestored!.x).toBe(boxBefore!.x)
    expect(boxRestored!.y).toBe(boxBefore!.y)
  })

  test('minimizes and closes a window', async ({ page }) => {
    const finder = page.locator('[data-window-id="finder-1"]')
    await finder.getByRole('button', { name: 'Minimize' }).click()
    await expect(finder).toBeHidden()

    const safari = page.locator('[data-window-id="safari-1"]')
    await safari.getByRole('button', { name: 'Close' }).click()
    await expect(safari).toBeHidden()

    const frames = page.locator('[data-testid="window-frame"]')
    await expect(frames).toHaveCount(0)
  })
})
