import { test, expect } from '@playwright/test'

test.describe('Appearance Modes & Reduce Transparency', () => {
  test('light mode is default and applies appearance-light class', async ({ page }) => {
    await page.goto('/')
    const root = page.locator('html')
    await expect(root).toHaveClass(/appearance-light/)
    await expect(root).not.toHaveClass(/appearance-dark/)
    await expect(root).not.toHaveClass(/appearance-tinted/)
  })

  test('dark mode applies appearance-dark class to root', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()
    await page.getByTestId('settings-appearance-dark').click()
    await expect(page.locator('html')).toHaveClass(/appearance-dark/)
  })

  test('tinted mode applies appearance-tinted class to root', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()
    await page.getByTestId('settings-appearance-tinted').click()
    await expect(page.locator('html')).toHaveClass(/appearance-tinted/)
  })

  test('appearance modes cycle correctly: light → dark → tinted → light', async ({ page }) => {
    await page.goto('/')
    const root = page.locator('html')
    await page.getByTestId('dock-icon-settings').click()

    await page.getByTestId('settings-appearance-dark').click()
    await expect(root).toHaveClass(/appearance-dark/)

    await page.getByTestId('settings-appearance-tinted').click()
    await expect(root).toHaveClass(/appearance-tinted/)

    await page.getByTestId('settings-appearance-light').click()
    await expect(root).toHaveClass(/appearance-light/)
  })

  test('reduce transparency toggle adds and removes class', async ({ page }) => {
    await page.goto('/')
    const root = page.locator('html')
    await page.getByTestId('dock-icon-settings').click()

    await expect(root).not.toHaveClass(/reduce-transparency/)
    await page.getByTestId('settings-reduce-transparency').click()
    await expect(root).toHaveClass(/reduce-transparency/)
    await page.getByTestId('settings-reduce-transparency').click()
    await expect(root).not.toHaveClass(/reduce-transparency/)
  })

  test('appearance mode persists across page reload', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()
    await page.getByTestId('settings-appearance-dark').click()
    await expect(page.locator('html')).toHaveClass(/appearance-dark/)

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/appearance-dark/)
  })

  test('reduce transparency persists across page reload', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()
    await page.getByTestId('settings-reduce-transparency').click()
    await expect(page.locator('html')).toHaveClass(/reduce-transparency/)

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/reduce-transparency/)
  })

  test('glass surfaces have backdrop-filter in light mode', async ({ page }) => {
    await page.goto('/')
    const menubar = page.getByTestId('menubar')
    const filter = await menubar.evaluate((el) => getComputedStyle(el).backdropFilter)
    expect(filter.length).toBeGreaterThan(0)
  })

  test('glass surfaces have backdrop-filter in dark mode', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()
    await page.getByTestId('settings-appearance-dark').click()

    const menubar = page.getByTestId('menubar')
    const filter = await menubar.evaluate((el) => getComputedStyle(el).backdropFilter)
    expect(filter.length).toBeGreaterThan(0)
  })

  test('settings display shows current appearance mode', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()
    await expect(page.getByTestId('settings-current-appearance')).toHaveText('light')

    await page.getByTestId('settings-appearance-dark').click()
    await expect(page.getByTestId('settings-current-appearance')).toHaveText('dark')
  })
})
