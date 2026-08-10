import { test, expect } from '@playwright/test'

test.describe('End-to-End Persistence', () => {
  test('notes persist across full page reload', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-notes').click()

    // Create a note with identifiable content
    await page.getByTestId('notes-new').click()
    await page.waitForTimeout(200)
    await page.getByTestId('notes-textarea').fill('E2E Persistence Note\n\nCreated for persistence test.')
    await page.waitForTimeout(500)

    // Reload the page
    await page.reload()
    await page.getByTestId('dock-icon-notes').click()
    await page.waitForTimeout(300)

    // Verify note still exists
    const noteItems = page.locator('[data-testid^="notes-item-"]')
    const found = await noteItems.filter({ hasText: 'E2E Persistence Note' }).count()
    expect(found).toBe(1)

    // Click and verify content
    await noteItems.filter({ hasText: 'E2E Persistence Note' }).first().click()
    await page.waitForTimeout(300)
    await expect(page.getByTestId('notes-textarea')).toHaveValue(/E2E Persistence Note/)
  })

  test('virtual filesystem changes persist across full page reload', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()

    // Create a new folder on Desktop
    await page.getByTestId('finder-sidebar-desktop').click()
    await page.getByTestId('finder-new-folder').click()
    await page.waitForTimeout(200)
    await page.getByTestId('finder-rename-input').fill('Persistent Folder')
    await page.getByTestId('finder-rename-input').press('Enter')
    await page.waitForTimeout(300)

    // Create a new file on Documents
    await page.getByTestId('finder-sidebar-documents').click()
    await page.getByTestId('finder-new-file').click()
    await page.waitForTimeout(200)
    await page.getByTestId('finder-rename-input').fill('persistent-test.txt')
    await page.getByTestId('finder-rename-input').press('Enter')
    await page.waitForTimeout(300)

    // Reload the page
    await page.reload()
    await page.getByTestId('dock-icon-finder').click()
    await page.waitForTimeout(300)

    // Verify the folder persists on Desktop
    await page.getByTestId('finder-sidebar-desktop').click()
    await page.waitForTimeout(300)
    const desktopNodes = page.locator('[data-testid^="finder-node-"]')
    const folderFound = await desktopNodes.filter({ hasText: 'Persistent Folder' }).count()
    expect(folderFound).toBe(1)

    // Verify the file persists on Documents
    await page.getByTestId('finder-sidebar-documents').click()
    await page.waitForTimeout(300)
    const docNodes = page.locator('[data-testid^="finder-node-"]')
    const fileFound = await docNodes.filter({ hasText: 'persistent-test.txt' }).count()
    expect(fileFound).toBe(1)
  })

  test('settings persist across full page reload', async ({ page }) => {
    await page.goto('/')
    
    // Change appearance to dark
    await page.getByTestId('dock-icon-settings').click()
    await page.getByTestId('settings-appearance-dark').click()
    await page.waitForTimeout(300)

    // Change wallpaper
    await page.getByTestId('settings-nav-wallpaper').click()
    await page.getByTestId('settings-wallpaper-tahoe-gradient-3').click()
    await page.waitForTimeout(300)

    // Toggle reduce transparency
    await page.getByTestId('settings-nav-appearance').click()
    await page.getByTestId('settings-reduce-transparency').click()
    await page.waitForTimeout(300)

    // Reload the page
    await page.reload()
    await page.waitForTimeout(500)

    // Verify appearance persisted
    await expect(page.locator('html')).toHaveClass(/appearance-dark/)
    // Verify reduce transparency persisted
    await expect(page.locator('html')).toHaveClass(/reduce-transparency/)
  })

  test('all three stores persist simultaneously across reload', async ({ page }) => {
    await page.goto('/')

    // 1. Create a note
    await page.getByTestId('dock-icon-notes').click()
    await page.getByTestId('notes-new').click()
    await page.waitForTimeout(200)
    await page.getByTestId('notes-textarea').fill('Multi-Store Test\n\nTesting all stores together.')
    await page.waitForTimeout(500)

    // 2. Create a file in Finder
    await page.getByTestId('dock-icon-finder').click()
    await page.getByTestId('finder-sidebar-desktop').click()
    await page.getByTestId('finder-new-file').click()
    await page.waitForTimeout(200)
    await page.getByTestId('finder-rename-input').fill('multi-store-test.txt')
    await page.getByTestId('finder-rename-input').press('Enter')
    await page.waitForTimeout(300)

    // 3. Change settings
    await page.getByTestId('dock-icon-settings').click()
    await page.getByTestId('settings-appearance-tinted').click()
    await page.waitForTimeout(300)

    // Reload
    await page.reload()
    await page.waitForTimeout(500)

    // Verify all three persisted
    // Settings: tinted mode
    await expect(page.locator('html')).toHaveClass(/appearance-tinted/)

    // Notes: note still exists
    await page.getByTestId('dock-icon-notes').click()
    await page.waitForTimeout(300)
    const noteFound = await page.locator('[data-testid^="notes-item-"]').filter({ hasText: 'Multi-Store Test' }).count()
    expect(noteFound).toBe(1)

    // VFS: file still exists
    await page.getByTestId('dock-icon-finder').click()
    await page.getByTestId('finder-sidebar-desktop').click()
    await page.waitForTimeout(300)
    const fileFound = await page.locator('[data-testid^="finder-node-"]').filter({ hasText: 'multi-store-test.txt' }).count()
    expect(fileFound).toBe(1)
  })
})
