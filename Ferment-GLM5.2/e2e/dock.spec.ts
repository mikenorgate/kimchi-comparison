import { test, expect } from '@playwright/test'

test('dock renders all 8 app icons', async ({ page }) => {
  await page.goto('/')
  const dock = page.getByTestId('dock')
  await expect(dock).toBeVisible()

  const expectedApps = ['finder', 'safari', 'notes', 'calculator', 'calendar', 'mail', 'terminal', 'settings']
  for (const appId of expectedApps) {
    await expect(page.getByTestId(`dock-icon-${appId}`)).toBeVisible()
  }
})

test('dock icon scales up on hover', async ({ page }) => {
  await page.goto('/')

  const calculatorIcon = page.getByTestId('dock-icon-calculator')

  // Get initial scale
  const beforeScale = await calculatorIcon.evaluate((el) => {
    return window.getComputedStyle(el).transform
  })

  // Hover over the calculator icon
  await calculatorIcon.hover()
  await page.waitForTimeout(200)

  // Get scale after hover
  const afterScale = await calculatorIcon.evaluate((el) => {
    return window.getComputedStyle(el).transform
  })

  // The transform should change (scale up from 1 to 1.6)
  expect(afterScale).not.toBe(beforeScale)
  expect(afterScale).toContain('matrix') // scale produces a matrix transform
})

test('neighbor icons scale slightly on hover', async ({ page }) => {
  await page.goto('/')

  // Hover over calculator (index 3 in the registry)
  const calculatorIcon = page.getByTestId('dock-icon-calculator')
  await calculatorIcon.hover()
  await page.waitForTimeout(200)

  // Check a neighbor icon (notes, index 2) also scaled
  const notesIcon = page.getByTestId('dock-icon-notes')
  const notesScale = await notesIcon.evaluate((el) => {
    return window.getComputedStyle(el).transform
  })

  // Should have a non-identity transform (scaled to 1.3)
  expect(notesScale).toContain('matrix')
})

test('clicking Calculator icon fires openApp event', async ({ page }) => {
  await page.goto('/')

  // Click the calculator dock icon
  await page.getByTestId('dock-icon-calculator').click()

  // Assert the openApp callback was called with 'calculator'
  const lastApp = await page.evaluate(() => {
    return (window as unknown as Record<string, unknown>).__lastOpenApp
  })
  expect(lastApp).toBe('calculator')
})

test('running app indicator dot is transparent when app is not running', async ({ page }) => {
  await page.goto('/')

  const indicator = page.getByTestId('dock-indicator-calculator')
  const bg = await indicator.evaluate((el) => {
    return window.getComputedStyle(el).background
  })
  // Should be transparent initially (no apps running) — rgba(0,0,0,0) is transparent
  expect(bg).toContain('rgba(0, 0, 0, 0)')
})
