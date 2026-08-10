import { test, expect } from '@playwright/test'

test.describe('MenuBar', () => {
  test('menubar renders with #menubar id and floating icons', async ({ page }) => {
    await page.goto('/')

    const menubar = page.locator('#menubar')
    await expect(menubar).toBeVisible()

    // Apple logo button
    await expect(page.getByTestId('menu-title-apple')).toBeVisible()

    // Active app name "Finder" is bold
    const appName = menubar.locator('.font-semibold')
    await expect(appName).toContainText('Finder')

    // App menu titles present
    await expect(page.getByTestId('menu-title-file')).toContainText('File')
    await expect(page.getByTestId('menu-title-edit')).toContainText('Edit')
    await expect(page.getByTestId('menu-title-view')).toContainText('View')
    await expect(page.getByTestId('menu-title-window')).toContainText('Window')
    await expect(page.getByTestId('menu-title-help')).toContainText('Help')

    // Floating icons present
    await expect(page.getByTestId('menubar-icons')).toBeVisible()
    await expect(page.getByTestId('menubar-battery')).toBeVisible()
    await expect(page.getByTestId('menubar-wifi')).toBeVisible()
    await expect(page.getByTestId('menubar-spotlight')).toBeVisible()
    await expect(page.getByTestId('menubar-datetime')).toBeVisible()
    await expect(page.getByTestId('menubar-control-center')).toBeVisible()
    await expect(page.getByTestId('menubar-notification-center')).toBeVisible()

    // Date/time is not empty
    const dt = await page.getByTestId('menubar-datetime').textContent()
    expect(dt).toBeTruthy()
    expect(dt!.length).toBeGreaterThan(3)
  })

  test('Apple menu dropdown opens with expected items', async ({ page }) => {
    await page.goto('/')

    // Click Apple logo
    await page.getByTestId('menu-title-apple').click()

    // Dropdown visible
    const dropdown = page.getByTestId('menu-dropdown-apple')
    await expect(dropdown).toBeVisible()

    // First item is "About This Mac"
    const aboutItem = page.getByTestId('menu-item-apple-0')
    await expect(aboutItem).toBeVisible()
    await expect(aboutItem).toContainText('About This Mac')

    // System Settings is present (disabled)
    await expect(dropdown.locator('li', { hasText: 'System Settings' })).toBeVisible()

    // Sleep and Shut Down are present
    await expect(dropdown.locator('li', { hasText: 'Sleep' })).toBeVisible()
    await expect(dropdown.locator('li', { hasText: 'Shut Down' })).toBeVisible()
  })

  test('app menus are present and open dropdowns', async ({ page }) => {
    await page.goto('/')

    // File menu
    await page.getByTestId('menu-title-file').click()
    const fileDropdown = page.getByTestId('menu-dropdown-file')
    await expect(fileDropdown).toBeVisible()
    await expect(fileDropdown.locator('li', { hasText: 'New Finder Window' })).toBeVisible()

    // Edit menu
    await page.getByTestId('menu-title-edit').click()
    const editDropdown = page.getByTestId('menu-dropdown-edit')
    await expect(editDropdown).toBeVisible()
    await expect(editDropdown.locator('li', { hasText: 'Undo' })).toBeVisible()
    await expect(editDropdown.locator('li', { hasText: 'Copy' })).toBeVisible()

    // View menu
    await page.getByTestId('menu-title-view').click()
    const viewDropdown = page.getByTestId('menu-dropdown-view')
    await expect(viewDropdown).toBeVisible()
    await expect(viewDropdown.locator('li', { hasText: 'as Icons' })).toBeVisible()

    // Window menu
    await page.getByTestId('menu-title-window').click()
    const winDropdown = page.getByTestId('menu-dropdown-window')
    await expect(winDropdown).toBeVisible()
    await expect(winDropdown.locator('li', { hasText: 'Minimize' })).toBeVisible()

    // Help menu
    await page.getByTestId('menu-title-help').click()
    const helpDropdown = page.getByTestId('menu-dropdown-help')
    await expect(helpDropdown).toBeVisible()
  })

  test('clicking outside closes the open dropdown', async ({ page }) => {
    await page.goto('/')

    // Open File menu
    await page.getByTestId('menu-title-file').click()
    await expect(page.getByTestId('menu-dropdown-file')).toBeVisible()

    // Click on desktop background (outside menubar)
    await page.locator('.desktop').click({ position: { x: 50, y: 200 } })

    // Dropdown closes
    await expect(page.getByTestId('menu-dropdown-file')).not.toBeVisible()
  })

  test('View > Use Dark Appearance changes appearance class on html', async ({ page }) => {
    await page.goto('/')

    // Initially light
    await expect(page.locator('html')).toHaveClass(/appearance-light/)

    // Open View menu and click "Use Dark Appearance"
    await page.getByTestId('menu-title-view').click()
    await page.getByRole('menuitem', { name: 'Use Dark Appearance' }).click()

    // Appearance should change to dark
    await expect(page.locator('html')).toHaveClass(/appearance-dark/)

    // Click again to toggle back to light
    await page.getByTestId('menu-title-view').click()
    await page.getByRole('menuitem', { name: 'Use Dark Appearance' }).click()

    await expect(page.locator('html')).toHaveClass(/appearance-light/)
  })

  test('About This Mac opens overlay', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('menu-title-apple').click()
    await page.getByTestId('menu-item-apple-0').click()

    const overlay = page.getByTestId('about-overlay')
    await expect(overlay).toBeVisible()
    await expect(overlay.locator('text=macOS Tahoe')).toBeVisible()

    // Close via button
    await page.getByTestId('about-close').click()
    await expect(overlay).not.toBeVisible()
  })

  test('hovering another menu while one is open switches to it', async ({ page }) => {
    await page.goto('/')

    // Open File menu
    await page.getByTestId('menu-title-file').click()
    await expect(page.getByTestId('menu-dropdown-file')).toBeVisible()

    // Hover Edit menu title
    await page.getByTestId('menu-title-edit').hover()
    await expect(page.getByTestId('menu-dropdown-edit')).toBeVisible()
    await expect(page.getByTestId('menu-dropdown-file')).not.toBeVisible()
  })
})
