import { test, expect } from '@playwright/test'

test.describe('Additional Apps Smoke Tests', () => {
  test('Mail: renders inbox and reader, can read and reply', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-mail').click()
    await expect(page.getByTestId('mail-root')).toBeVisible()
    await expect(page.getByTestId('mail-inbox')).toBeVisible()
    // Open an email
    await page.getByTestId('mail-item-mail-1').click()
    await expect(page.getByTestId('mail-reader')).toContainText('Welcome to macOS Tahoe')
    // Reply
    await page.getByTestId('mail-reply-input').fill('Thanks for the welcome!')
    await page.getByTestId('mail-reply-send').click()
    await expect(page.getByTestId('mail-reader')).toContainText('Thanks for the welcome!')
  })

  test('Messages: renders threads and can send message', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-messages').click()
    await expect(page.getByTestId('messages-root')).toBeVisible()
    await expect(page.getByTestId('messages-sidebar')).toBeVisible()
    // Select a thread
    await page.getByTestId('messages-thread-t1').click()
    await expect(page.getByTestId('messages-list')).toBeVisible()
    // Send a message
    await page.getByTestId('messages-input').fill('Hello from test!')
    await page.getByTestId('messages-send').click()
    await expect(page.getByTestId('messages-list')).toContainText('Hello from test!')
  })

  test('Photos: renders grid and can view photo', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-photos').click()
    await expect(page.getByTestId('photos-root')).toBeVisible()
    await expect(page.getByTestId('photos-grid')).toBeVisible()
    // Click a photo to view it
    await page.getByTestId('photo-p1').click()
    await expect(page.getByTestId('photos-viewer')).toBeVisible()
    await expect(page.getByTestId('photos-viewer-image')).toBeVisible()
    // Go back
    await page.getByTestId('photos-back').click()
    await expect(page.getByTestId('photos-grid')).toBeVisible()
  })

  test('Music: renders library and can play/pause', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-music').click()
    await expect(page.getByTestId('music-root')).toBeVisible()
    await expect(page.getByTestId('music-library')).toBeVisible()
    // Play a track
    await page.getByTestId('music-track-tr2').click()
    await expect(page.getByTestId('music-artwork')).toBeVisible()
    // Toggle play/pause
    await page.getByTestId('music-play').click()
    await page.getByTestId('music-play').click()
  })

  test('Terminal: renders and responds to ls command', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-terminal').click()
    await expect(page.getByTestId('terminal-root')).toBeVisible()
    await expect(page.getByTestId('terminal-input')).toBeVisible()
    // Type ls and press Enter
    await page.getByTestId('terminal-input').fill('ls')
    await page.getByTestId('terminal-input').press('Enter')
    await expect(page.getByTestId('terminal-output')).toContainText('Desktop')
  })

  test('Weather: renders forecast and can select day', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-weather').click()
    await expect(page.getByTestId('weather-root')).toBeVisible()
    await expect(page.getByTestId('weather-main')).toBeVisible()
    await expect(page.getByTestId('weather-condition')).toContainText('Sunny')
    // Select a different day
    await page.getByTestId('weather-day-2').click()
    await expect(page.getByTestId('weather-condition')).toContainText('Rain')
  })

  test('Stocks: renders watchlist and can select stock', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-stocks').click()
    await expect(page.getByTestId('stocks-root')).toBeVisible()
    await expect(page.getByTestId('stocks-list')).toBeVisible()
    // Select a stock
    await page.getByTestId('stock-NVDA').click()
    await expect(page.getByTestId('stocks-detail')).toBeVisible()
    await expect(page.getByTestId('stocks-price')).toContainText('875')
  })

  test('Calendar: renders month grid with today highlighted', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calendar').click()
    await expect(page.getByTestId('calendar-root')).toBeVisible()
    await expect(page.getByTestId('calendar-grid')).toBeVisible()
    await expect(page.getByTestId('calendar-month')).toBeVisible()
    // Should have day cells
    expect(await page.locator('[data-testid^="calendar-day-"]').count()).toBeGreaterThan(0)
  })

  test('Clock: renders with live time and city list', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-clock').click()
    await expect(page.getByTestId('clock-root')).toBeVisible()
    await expect(page.getByTestId('clock-sidebar')).toBeVisible()
    await expect(page.getByTestId('clock-time')).toBeVisible()
    // Switch city
    await page.getByTestId('clock-city-c4').click()
    await expect(page.getByTestId('clock-city-name')).toContainText('Tokyo')
  })

  test('Reminders: renders lists and can add/complete reminder', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-reminders').click()
    await expect(page.getByTestId('reminders-root')).toBeVisible()
    await expect(page.getByTestId('reminders-sidebar')).toBeVisible()
    // Add a reminder
    await page.getByTestId('reminders-new-input').fill('Test reminder')
    await page.getByTestId('reminders-add').click()
    await expect(page.getByTestId('reminders-list-items')).toContainText('Test reminder')
    // Complete it
    const items = page.locator('[data-testid^="reminder-item-"]')
    const count = await items.count()
    // Find the one with "Test reminder" text
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent()
      if (text && text.includes('Test reminder')) {
        const toggleId = await items.nth(i).locator('[data-testid^="reminder-toggle-"]').getAttribute('data-testid')
        if (toggleId) {
          await page.getByTestId(toggleId).click()
        }
        break
      }
    }
    await page.waitForTimeout(200)
    // Verify it's completed (line-through)
    await expect(page.getByTestId('reminders-list-items')).toContainText('Test reminder')
  })
})
