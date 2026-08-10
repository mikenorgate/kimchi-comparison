import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('[data-testid="dock-icon"]', { timeout: 10000 })
})

test('System Settings opens from Dock and renders Liquid Glass panels', async ({ page }) => {
  // Open System Settings from the Dock.
  await page.getByRole('button', { name: 'System Settings' }).click()

  const settingsDialog = page.getByRole('dialog', { name: 'System Settings' })
  await expect(settingsDialog).toBeVisible()
  await expect(settingsDialog).toContainText('General')
  await expect(settingsDialog).toContainText('Appearance')

  // Verify a glass panel inside System Settings has a non-none backdrop-filter.
  const glassPanel = settingsDialog.getByTestId('settings-glass-panel')
  await expect(glassPanel).toHaveCSS('backdrop-filter', /blur/)

  await page.screenshot({ path: 'e2e-report/system-settings-open.png' })
})

test('System Settings switches category panes', async ({ page }) => {
  await page.getByRole('button', { name: 'System Settings' }).click()
  const settingsDialog = page.getByRole('dialog', { name: 'System Settings' })
  await expect(settingsDialog).toBeVisible()

  await settingsDialog.getByTestId('settings-category-wifi').click()
  await expect(settingsDialog.getByTestId('settings-pane-wifi')).toBeVisible()
  await expect(settingsDialog).toContainText('Tahoe-5G')

  await settingsDialog.getByTestId('settings-category-battery').click()
  await expect(settingsDialog.getByTestId('settings-pane-battery')).toBeVisible()
  await expect(settingsDialog).toContainText('Low Power Mode')
})

test('System Settings theme toggle switches dark mode', async ({ page }) => {
  await page.getByRole('button', { name: 'System Settings' }).click()
  const settingsDialog = page.getByRole('dialog', { name: 'System Settings' })
  await expect(settingsDialog).toBeVisible()

  await settingsDialog.getByTestId('settings-category-appearance').click()
  const toggle = settingsDialog.getByTestId('theme-toggle')
  await expect(toggle).toHaveText('Switch to Dark')

  await toggle.click()
  await expect(toggle).toHaveText('Switch to Light')
  await expect(page.locator('html')).toHaveClass(/dark/)

  await toggle.click()
  await expect(toggle).toHaveText('Switch to Dark')
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})
