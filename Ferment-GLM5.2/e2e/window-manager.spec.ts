import { test, expect } from '@playwright/test'

/**
 * Window manager e2e — step 3 acceptance: windows open from the Dock, drag,
 * resize, minimize-to-Dock, close, with correct focus/z-order.
 */
test.describe('Window manager', () => {
  test('opens a window from the Dock', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await expect(page.getByTestId('window')).toBeVisible()
    await expect(page.getByTestId('window-chrome')).toBeVisible()
    await expect(page.getByTestId('calculator-content')).toBeVisible()
  })

  test('close button removes the window', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    const win = page.getByTestId('window')
    await expect(win).toBeVisible()
    await page.getByTestId('traffic-close').click()
    await expect(win).toHaveCount(0)
  })

  test('minimize hides the window', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    const win = page.getByTestId('window')
    await expect(win).toBeVisible()
    await page.getByTestId('traffic-minimize').click()
    await expect(win).toHaveCount(0)
  })

  test('zoom toggles the window to fill the screen and back', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    const win = page.getByTestId('window')
    const before = await win.evaluate((el) => el.getBoundingClientRect().width)
    await page.getByTestId('traffic-maximize').click()
    await expect(win).toHaveAttribute('data-maximized', 'true')
    const zoomed = await win.evaluate((el) => el.getBoundingClientRect().width)
    expect(zoomed).toBeGreaterThan(before + 400)
    await page.getByTestId('traffic-maximize').click()
    await expect(win).toHaveAttribute('data-maximized', 'false')
    const restored = await win.evaluate((el) => el.getBoundingClientRect().width)
    expect(Math.abs(restored - before)).toBeLessThan(5)
  })

  test('dragging the titlebar moves the window', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    const chrome = page.getByTestId('window-chrome')
    const box = await chrome.boundingBox()
    expect(box).not.toBeNull()
    const cx = box!.x + box!.width / 2
    const cy = box!.y + box!.height / 2
    const before = await page
      .getByTestId('window')
      .evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { x: r.x, y: r.y }
      })
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 100, cy + 60, { steps: 10 })
    await page.mouse.up()
    const after = await page
      .getByTestId('window')
      .evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { x: r.x, y: r.y }
      })
    expect(after.x - before.x).toBeGreaterThan(50)
    expect(after.y - before.y).toBeGreaterThan(20)
  })

  test('resizing via the SE handle grows the window', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    const handle = page.getByTestId('resize-se')
    const box = await handle.boundingBox()
    expect(box).not.toBeNull()
    const before = await page
      .getByTestId('window')
      .evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { w: r.width, h: r.height }
      })
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await page.mouse.move(box!.x + 120, box!.y + 80, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(50)
    const after = await page
      .getByTestId('window')
      .evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { w: r.width, h: r.height }
      })
    expect(after.w - before.w).toBeGreaterThan(50)
    expect(after.h - before.h).toBeGreaterThan(30)
  })

  test('clicking a background window focuses it and raises z-order', async ({ page }) => {
    await page.goto('/')
    // Single-instance Dock: open two *different* apps so two windows exist.
    await page.getByTestId('dock-icon-calculator').click()
    await page.getByTestId('dock-icon-notes').click()
    const wins = page.getByTestId('window')
    await expect(wins).toHaveCount(2)

    // The second window (nth 1) is focused & on top. Drag it down to fully
    // expose the first window.
    const chrome2 = wins.nth(1).getByTestId('window-chrome')
    const b2 = await chrome2.boundingBox()
    expect(b2).not.toBeNull()
    const cx = b2!.x + b2!.width / 2
    const cy = b2!.y + b2!.height / 2
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx, cy + 450, { steps: 12 })
    await page.mouse.up()

    const win1 = wins.nth(0)
    const zBefore = parseInt(
      await win1.evaluate((el) => getComputedStyle(el).zIndex),
      10,
    )
    await win1.getByTestId('window-content').click()
    const zAfter = parseInt(
      await win1.evaluate((el) => getComputedStyle(el).zIndex),
      10,
    )
    const zWin2 = parseInt(
      await wins.nth(1).evaluate((el) => getComputedStyle(el).zIndex),
      10,
    )
    expect(zAfter).toBeGreaterThan(zBefore)
    expect(zAfter).toBeGreaterThan(zWin2)
  })
})
