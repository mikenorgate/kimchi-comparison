import { test, expect } from '@playwright/test'

/**
 * Persistence e2e — all app state survives a full page.reload() via localStorage.
 *
 * For each app that persists state, this spec mutates the state in-app, reloads
 * the page, reopens the app, and asserts the mutation is still present.
 * Verifies the localStorage contract: the hook key→value survives reload.
 */

async function openApp(page: import('@playwright/test').Page, appId: string) {
  await page.getByTestId(`dock-icon-${appId}`).click()
}

test.describe('Persistence across page.reload()', () => {
  test('Notes survive reload', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'notes')
    await page.getByTestId('notes-new').click()
    await page.getByTestId('notes-editor').fill('Persisted note body')
    await page.reload()
    await openApp(page, 'notes')
    await expect(page.getByTestId('notes-list')).toContainText('Persisted note body')
  })

  test('Calendar events survive reload', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'calendar')
    // Select today's cell (keyed by ISO date YYYY-MM-DD).
    const today = new Date().toISOString().slice(0, 10)
    await page.locator(`[data-testid="calendar-day"][data-date="${today}"]`).click()
    await page.getByTestId('calendar-event-title-input').fill('Persisted event')
    await page.getByTestId('calendar-event-title-input').press('Enter')
    await expect(page.getByTestId('calendar-event').filter({ hasText: 'Persisted event' })).toBeVisible()
    await page.reload()
    await openApp(page, 'calendar')
    await page.locator(`[data-testid="calendar-day"][data-date="${today}"]`).click()
    await expect(page.getByTestId('calendar-event').filter({ hasText: 'Persisted event' })).toBeVisible()
  })

  test('Reminders tasks survive reload', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'reminders')
    await page.getByTestId('reminders-new-task').fill('Persisted task')
    await page.getByTestId('reminders-new-task').press('Enter')
    await page.reload()
    await openApp(page, 'reminders')
    await expect(page.getByTestId('reminders-task-title').filter({ hasText: 'Persisted task' })).toBeVisible()
  })

  test('Reminders lists survive reload', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'reminders')
    await page.getByTestId('reminders-new-list-input').fill('Persisted List')
    await page.getByTestId('reminders-add-list').click()
    await page.reload()
    await openApp(page, 'reminders')
    await expect(page.getByTestId('reminders-list-name').filter({ hasText: 'Persisted List' })).toBeVisible()
  })

  test('Mail sent mail survives reload', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'mail')
    await page.getByTestId('mail-compose').click()
    await page.getByTestId('mail-compose-to').fill('persisted@example.com')
    await page.getByTestId('mail-compose-subject').fill('Persisted mail')
    await page.getByTestId('mail-compose-body').fill('Body')
    await page.getByTestId('mail-compose-send').click()
    // Now in Sent with the message selected.
    await expect(page.getByTestId('mail-view-subject')).toContainText('Persisted mail')
    await page.reload()
    await openApp(page, 'mail')
    await page.getByTestId('mail-mailbox-sent').click()
    await expect(page.getByTestId('mail-item').filter({ hasText: 'Persisted mail' })).toBeVisible()
  })

  test('Messages threads survive reload', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'messages')
    await page.getByTestId('messages-input').fill('Persisted message text')
    await page.getByTestId('messages-input').press('Enter')
    await expect(page.getByTestId('messages-bubble').filter({ hasText: 'Persisted message text' })).toBeVisible()
    await page.reload()
    await openApp(page, 'messages')
    await expect(page.getByTestId('messages-bubble').filter({ hasText: 'Persisted message text' })).toBeVisible()
  })

  test('Safari bookmarks survive reload', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'safari')
    await page.getByTestId('safari-address').fill('https://persisted.example')
    await page.getByTestId('safari-address').press('Enter')
    await page.getByTestId('safari-bookmark-add').click()
    await expect(page.getByTestId('safari-bookmark').filter({ hasText: 'persisted.example' })).toBeVisible()
    await page.reload()
    await openApp(page, 'safari')
    await expect(page.getByTestId('safari-bookmark').filter({ hasText: 'persisted.example' })).toBeVisible()
  })

  test('Photos favorites survive reload', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'photos')
    await page.getByTestId('photos-thumb').first().click()
    await page.getByTestId('photos-favorite-toggle').click()
    await page.getByTestId('photos-back').click()
    await expect(page.getByTestId('photos-thumb').first().getByTestId('photos-thumb-fav')).toBeVisible()
    await page.reload()
    await openApp(page, 'photos')
    await expect(page.getByTestId('photos-thumb').first().getByTestId('photos-thumb-fav')).toBeVisible()
  })

  test('Weather favorites survive reload', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'weather')
    await page.getByTestId('weather-city').filter({ hasText: 'Tokyo' }).click()
    await page.getByTestId('weather-favorite-toggle').click()
    await page.reload()
    await openApp(page, 'weather')
    // Tokyo should appear at index 1 (pinned after seed favorite Cupertino).
    await expect(page.getByTestId('weather-city-name').nth(1)).toHaveText('Tokyo')
  })

  test('VFS changes survive reload (Terminal mkdir + touch)', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'terminal')
    await page.getByTestId('terminal-input').fill('mkdir PersistedDir')
    await page.getByTestId('terminal-input').press('Enter')
    await page.getByTestId('terminal-input').fill('cd PersistedDir')
    await page.getByTestId('terminal-input').press('Enter')
    await page.getByTestId('terminal-input').fill('touch persisted_file.txt')
    await page.getByTestId('terminal-input').press('Enter')
    await page.reload()
    await openApp(page, 'terminal')
    await page.getByTestId('terminal-input').fill('ls PersistedDir')
    await page.getByTestId('terminal-input').press('Enter')
    // The terminal output should contain the new file.
    await expect(page.getByTestId('terminal-output')).toContainText('persisted_file.txt')
  })

  test('System Settings (appearance) survive reload', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'settings')
    // Switch to Dark appearance.
    await page.getByTestId('settings-pane-appearance').click()
    await page.getByTestId('settings-appearance-dark').click()
    await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark')
    await page.reload()
    // The html element should still reflect dark after reload (theme store persists).
    await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark')
  })

  test('Accent color survives reload', async ({ page }) => {
    await page.goto('/')
    await openApp(page, 'settings')
    await page.getByTestId('settings-pane-appearance').click()
    // Click the purple accent swatch.
    await page.getByTestId('settings-accent-purple').click()
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'purple')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-accent', 'purple')
  })
})
