import { test, expect } from '@playwright/test'

/**
 * Safari e2e — favorites start page, address bar loads URL into iframe,
 * embedding-block fallback, tabs, bookmarks add/persist.
 */

async function openSafari(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('dock-icon-safari').click()
  await expect(page.getByTestId('safari-content')).toBeVisible()
}

test.describe('Safari', () => {
  test('opens from Dock on the start page with favorites', async ({ page }) => {
    await openSafari(page)
    await expect(page.getByTestId('safari-start-page')).toBeVisible()
    await expect(page.getByTestId('safari-favorite').filter({ hasText: 'Apple' })).toBeVisible()
    await expect(page.getByTestId('safari-favorite').filter({ hasText: 'Wikipedia' })).toBeVisible()
  })

  test('clicking a favorite loads the URL into the iframe', async ({ page }) => {
    await openSafari(page)
    await page.getByTestId('safari-favorite').filter({ hasText: 'Example' }).click()
    const iframe = page.getByTestId('safari-iframe')
    await expect(iframe).toBeVisible()
    await expect(iframe).toHaveAttribute('src', 'https://example.com')
  })

  test('address bar loads a typed URL into the iframe', async ({ page }) => {
    await openSafari(page)
    await page.getByTestId('safari-address').fill('example.com')
    await page.getByTestId('safari-address').press('Enter')
    const iframe = page.getByTestId('safari-iframe')
    await expect(iframe).toBeVisible()
    await expect(iframe).toHaveAttribute('src', 'https://example.com')
  })

  test('address bar normalizes a URL without a scheme', async ({ page }) => {
    await openSafari(page)
    await page.getByTestId('safari-address').fill('www.wikipedia.org')
    await page.getByTestId('safari-address').press('Enter')
    await expect(page.getByTestId('safari-iframe')).toHaveAttribute('src', 'https://www.wikipedia.org')
  })

  test('embedding-block fallback shows for a non-loading URL', async ({ page }) => {
    await openSafari(page)
    // A non-routable IP hangs the connection, so the load timeout fires.
    await page.getByTestId('safari-address').fill('https://10.255.255.1')
    await page.getByTestId('safari-address').press('Enter')
    // The fallback should appear after the load timeout (~2.5s).
    await expect(page.getByTestId('safari-fallback')).toBeVisible({ timeout: 8000 })
    await expect(page.getByTestId('safari-open-external')).toBeVisible()
  })

  test('bookmarking the current page adds it to the bookmarks bar', async ({ page }) => {
    await openSafari(page)
    await page.getByTestId('safari-address').fill('https://example.com')
    await page.getByTestId('safari-address').press('Enter')
    await page.getByTestId('safari-bookmark-add').click()
    await expect(page.getByTestId('safari-bookmark').filter({ hasText: 'example.com' })).toBeVisible()
  })

  test('bookmarks persist across a full reload', async ({ page }) => {
    await openSafari(page)
    await page.getByTestId('safari-address').fill('https://example.com')
    await page.getByTestId('safari-address').press('Enter')
    await page.getByTestId('safari-bookmark-add').click()
    await page.reload()
    await openSafari(page)
    await expect(page.getByTestId('safari-bookmark').filter({ hasText: 'example.com' })).toBeVisible()
  })

  test('new tab shows the start page', async ({ page }) => {
    await openSafari(page)
    // First navigate away from the start page.
    await page.getByTestId('safari-favorite').filter({ hasText: 'Example' }).click()
    await expect(page.getByTestId('safari-iframe')).toBeVisible()
    // Open a new tab — it should show the start page.
    await page.getByTestId('safari-new-tab').click()
    await expect(page.getByTestId('safari-start-page')).toBeVisible()
  })

  test('closing the last tab opens a fresh start page', async ({ page }) => {
    await openSafari(page)
    await page.getByTestId('safari-close-tab').click()
    // Still one tab, still on the start page.
    await expect(page.getByTestId('safari-start-page')).toBeVisible()
  })
})
