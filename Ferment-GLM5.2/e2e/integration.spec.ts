import { test, expect } from '@playwright/test'

/**
 * Integration e2e — cross-app coverage for all 12 registered apps.
 *
 * Verifies that every app launches from the Dock, renders its content, and
 * that the menu bar reflects the focused app's name. Also exercises
 * Spotlight launching.
 */

const ALL_APPS = [
  { appId: 'finder', title: 'Finder' },
  { appId: 'calculator', title: 'Calculator' },
  { appId: 'notes', title: 'Notes' },
  { appId: 'terminal', title: 'Terminal' },
  { appId: 'mail', title: 'Mail' },
  { appId: 'messages', title: 'Messages' },
  { appId: 'calendar', title: 'Calendar' },
  { appId: 'weather', title: 'Weather' },
  { appId: 'photos', title: 'Photos' },
  { appId: 'safari', title: 'Safari' },
  { appId: 'reminders', title: 'Reminders' },
  { appId: 'settings', title: 'System Settings' },
]

const CONTENT_TESTIDS: Record<string, string> = {
  finder: 'finder-content',
  calculator: 'calculator-content',
  notes: 'notes-content',
  terminal: 'terminal-content',
  mail: 'mail-content',
  messages: 'messages-content',
  calendar: 'calendar-content',
  weather: 'weather-content',
  photos: 'photos-content',
  safari: 'safari-content',
  reminders: 'reminders-content',
  settings: 'settings-content',
}

test.describe('Cross-app integration', () => {
  test('every app has a Dock launcher', async ({ page }) => {
    await page.goto('/')
    for (const app of ALL_APPS) {
      await expect(
        page.getByTestId(`dock-icon-${app.appId}`),
        `Dock icon for ${app.title}`,
      ).toBeVisible()
    }
  })

  for (const app of ALL_APPS) {
    test(`${app.title} launches from Dock and renders content`, async ({ page }) => {
      await page.goto('/')
      await page.getByTestId(`dock-icon-${app.appId}`).click()
      await expect(page.getByTestId(CONTENT_TESTIDS[app.appId])).toBeVisible()
    })
  }

  test('focusing an app updates the menu bar app-name', async ({ page }) => {
    await page.goto('/')
    // Default is Finder.
    await expect(page.getByTestId('menu-app-name')).toHaveText('Finder')
    // Open Terminal → menu bar should reflect Terminal.
    await page.getByTestId('dock-icon-terminal').click()
    await expect(page.getByTestId('menu-app-name')).toHaveText('Terminal')
    // Open Safari → menu bar should reflect Safari.
    await page.getByTestId('dock-icon-safari').click()
    await expect(page.getByTestId('menu-app-name')).toHaveText('Safari')
    // Open Mail → menu bar should reflect Mail.
    await page.getByTestId('dock-icon-mail').click()
    await expect(page.getByTestId('menu-app-name')).toHaveText('Mail')
  })

  test('the app-name menu reflects the focused app', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-reminders').click()
    await expect(page.getByTestId('menu-app-name')).toHaveText('Reminders')
    await page.getByTestId('menu-app-name').click()
    await expect(page.getByTestId('menu-item-about-app')).toContainText('About Reminders')
    await expect(page.getByTestId('menu-item-quit-app')).toContainText('Quit Reminders')
  })

  test('Spotlight lists all 12 apps', async ({ page }) => {
    await page.goto('/')
    // Wait for the shell to mount so the keydown listener is armed.
    await expect(page.getByTestId('menu-bar')).toBeVisible()
    await page.keyboard.press('Meta+Space')
    await expect(page.getByTestId('spotlight')).toBeVisible()
    for (const app of ALL_APPS) {
      await expect(
        page.getByTestId(`spotlight-result-${app.appId}`),
        `Spotlight result for ${app.title}`,
      ).toBeVisible()
    }
  })

  test('Spotlight launches an app into a window', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('menu-bar')).toBeVisible()
    await page.keyboard.press('Meta+Space')
    await expect(page.getByTestId('spotlight')).toBeVisible()
    await page.getByTestId('spotlight-input').fill('weather')
    await page.getByTestId('spotlight-input').press('Enter')
    await expect(page.getByTestId('weather-content')).toBeVisible()
  })

  test('multiple windows can be open simultaneously', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await page.getByTestId('dock-icon-notes').click()
    await page.getByTestId('dock-icon-terminal').click()
    // All three contents visible.
    await expect(page.getByTestId('calculator-content')).toBeVisible()
    await expect(page.getByTestId('notes-content')).toBeVisible()
    await expect(page.getByTestId('terminal-content')).toBeVisible()
  })

  test('closing a window removes its content', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await expect(page.getByTestId('calculator-content')).toBeVisible()
    await page.getByTestId('traffic-close').click()
    await expect(page.getByTestId('calculator-content')).toHaveCount(0)
  })
})
