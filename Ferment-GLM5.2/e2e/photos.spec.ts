import { test, expect } from '@playwright/test'

/**
 * Photos e2e — gallery grid, detail view, favorite toggle, persisted favorites.
 */

async function openPhotos(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('dock-icon-photos').click()
  await expect(page.getByTestId('photos-content')).toBeVisible()
}

test.describe('Photos', () => {
  test('opens from Dock showing the library grid', async ({ page }) => {
    await openPhotos(page)
    await expect(page.getByTestId('photos-grid')).toBeVisible()
    // All 12 bundled photos render.
    await expect(page.getByTestId('photos-thumb')).toHaveCount(12)
  })

  test('clicking a thumbnail opens the detail view', async ({ page }) => {
    await openPhotos(page)
    await page.getByTestId('photos-thumb').first().click()
    await expect(page.getByTestId('photos-detail')).toBeVisible()
    await expect(page.getByTestId('photos-detail-image')).toBeVisible()
  })

  test('back button returns to the grid', async ({ page }) => {
    await openPhotos(page)
    await page.getByTestId('photos-thumb').first().click()
    await expect(page.getByTestId('photos-detail')).toBeVisible()
    await page.getByTestId('photos-back').click()
    await expect(page.getByTestId('photos-grid')).toBeVisible()
  })

  test('favoriting a photo marks it with a heart on the thumbnail', async ({ page }) => {
    await openPhotos(page)
    const first = page.getByTestId('photos-thumb').first()
    // Not favorited initially.
    await expect(first.getByTestId('photos-thumb-fav')).toHaveCount(0)
    await first.click()
    await page.getByTestId('photos-favorite-toggle').click()
    await page.getByTestId('photos-back').click()
    // Now favorited — heart appears on the thumbnail.
    await expect(first.getByTestId('photos-thumb-fav')).toBeVisible()
  })

  test('favorites appear in the Favorites view', async ({ page }) => {
    await openPhotos(page)
    // Favorite the first two photos.
    const thumbs = page.getByTestId('photos-thumb')
    await thumbs.nth(0).click()
    await page.getByTestId('photos-favorite-toggle').click()
    await page.getByTestId('photos-back').click()
    await thumbs.nth(1).click()
    await page.getByTestId('photos-favorite-toggle').click()
    await page.getByTestId('photos-back').click()
    // Switch to favorites.
    await page.getByTestId('photos-view-favorites').click()
    await expect(page.getByTestId('photos-thumb')).toHaveCount(2)
  })

  test('un-favoriting removes a photo from Favorites', async ({ page }) => {
    await openPhotos(page)
    // Favorite first photo via detail view.
    await page.getByTestId('photos-thumb').first().click()
    await page.getByTestId('photos-favorite-toggle').click()
    await expect(page.locator('[data-testid="photos-favorite-toggle"] svg')).toHaveClass(/fill-/)
    // Toggle again to unfavorite.
    await page.getByTestId('photos-favorite-toggle').click()
    await page.getByTestId('photos-back').click()
    await page.getByTestId('photos-view-favorites').click()
    await expect(page.getByTestId('photos-empty')).toBeVisible()
  })

  test('favorites persist across a full reload', async ({ page }) => {
    await openPhotos(page)
    await page.getByTestId('photos-thumb').first().click()
    await page.getByTestId('photos-favorite-toggle').click()
    await page.getByTestId('photos-back').click()
    await page.reload()
    await openPhotos(page)
    // The first thumbnail should still show the favorite heart.
    await expect(page.getByTestId('photos-thumb').first().getByTestId('photos-thumb-fav')).toBeVisible()
    // And the Favorites view should list it.
    await page.getByTestId('photos-view-favorites').click()
    await expect(page.getByTestId('photos-thumb')).toHaveCount(1)
  })

  test('empty Favorites view shows a placeholder', async ({ page }) => {
    await openPhotos(page)
    await page.getByTestId('photos-view-favorites').click()
    await expect(page.getByTestId('photos-empty')).toBeVisible()
  })
})
