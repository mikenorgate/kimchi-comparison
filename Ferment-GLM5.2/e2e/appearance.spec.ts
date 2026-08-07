import { test, expect, type Page } from '@playwright/test'

/**
 * Appearance & theming e2e — step 6 acceptance: Light/Dark/Auto, accent color,
 * and icon style apply live to the shell and persist across a full reload.
 *
 * The System Settings UI for these controls ships in a later phase, so this
 * spec drives the theme store directly via its dev-only window hook
 * (`window.__tahoeTheme`) — exercising the real store → React subscription →
 * document-root effect → localStorage path. The Settings app will later
 * provide the user-facing controls (settings.spec.ts).
 *
 * Assertions use a locator on <html> with auto-retrying `toHaveAttribute`,
 * because some changes (notably `emulateMedia` for Auto) propagate
 * asynchronously through the matchMedia change listener → React state → effect.
 */

interface ThemeStoreApi {
  setState: (partial: Record<string, unknown>) => void
}

async function setTheme(page: Page, patch: Record<string, unknown>) {
  await page.evaluate((p) => {
    const w = window as unknown as { __tahoeTheme?: ThemeStoreApi }
    w.__tahoeTheme?.setState(p)
  }, patch)
}

const html = (page: Page) => page.locator('html')

async function accentVar(page: Page): Promise<string> {
  return page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--accent'),
  )
}

test.describe('Appearance & theming', () => {
  test('default appearance is Auto resolving to light', async ({ page }) => {
    await page.goto('/')
    // Chromium defaults to prefers-color-scheme: light.
    await expect(html(page)).toHaveAttribute('data-appearance', 'auto')
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
  })

  test('Dark appearance applies live', async ({ page }) => {
    await page.goto('/')
    await setTheme(page, { appearance: 'dark' })
    await expect(html(page)).toHaveAttribute('data-appearance', 'dark')
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    // The Dock switches to its dark glass variant.
    await expect(page.getByTestId('dock')).toHaveAttribute('data-variant', 'dark')
  })

  test('Light appearance applies live', async ({ page }) => {
    await page.goto('/')
    await setTheme(page, { appearance: 'light' })
    await expect(html(page)).toHaveAttribute('data-appearance', 'light')
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
    await expect(page.getByTestId('dock')).toHaveAttribute('data-variant', 'light')
  })

  test('Auto resolves to the system preference', async ({ page }) => {
    await page.goto('/')
    await setTheme(page, { appearance: 'auto' })
    await expect(html(page)).toHaveAttribute('data-appearance', 'auto')
    // Emulate dark OS preference → Auto resolves to dark (async via matchMedia).
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
  })

  test('accent color applies live to data-accent and the --accent var', async ({ page }) => {
    await page.goto('/')
    await setTheme(page, { accent: 'purple' })
    await expect(html(page)).toHaveAttribute('data-accent', 'purple')
    expect(await accentVar(page)).toBe('#bf5af2')

    await setTheme(page, { accent: 'green' })
    await expect(html(page)).toHaveAttribute('data-accent', 'green')
    expect(await accentVar(page)).toBe('#30d158')
  })

  test('icon style (tinted/clear) applies live', async ({ page }) => {
    await page.goto('/')
    await setTheme(page, { iconStyle: 'clear' })
    await expect(html(page)).toHaveAttribute('data-icon-style', 'clear')
    await setTheme(page, { iconStyle: 'tinted' })
    await expect(html(page)).toHaveAttribute('data-icon-style', 'tinted')
  })

  test('wallpaper selection applies live', async ({ page }) => {
    await page.goto('/')
    await setTheme(page, { wallpaper: 'sequoia' })
    await expect(page.getByTestId('wallpaper')).toHaveAttribute('data-wallpaper', 'sequoia')
    await setTheme(page, { wallpaper: 'sonoma' })
    await expect(page.getByTestId('wallpaper')).toHaveAttribute('data-wallpaper', 'sonoma')
  })

  test('all appearance settings persist across a full reload', async ({ page }) => {
    await page.goto('/')
    await setTheme(page, {
      appearance: 'dark',
      accent: 'pink',
      iconStyle: 'clear',
      wallpaper: 'graphite',
    })
    // Confirm live application first...
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await expect(html(page)).toHaveAttribute('data-accent', 'pink')

    // ...then reload and verify the store rehydrated from localStorage.
    await page.reload()
    await expect(html(page)).toHaveAttribute('data-appearance', 'dark')
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await expect(html(page)).toHaveAttribute('data-accent', 'pink')
    expect(await accentVar(page)).toBe('#ff375f')
    await expect(html(page)).toHaveAttribute('data-icon-style', 'clear')
    await expect(page.getByTestId('wallpaper')).toHaveAttribute('data-wallpaper', 'graphite')
  })
})
