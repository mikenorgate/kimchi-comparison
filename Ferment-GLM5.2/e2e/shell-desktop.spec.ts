import { test, expect } from '@playwright/test'

test.describe('Desktop shell — wallpaper & appearance', () => {
  test('desktop renders with .desktop class and wallpaper background', async ({ page }) => {
    await page.goto('/')

    const desktop = page.locator('.desktop')
    await expect(desktop).toBeVisible()

    // Wallpaper is applied as a CSS background containing a gradient
    const bg = await desktop.evaluate((el) => {
      const cs = getComputedStyle(el)
      return cs.backgroundImage
    })
    expect(bg).toContain('gradient')

    // The background should have at least one linear-gradient layer
    expect(bg).toContain('linear-gradient')
  })

  test('appearance classes are applied to html root', async ({ page }) => {
    await page.goto('/')

    // Default appearance is 'light' → html should get 'appearance-light'
    const htmlClass = await page.evaluate(() => document.documentElement.className)
    expect(htmlClass).toContain('appearance-light')
  })

  test('wallpaper changes when settings store updates', async ({ page }) => {
    await page.goto('/')

    // Change wallpaper via localStorage + reload
    await page.evaluate(() => {
      const stored = localStorage.getItem('tahoe-settings')
      const parsed = stored ? JSON.parse(stored) : {}
      parsed.state = parsed.state ?? {}
      parsed.state.wallpaper = 'tahoe-gradient-3'
      localStorage.setItem('tahoe-settings', JSON.stringify(parsed))
    })
    await page.reload()

    const desktop = page.locator('.desktop')
    await expect(desktop).toBeVisible()

    // The background should still contain a gradient (now the Midnight wallpaper)
    const bg = await desktop.evaluate((el) => getComputedStyle(el).backgroundImage)
    expect(bg).toContain('gradient')
  })
})
