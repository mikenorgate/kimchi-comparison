import { test, expect } from '@playwright/test'

test.describe('Finder', () => {
  test('renders with sidebar and icon view by default', async ({ page }) => {
    await page.goto('/')

    // Open Finder via dock
    await page.getByTestId('dock-icon-finder').click()
    await expect(page.getByTestId('finder-root')).toBeVisible()
    await expect(page.getByTestId('finder-sidebar')).toBeVisible()
    await expect(page.getByTestId('finder-icon-view')).toBeVisible()
  })

  test('sidebar navigation switches folders', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await expect(page.getByTestId('finder-root')).toBeVisible()

    // Click Desktop in sidebar
    await page.getByTestId('finder-sidebar-desktop').click()
    await expect(page.getByTestId('finder-breadcrumb')).toContainText('Desktop')

    // Click Documents
    await page.getByTestId('finder-sidebar-documents').click()
    await expect(page.getByTestId('finder-breadcrumb')).toContainText('Documents')
  })

  test('icon/list/column view toggle', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await expect(page.getByTestId('finder-root')).toBeVisible()

    // Default is icon view
    await expect(page.getByTestId('finder-icon-view')).toBeVisible()

    // Switch to list view
    await page.getByTestId('finder-view-list').click()
    await expect(page.getByTestId('finder-list-view')).toBeVisible()

    // Switch to column view
    await page.getByTestId('finder-view-column').click()
    await expect(page.getByTestId('finder-column-view')).toBeVisible()

    // Switch back to icon view
    await page.getByTestId('finder-view-icon').click()
    await expect(page.getByTestId('finder-icon-view')).toBeVisible()
  })

  test('folder navigation via double-click', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await expect(page.getByTestId('finder-root')).toBeVisible()

    // Navigate to Documents via sidebar
    await page.getByTestId('finder-sidebar-documents').click()
    await expect(page.getByTestId('finder-breadcrumb')).toContainText('Documents')

    // Double-click the Work folder
    const workFolder = page.getByTestId('finder-node-docs-work')
    await workFolder.dblclick()

    // Breadcrumb should show Work
    await expect(page.getByTestId('finder-breadcrumb')).toContainText('Work')

    // Should see Meeting Notes file
    await expect(page.getByTestId('finder-node-work-notes')).toBeVisible()
  })

  test('create a new folder', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await expect(page.getByTestId('finder-root')).toBeVisible()

    // Go to Desktop
    await page.getByTestId('finder-sidebar-desktop').click()

    // Count existing nodes
    const initialCount = await page.locator('[data-testid^="finder-node-"]').count()

    // Click new folder button
    await page.getByTestId('finder-new-folder').click()

    // A rename input should appear
    await expect(page.getByTestId('finder-rename-input')).toBeVisible()

    // Type a name and press Enter
    await page.getByTestId('finder-rename-input').fill('My Test Folder')
    await page.getByTestId('finder-rename-input').press('Enter')

    // Wait for rename to commit
    await page.waitForTimeout(200)

    // New folder should exist
    const newCount = await page.locator('[data-testid^="finder-node-"]').count()
    expect(newCount).toBe(initialCount + 1)
  })

  test('create a new file', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()

    await page.getByTestId('finder-sidebar-documents').click()
    const initialCount = await page.locator('[data-testid^="finder-node-"]').count()

    await page.getByTestId('finder-new-file').click()
    await expect(page.getByTestId('finder-rename-input')).toBeVisible()
    await page.getByTestId('finder-rename-input').fill('test-file.txt')
    await page.getByTestId('finder-rename-input').press('Enter')
    await page.waitForTimeout(200)

    const newCount = await page.locator('[data-testid^="finder-node-"]').count()
    expect(newCount).toBe(initialCount + 1)
  })

  test('rename a file', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()

    // Go to Desktop where Project Ideas.txt lives
    await page.getByTestId('finder-sidebar-desktop').click()
    await expect(page.getByTestId('finder-node-desktop-proj')).toBeVisible()

    // Right-click to open context menu
    await page.getByTestId('finder-node-desktop-proj').click({ button: 'right' })
    await expect(page.getByTestId('finder-context-menu')).toBeVisible()

    // Click Rename
    await page.getByTestId('finder-context-menu').getByText('Rename').click()
    await expect(page.getByTestId('finder-rename-input')).toBeVisible()

    await page.getByTestId('finder-rename-input').fill('Renamed File.txt')
    await page.getByTestId('finder-rename-input').press('Enter')
    await page.waitForTimeout(200)

    // Verify the node still exists (renamed)
    await expect(page.getByTestId('finder-node-desktop-proj')).toBeVisible()
    await expect(page.getByTestId('finder-node-desktop-proj')).toContainText('Renamed File.txt')
  })

  test('delete a file via context menu', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()

    await page.getByTestId('finder-sidebar-desktop').click()
    const initialCount = await page.locator('[data-testid^="finder-node-"]').count()

    // Right-click on Screenshot.png
    await page.getByTestId('finder-node-desktop-screenshot').click({ button: 'right' })
    await expect(page.getByTestId('finder-context-menu')).toBeVisible()

    // Click Move to Trash
    await page.getByTestId('finder-context-menu').getByText('Move to Trash').click()
    await page.waitForTimeout(200)

    const newCount = await page.locator('[data-testid^="finder-node-"]').count()
    expect(newCount).toBe(initialCount - 1)
  })

  test('tags can be applied via context menu', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()

    await page.getByTestId('finder-sidebar-desktop').click()

    // Right-click on Project Ideas.txt
    await page.getByTestId('finder-node-desktop-proj').click({ button: 'right' })
    await expect(page.getByTestId('finder-context-menu')).toBeVisible()

    // Apply the "red" tag (it already has blue, add red)
    await page.getByTestId('finder-tag-red').click()
    await page.waitForTimeout(200)

    // Right-click again to verify red tag is checked
    await page.getByTestId('finder-node-desktop-proj').click({ button: 'right' })
    await expect(page.getByTestId('finder-context-menu')).toBeVisible()
    await expect(page.getByTestId('finder-tag-red')).toContainText('✓')
  })

  test('tabs can be added and closed', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()
    await expect(page.getByTestId('finder-root')).toBeVisible()

    // Initially one tab
    expect(await page.locator('[data-testid^="finder-tab-tab-"]').count()).toBe(1)

    // Add a new tab
    await page.getByTestId('finder-new-tab').click()
    await page.waitForTimeout(300)
    expect(await page.locator('[data-testid^="finder-tab-tab-"]').count()).toBe(2)

    // Switch to the second tab, then close it using force click
    const closeButtons = page.locator('[data-testid^="finder-tab-close-"]')
    await expect(closeButtons.first()).toBeVisible()
    await closeButtons.nth(1).click({ force: true })
    await page.waitForTimeout(300)

    expect(await page.locator('[data-testid^="finder-tab-tab-"]').count()).toBe(1)
  })

  test('breadcrumb navigation goes back to parent', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-finder').click()

    // Navigate to Documents → Work
    await page.getByTestId('finder-sidebar-documents').click()
    await page.getByTestId('finder-node-docs-work').dblclick()
    await expect(page.getByTestId('finder-breadcrumb')).toContainText('Work')

    // Click back button to go to Documents
    await page.getByTestId('finder-back').click()
    await expect(page.getByTestId('finder-breadcrumb')).toContainText('Documents')
    await expect(page.getByTestId('finder-breadcrumb')).not.toContainText('Work')
  })
})
