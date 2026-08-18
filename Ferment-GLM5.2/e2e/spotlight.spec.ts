import { test, expect } from '@playwright/test'

// Helper: dispatch a Cmd+Space keydown event directly to the document
async function pressSpotlightHotkey(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    }))
  })
}

test('Spotlight opens on Cmd+Space', async ({ page }) => {
  await page.goto('/')
  await pressSpotlightHotkey(page)
  await expect(page.getByTestId('spotlight-overlay')).toBeVisible()
  await expect(page.getByTestId('spotlight-input')).toBeVisible()
})

test('Spotlight filters results by typing', async ({ page }) => {
  await page.goto('/')
  await pressSpotlightHotkey(page)
  await expect(page.getByTestId('spotlight-overlay')).toBeVisible()

  await page.getByTestId('spotlight-input').fill('calc')
  await expect(page.getByTestId('spotlight-result-calculator')).toBeVisible()
  await expect(page.getByTestId('spotlight-result-calculator')).toHaveAttribute('data-selected', 'true')
})

test('Spotlight launches selected app on Enter', async ({ page }) => {
  await page.goto('/')
  await pressSpotlightHotkey(page)
  await expect(page.getByTestId('spotlight-overlay')).toBeVisible()

  await page.getByTestId('spotlight-input').fill('calc')
  await expect(page.getByTestId('spotlight-result-calculator')).toBeVisible()

  await page.keyboard.press('Enter')
  await expect(page.getByTestId('spotlight-overlay')).not.toBeVisible()
  await expect(page.locator('[data-testid="window-frame"][data-app-id="calculator"]')).toBeVisible()
})

test('Spotlight arrow keys navigate between results', async ({ page }) => {
  await page.goto('/')
  await pressSpotlightHotkey(page)
  await expect(page.getByTestId('spotlight-overlay')).toBeVisible()

  // Type a broad query that matches multiple apps (e.g. 'a' matches Calendar, Mail, Safari, Calculator)
  await page.getByTestId('spotlight-input').fill('a')

  // First result should be selected
  const results = page.locator('[data-testid^="spotlight-result-"]')
  const count = await results.count()
  expect(count).toBeGreaterThan(1)

  // First result has data-selected=true
  await expect(results.nth(0)).toHaveAttribute('data-selected', 'true')
  await expect(results.nth(1)).toHaveAttribute('data-selected', 'false')

  // Press ArrowDown — selection moves to second result
  await page.keyboard.press('ArrowDown')
  await expect(results.nth(0)).toHaveAttribute('data-selected', 'false')
  await expect(results.nth(1)).toHaveAttribute('data-selected', 'true')

  // Press ArrowUp — selection moves back to first
  await page.keyboard.press('ArrowUp')
  await expect(results.nth(0)).toHaveAttribute('data-selected', 'true')
  await expect(results.nth(1)).toHaveAttribute('data-selected', 'false')
})

test('Spotlight closes on Escape', async ({ page }) => {
  await page.goto('/')
  await pressSpotlightHotkey(page)
  await expect(page.getByTestId('spotlight-overlay')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('spotlight-overlay')).not.toBeVisible()
})
