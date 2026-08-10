import { test, expect } from '@playwright/test'

test.describe('System Settings', () => {
  test('renders with sidebar and appearance pane', async ({ page }) => {
    await page.goto('/')

    // Open System Settings via dock
    await page.getByTestId('dock-icon-settings').click()
    await expect(page.getByTestId('settings-root')).toBeVisible()
    await expect(page.getByTestId('settings-sidebar')).toBeVisible()
    await expect(page.getByTestId('settings-appearance-pane')).toBeVisible()
  })

  test('sidebar navigation switches panes', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()
    await expect(page.getByTestId('settings-root')).toBeVisible()

    // Navigate to Wallpaper
    await page.getByTestId('settings-nav-wallpaper').click()
    await expect(page.getByTestId('settings-wallpaper-pane')).toBeVisible()

    // Navigate to Desktop & Dock
    await page.getByTestId('settings-nav-desktop-dock').click()
    await expect(page.getByTestId('settings-desktop-dock-pane')).toBeVisible()

    // Navigate to Network
    await page.getByTestId('settings-nav-network').click()
    await expect(page.getByTestId('settings-network-pane')).toBeVisible()

    // Navigate to Sound
    await page.getByTestId('settings-nav-sound').click()
    await expect(page.getByTestId('settings-sound-pane')).toBeVisible()

    // Navigate to General
    await page.getByTestId('settings-nav-general').click()
    await expect(page.getByTestId('settings-general-pane')).toBeVisible()
  })

  test('appearance mode toggle changes desktop state', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()
    await expect(page.getByTestId('settings-appearance-pane')).toBeVisible()

    // Check initial state — default is light
    const root = page.locator('html')
    await expect(root).toHaveClass(/appearance-light/)

    // Click Dark mode
    await page.getByTestId('settings-appearance-dark').click()

    // Root class should change to appearance-dark
    await expect(root).toHaveClass(/appearance-dark/)

    // Click Tinted mode
    await page.getByTestId('settings-appearance-tinted').click()
    await expect(root).toHaveClass(/appearance-tinted/)

    // Click Light mode
    await page.getByTestId('settings-appearance-light').click()
    await expect(root).toHaveClass(/appearance-light/)
  })

  test('reduce transparency toggle changes root class', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()
    await expect(page.getByTestId('settings-appearance-pane')).toBeVisible()

    const root = page.locator('html')

    // Initially no reduce-transparency class
    await expect(root).not.toHaveClass(/reduce-transparency/)

    // Toggle on
    await page.getByTestId('settings-reduce-transparency').click()
    await expect(root).toHaveClass(/reduce-transparency/)

    // Toggle off
    await page.getByTestId('settings-reduce-transparency').click()
    await expect(root).not.toHaveClass(/reduce-transparency/)
  })

  test('wallpaper selection changes desktop background', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()

    // Navigate to Wallpaper pane
    await page.getByTestId('settings-nav-wallpaper').click()
    await expect(page.getByTestId('settings-wallpaper-pane')).toBeVisible()

    // Select a different wallpaper
    await page.getByTestId('settings-wallpaper-tahoe-gradient-3').click()
    await page.waitForTimeout(300)

    // Desktop background should have changed — check the desktop element's style
    const desktopBg = await page.locator('.desktop').evaluate((el) => {
      return getComputedStyle(el).background
    })
    // The wallpaper CSS includes 'linear-gradient' — verify it's set
    expect(desktopBg).toContain('gradient')

    // Select another wallpaper
    await page.getByTestId('settings-wallpaper-tahoe-gradient-5').click()
    await page.waitForTimeout(300)

    // Verify it's still a gradient
    const newBg = await page.locator('.desktop').evaluate((el) => {
      return getComputedStyle(el).background
    })
    expect(newBg).toContain('gradient')
  })

  test('network pane shows connected status', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-settings').click()

    await page.getByTestId('settings-nav-network').click()
    await expect(page.getByTestId('settings-network-pane')).toBeVisible()
    await expect(page.getByTestId('settings-network-status')).toContainText('Connected')
  })
})
