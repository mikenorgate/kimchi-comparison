import { test, expect } from '@playwright/test'

// Helper: locator for a window frame by app id
function winFrame(page: import('@playwright/test').Page, appId: string) {
  return page.locator(`[data-testid="window-frame"][data-app-id="${appId}"]`)
}

// Helper: simulate a mouse drag via direct event dispatch
async function simulateDrag(page: import('@playwright/test').Page, selector: string, dx: number, dy: number) {
  await page.evaluate(({ selector, dx, dy }) => {
    const el = document.querySelector(selector) as HTMLElement
    const rect = el.getBoundingClientRect()
    const cx = rect.x + rect.width / 2
    const cy = rect.y + rect.height / 2

    el.dispatchEvent(new MouseEvent('mousedown', { clientX: cx, clientY: cy, bubbles: true, button: 0 }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: cx + dx / 2, clientY: cy + dy / 2, bubbles: true }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: cx + dx, clientY: cy + dy, bubbles: true }))
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: cx + dx, clientY: cy + dy, bubbles: true }))
  }, { selector, dx, dy })
}

test('open a window by clicking dock icon', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('dock-icon-calculator').click()
  await expect(winFrame(page, 'calculator')).toBeVisible()
})

test('drag a window by its titlebar', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('dock-icon-calculator').click()
  const win = winFrame(page, 'calculator')
  await expect(win).toBeVisible()

  const initialBox = await win.boundingBox()
  expect(initialBox).not.toBeNull()

  await simulateDrag(page, '[data-testid="window-titlebar"]', 80, 40)

  const finalBox = await win.boundingBox()
  expect(finalBox).not.toBeNull()
  expect(finalBox!.x).not.toBe(initialBox!.x)
  expect(finalBox!.y).not.toBe(initialBox!.y)
})

test('resize a window using the se handle', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('dock-icon-calculator').click()
  const win = winFrame(page, 'calculator')
  await expect(win).toBeVisible()

  const initialBox = await win.boundingBox()
  expect(initialBox).not.toBeNull()

  await simulateDrag(page, '[data-testid="window-resize-se"]', 50, 50)

  const finalBox = await win.boundingBox()
  expect(finalBox).not.toBeNull()
  expect(finalBox!.width).toBeGreaterThan(initialBox!.width)
  expect(finalBox!.height).toBeGreaterThan(initialBox!.height)
})

test('close a window using the close button', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('dock-icon-calculator').click()
  await expect(winFrame(page, 'calculator')).toBeVisible()

  await page.getByTestId('window-close').click()
  await expect(winFrame(page, 'calculator')).not.toBeVisible()
})

test('minimize a window and restore from Dock', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('dock-icon-calculator').click()
  await expect(winFrame(page, 'calculator')).toBeVisible()

  await page.getByTestId('window-minimize').click()
  await expect(winFrame(page, 'calculator')).not.toBeVisible()

  // Click dock icon to restore
  await page.getByTestId('dock-icon-calculator').click()
  await expect(winFrame(page, 'calculator')).toBeVisible()
})

test('clicking a window brings it to the front (z-order)', async ({ page }) => {
  await page.goto('/')
  // Open two windows
  await page.getByTestId('dock-icon-calculator').click()
  await page.getByTestId('dock-icon-notes').click()

  const calcWin = winFrame(page, 'calculator')
  const notesWin = winFrame(page, 'notes')

  // Notes was opened last, so it should be on top
  const notesZ = await notesWin.evaluate((el) => parseInt(window.getComputedStyle(el).zIndex))
  const calcZ = await calcWin.evaluate((el) => parseInt(window.getComputedStyle(el).zIndex))
  expect(notesZ).toBeGreaterThan(calcZ)

  // Click Calculator to bring it to the front — dispatch mousedown directly
  // to avoid the notes window intercepting the click
  await calcWin.evaluate((el) => {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
  })

  const calcZAfter = await calcWin.evaluate((el) => parseInt(window.getComputedStyle(el).zIndex))
  const notesZAfter = await notesWin.evaluate((el) => parseInt(window.getComputedStyle(el).zIndex))
  expect(calcZAfter).toBeGreaterThan(notesZAfter)
})
