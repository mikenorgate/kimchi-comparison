import { test, expect } from '@playwright/test'

/**
 * System Settings e2e — the real Settings UI drives the theme + system
 * stores; every change applies live to the shell and persists across reload.
 *
 * The appearance.spec.ts already covers the theme store via its dev hook;
 * this spec exercises the user-facing Settings controls end-to-end.
 */

async function openSettings(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('dock-icon-settings').click()
  await expect(page.getByTestId('settings-content')).toBeVisible()
}

const html = (page: import('@playwright/test').Page) => page.locator('html')

/** Set a range input via the native prototype setter so React detects the change. */
async function setRange(page: import('@playwright/test').Page, testid: string, value: number) {
  await page.getByTestId(testid).evaluate((el, v) => {
    const input = el as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter?.call(input, String(v))
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

test.describe('System Settings', () => {
  test('opens from Dock on the Appearance pane', async ({ page }) => {
    await openSettings(page)
    await expect(page.getByTestId('settings-appearance-pane')).toBeVisible()
  })

  test('switching panes shows the right content', async ({ page }) => {
    await openSettings(page)
    await page.getByTestId('settings-pane-wallpaper').click()
    await expect(page.getByTestId('settings-wallpaper-pane')).toBeVisible()
    await page.getByTestId('settings-pane-about').click()
    await expect(page.getByTestId('settings-about-pane')).toBeVisible()
    await expect(page.getByTestId('settings-version')).toHaveText('Tahoe 26.0')
  })

  test('Dark appearance applies live via the Settings UI', async ({ page }) => {
    await openSettings(page)
    await page.getByTestId('settings-appearance-dark').click()
    await expect(html(page)).toHaveAttribute('data-appearance', 'dark')
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
  })

  test('Light appearance applies live via the Settings UI', async ({ page }) => {
    await openSettings(page)
    await page.getByTestId('settings-appearance-light').click()
    await expect(html(page)).toHaveAttribute('data-appearance', 'light')
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
  })

  test('Auto appearance resolves to the OS preference', async ({ page }) => {
    await openSettings(page)
    await page.getByTestId('settings-appearance-auto').click()
    await expect(html(page)).toHaveAttribute('data-appearance', 'auto')
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
  })

  test('accent color swatch applies live', async ({ page }) => {
    await openSettings(page)
    await page.getByTestId('settings-accent-purple').click()
    await expect(html(page)).toHaveAttribute('data-accent', 'purple')
    await expect(html(page)).toHaveAttribute('data-accent', 'purple')
    expect(
      await page.evaluate(() =>
        document.documentElement.style.getPropertyValue('--accent'),
      ),
    ).toBe('#bf5af2')
  })

  test('icon style toggle applies live', async ({ page }) => {
    await openSettings(page)
    await page.getByTestId('settings-icon-clear').click()
    await expect(html(page)).toHaveAttribute('data-icon-style', 'clear')
    await page.getByTestId('settings-icon-tinted').click()
    await expect(html(page)).toHaveAttribute('data-icon-style', 'tinted')
  })

  test('wallpaper thumbnail applies live', async ({ page }) => {
    await openSettings(page)
    await page.getByTestId('settings-pane-wallpaper').click()
    await page.getByTestId('settings-wallpaper-sequoia').click()
    await expect(page.getByTestId('wallpaper')).toHaveAttribute('data-wallpaper', 'sequoia')
  })

  test('brightness slider mutates the system store', async ({ page }) => {
    await openSettings(page)
    await page.getByTestId('settings-pane-displays').click()
    await setRange(page, 'settings-brightness', 42)
    await expect(page.getByTestId('settings-brightness-value')).toHaveText('42%')
  })

  test('all Settings changes persist across a full reload', async ({ page }) => {
    await openSettings(page)
    await page.getByTestId('settings-appearance-dark').click()
    await page.getByTestId('settings-accent-green').click()
    await page.getByTestId('settings-icon-clear').click()
    await page.getByTestId('settings-pane-wallpaper').click()
    await page.getByTestId('settings-wallpaper-sonoma').click()
    // Verify live application...
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await expect(html(page)).toHaveAttribute('data-accent', 'green')
    await expect(page.getByTestId('wallpaper')).toHaveAttribute('data-wallpaper', 'sonoma')
    // ...then reload and confirm rehydration from localStorage.
    await page.reload()
    await expect(html(page)).toHaveAttribute('data-appearance', 'dark')
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await expect(html(page)).toHaveAttribute('data-accent', 'green')
    await expect(html(page)).toHaveAttribute('data-icon-style', 'clear')
    await expect(page.getByTestId('wallpaper')).toHaveAttribute('data-wallpaper', 'sonoma')
  })
})
