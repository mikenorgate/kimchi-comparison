import { test, expect } from '@playwright/test'

test.describe('Safari', () => {
  test('renders with tabs, bookmarks bar, and start page', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-safari').click()
    await expect(page.getByTestId('safari-root')).toBeVisible()
    await expect(page.getByTestId('safari-tabs')).toBeVisible()
    await expect(page.getByTestId('safari-bookmarks')).toBeVisible()
    await expect(page.getByTestId('safari-address-bar')).toBeVisible()
    await expect(page.getByTestId('safari-content')).toBeVisible()
    await expect(page.getByTestId('safari-content').getByRole('heading', { name: 'Start Page' })).toBeVisible()
  })

  test('add and close tabs', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-safari').click()
    await expect(page.getByTestId('safari-root')).toBeVisible()

    expect(await page.locator('[data-testid^="safari-tab-safari-tab-"]').count()).toBe(1)

    await page.getByTestId('safari-new-tab').click()
    await page.waitForTimeout(300)
    expect(await page.locator('[data-testid^="safari-tab-safari-tab-"]').count()).toBe(2)

    // Close the second tab — use close button locator directly
    const closeButtons = page.locator('[data-testid^="safari-tab-close-"]')
    await closeButtons.nth(1).click({ force: true })
    await page.waitForTimeout(300)
    expect(await page.locator('[data-testid^="safari-tab-safari-tab-"]').count()).toBe(1)
  })

  test('navigate via address bar', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-safari').click()
    await expect(page.getByTestId('safari-root')).toBeVisible()

    await page.getByTestId('safari-address-bar').click()
    await page.getByTestId('safari-address-bar').fill('apple.com')
    await page.getByTestId('safari-address-bar').press('Enter')
    await page.waitForTimeout(500)

    await expect(page.getByTestId('safari-content')).toContainText('MacBook Pro')
  })

  test('navigate via bookmark', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-safari').click()
    await expect(page.getByTestId('safari-root')).toBeVisible()

    await page.getByTestId('safari-bookmark-news-mock').click()
    await page.waitForTimeout(500)

    await expect(page.getByTestId('safari-content')).toContainText('Tahoe Liquid Glass')
  })

  test('back and forward navigation', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-safari').click()

    await page.getByTestId('safari-address-bar').click()
    await page.getByTestId('safari-address-bar').fill('apple.com')
    await page.getByTestId('safari-address-bar').press('Enter')
    await page.waitForTimeout(500)
    await expect(page.getByTestId('safari-content')).toContainText('MacBook Pro')

    await page.getByTestId('safari-back').click()
    await page.waitForTimeout(500)
    await expect(page.getByTestId('safari-content').getByRole('heading', { name: 'Start Page' })).toBeVisible()

    await page.getByTestId('safari-forward').click()
    await page.waitForTimeout(500)
    await expect(page.getByTestId('safari-content')).toContainText('MacBook Pro')
  })

  test('start page shows favorites', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-safari').click()
    await expect(page.getByTestId('safari-root')).toBeVisible()

    await expect(page.getByTestId('safari-content')).toContainText('Favorites')
    await expect(page.getByTestId('safari-content').getByText('Apple')).toBeVisible()
  })
})
