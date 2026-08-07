import { test, expect } from '@playwright/test'

/**
 * Spotlight e2e — step 5 acceptance: Cmd+Space opens it, typing filters,
 * Enter (or click) launches the selected app, Esc closes.
 */
test.describe('Spotlight', () => {
  test('opens with Cmd+Space', async ({ page }) => {
    await page.goto('/')
    // Wait for the shell to mount so the global keydown listener is armed.
    await expect(page.getByTestId('menu-bar')).toBeVisible()
    await page.keyboard.press('Meta+Space')
    await expect(page.getByTestId('spotlight')).toBeVisible()
  })

  test('opens via the menu bar trigger', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('spotlight-trigger').click()
    await expect(page.getByTestId('spotlight')).toBeVisible()
    await expect(page.getByTestId('spotlight-input')).toBeFocused()
  })

  test('typing filters results', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('spotlight-trigger').click()
    await page.getByTestId('spotlight-input').fill('calc')
    await expect(page.getByTestId('spotlight-result-calculator')).toBeVisible()
    await expect(page.getByTestId('spotlight-result-finder')).toHaveCount(0)
  })

  test('Enter launches the selected app', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('spotlight-trigger').click()
    await page.getByTestId('spotlight-input').fill('calc')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('window')).toBeVisible()
    await expect(page.getByTestId('spotlight')).toHaveCount(0)
  })

  test('Arrow keys move the selection and Enter launches it', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('spotlight-trigger').click()
    // Default results: finder, calculator, notes, test (in registry order).
    await expect(page.getByTestId('spotlight-result-finder')).toHaveAttribute(
      'data-selected',
      'true',
    )
    await page.keyboard.press('ArrowDown')
    await expect(page.getByTestId('spotlight-result-calculator')).toHaveAttribute(
      'data-selected',
      'true',
    )
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('window')).toBeVisible()
  })

  test('clicking a result launches it', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('spotlight-trigger').click()
    await page.getByTestId('spotlight-result-calculator').click()
    await expect(page.getByTestId('window')).toBeVisible()
  })

  test('Escape closes Spotlight', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('spotlight-trigger').click()
    await expect(page.getByTestId('spotlight')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('spotlight')).toHaveCount(0)
  })

  test('no-results message for unknown query', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('spotlight-trigger').click()
    await page.getByTestId('spotlight-input').fill('zzzznotanapp')
    await expect(page.getByTestId('spotlight-no-results')).toBeVisible()
  })
})
