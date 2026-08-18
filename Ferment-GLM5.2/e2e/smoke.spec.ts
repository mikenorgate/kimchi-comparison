import { test, expect } from '@playwright/test'

test('desktop root mounts on page load', async ({ page }) => {
  await page.goto('/')
  const desktop = page.getByTestId('desktop-root')
  await expect(desktop).toBeVisible()
})

test('desktop content container is present', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('desktop-content')).toBeVisible()
})
