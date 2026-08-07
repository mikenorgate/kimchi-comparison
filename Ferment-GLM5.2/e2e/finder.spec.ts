import { test, expect } from '@playwright/test'

/**
 * Finder e2e — sidebar navigation, back/forward, browser view, open-file
 * dispatch to the owning app, and create/delete/rename (persisted via VFS).
 *
 * Each test gets a fresh browser context → empty localStorage → VFS store
 * rehydrates from the deterministic seed (Desktop/Documents/Downloads/
 * Pictures/Projects + Welcome.txt/readme.md/hello.txt).
 */

test.describe('Finder', () => {
  test('opens from Dock and shows sidebar favorites', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await expect(page.getByTestId('finder-content')).toBeVisible()
    await expect(page.getByTestId('finder-sidebar')).toBeVisible()
    await expect(page.getByTestId('finder-fav-desktop')).toBeVisible()
    await expect(page.getByTestId('finder-fav-documents')).toBeVisible()
    await expect(page.getByTestId('finder-fav-projects')).toBeVisible()
  })

  test('sidebar navigation switches the current folder', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    // Default view is Documents (has readme.md + Notes folder).
    await expect(page.getByTestId('finder-path')).toHaveText('/Documents')
    // Navigate to Desktop.
    await page.getByTestId('finder-fav-desktop').click()
    await expect(page.getByTestId('finder-path')).toHaveText('/Desktop')
    await expect(page.getByTestId('finder-name-welcome')).toBeVisible()
  })

  test('double-clicking a folder navigates into it', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    // Documents has a "Notes" subfolder — double-click it.
    await page.getByTestId('finder-item-notes-folder').dblclick()
    await expect(page.getByTestId('finder-path')).toHaveText('/Documents/Notes')
  })

  test('back returns to the previous folder', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await page.getByTestId('finder-item-notes-folder').dblclick()
    await expect(page.getByTestId('finder-path')).toHaveText('/Documents/Notes')
    await page.getByTestId('finder-back').click()
    await expect(page.getByTestId('finder-path')).toHaveText('/Documents')
  })

  test('forward advances after going back', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await page.getByTestId('finder-item-notes-folder').dblclick()
    await page.getByTestId('finder-back').click()
    await expect(page.getByTestId('finder-path')).toHaveText('/Documents')
    await page.getByTestId('finder-forward').click()
    await expect(page.getByTestId('finder-path')).toHaveText('/Documents/Notes')
  })

  test('New Folder creates a folder in the current directory', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await page.getByTestId('finder-new-folder').click()
    // A new folder named "untitled folder" should appear with rename input active.
    await expect(page.getByTestId('finder-rename-input')).toBeVisible()
    await expect(
      page.locator('[data-name="untitled folder"]'),
    ).toBeVisible()
  })

  test('Delete removes a file from the list', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await page.getByTestId('finder-fav-desktop').click()
    await expect(page.getByTestId('finder-name-welcome')).toBeVisible()
    await page.getByTestId('finder-delete-welcome').click()
    await expect(page.getByTestId('finder-name-welcome')).toHaveCount(0)
  })

  test('Rename changes a file name', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await page.getByTestId('finder-fav-desktop').click()
    await page.getByTestId('finder-rename-welcome').click()
    const input = page.getByTestId('finder-rename-input')
    await input.fill('Renamed.txt')
    await input.press('Enter')
    await expect(page.getByTestId('finder-name-welcome')).toHaveText('Renamed.txt')
  })

  test('double-clicking a text file opens it in Notes', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await page.getByTestId('finder-fav-desktop').click()
    await page.getByTestId('finder-item-welcome').dblclick()
    // A Notes window should appear with the notes-content testid.
    await expect(page.getByTestId('notes-content')).toBeVisible()
  })

  test('created folder persists across a full reload', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    // Create a folder in Documents (the default view).
    await page.getByTestId('finder-new-folder').click()
    await expect(
      page.locator('[data-name="untitled folder"]'),
    ).toBeVisible()
    // Reload — the Finder window closes but the VFS persists in localStorage.
    await page.reload()
    // Reopen Finder; it starts at Documents where the folder was created.
    await page.getByTestId('dock-icon-finder').click()
    await expect(
      page.locator('[data-name="untitled folder"]'),
    ).toBeVisible()
  })
})
