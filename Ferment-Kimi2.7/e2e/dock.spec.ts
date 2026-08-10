import { test, expect } from '@playwright/test'

test('Dock renders all app icons and clicking Finder opens a window', async ({ page }) => {
  await page.goto('/')
  const dock = page.getByTestId('dock')
  await expect(dock).toBeVisible()
  const icons = dock.getByTestId('dock-icon')
  await expect(icons).toHaveCount(8)

  const finder = dock.getByLabel('Finder')
  await finder.click()
  const finderWindow = page.getByRole('dialog', { name: 'Finder' })
  await expect(finderWindow).toBeVisible()

  await page.screenshot({ path: 'e2e-report/dock-finder-open.png' })
})

test('Clicking a running Finder icon restores focus when another window is focused', async ({ page }) => {
  await page.goto('/')
  const dock = page.getByTestId('dock')

  await dock.getByLabel('Finder').click()
  await dock.getByLabel('Safari').click()
  await expect(page.getByRole('dialog', { name: 'Safari' })).toBeVisible()

  // Focus Finder by clicking its Dock icon
  await dock.getByLabel('Finder').click()
  const finderWindow = page.getByRole('dialog', { name: 'Finder' })
  await expect(finderWindow).toHaveCSS('z-index', /^10[0-9]$/)
})
