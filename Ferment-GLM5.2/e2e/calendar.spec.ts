import { test, expect } from '@playwright/test'

/**
 * Calendar e2e — month view, today highlighted, add/delete events, persisted.
 */

async function openCalendar(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('dock-icon-calendar').click()
  await expect(page.getByTestId('calendar-content')).toBeVisible()
}

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

test.describe('Calendar', () => {
  test('opens from Dock showing the current month', async ({ page }) => {
    await openCalendar(page)
    const now = new Date()
    const expectedLabel = now.toLocaleDateString(undefined, { month: 'long' }) + ' ' + now.getFullYear()
    await expect(page.getByTestId('calendar-month-label')).toHaveText(expectedLabel)
  })

  test("today's cell is highlighted", async ({ page }) => {
    await openCalendar(page)
    // The today cell's number span is accent-filled.
    const todayNum = page.locator(`[data-testid="calendar-day"][data-date="${todayISO()}"] [data-testid="calendar-day-num"]`)
    await expect(todayNum).toHaveClass(/bg-\[var\(--accent\)\]/)
  })

  test('prev/next month navigation', async ({ page }) => {
    await openCalendar(page)
    const now = new Date()
    // Next month.
    await page.getByTestId('calendar-next').click()
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    await expect(page.getByTestId('calendar-month-label')).toHaveText(
      next.toLocaleDateString(undefined, { month: 'long' }) + ' ' + next.getFullYear(),
    )
    // Back to current via Today.
    await page.getByTestId('calendar-today').click()
    await expect(page.getByTestId('calendar-month-label')).toHaveText(
      now.toLocaleDateString(undefined, { month: 'long' }) + ' ' + now.getFullYear(),
    )
    // Prev month.
    await page.getByTestId('calendar-prev').click()
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    await expect(page.getByTestId('calendar-month-label')).toHaveText(
      prev.toLocaleDateString(undefined, { month: 'long' }) + ' ' + prev.getFullYear(),
    )
  })

  test('add an event to the selected day', async ({ page }) => {
    await openCalendar(page)
    // Today is selected by default; add an event.
    await page.getByTestId('calendar-event-title-input').fill('Team standup')
    await page.getByTestId('calendar-event-time-input').fill('09:30')
    await page.getByTestId('calendar-add').click()
    // The event appears in the list.
    await expect(page.getByTestId('calendar-event-title').filter({ hasText: 'Team standup' })).toBeVisible()
    await expect(page.getByTestId('calendar-event-time').filter({ hasText: '09:30' })).toBeVisible()
    // And as a pill on the day cell.
    await expect(page.getByTestId('calendar-event-pill').filter({ hasText: 'Team standup' })).toBeVisible()
  })

  test('delete an event removes it from the list and the day', async ({ page }) => {
    await openCalendar(page)
    // Add then delete.
    await page.getByTestId('calendar-event-title-input').fill('Delete me')
    await page.getByTestId('calendar-add').click()
    await expect(page.getByTestId('calendar-event-title').filter({ hasText: 'Delete me' })).toBeVisible()
    // Hover the event row to reveal delete.
    const row = page.locator('[data-testid="calendar-event"]').filter({ hasText: 'Delete me' })
    await row.hover()
    await row.getByTestId('calendar-event-delete').click()
    await expect(page.getByTestId('calendar-event-title').filter({ hasText: 'Delete me' })).toHaveCount(0)
  })

  test('events persist across a full reload', async ({ page }) => {
    await openCalendar(page)
    await page.getByTestId('calendar-event-title-input').fill('Persisted meeting')
    await page.getByTestId('calendar-add').click()
    await expect(page.getByTestId('calendar-event-title').filter({ hasText: 'Persisted meeting' })).toBeVisible()
    await page.reload()
    await openCalendar(page)
    // Today's seed + our persisted event should both be present.
    await expect(page.getByTestId('calendar-event-title').filter({ hasText: 'Persisted meeting' })).toBeVisible()
  })

  test('clicking a different day selects it and shows its events', async ({ page }) => {
    await openCalendar(page)
    // Add an event to today.
    await page.getByTestId('calendar-event-title-input').fill('On today')
    await page.getByTestId('calendar-add').click()
    // Click a different day in the grid (pick the 15th of the current month).
    const now = new Date()
    const iso15 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`
    await page.locator(`[data-testid="calendar-day"][data-date="${iso15}"]`).click()
    // The selected day's event list should be empty (no events on the 15th).
    await expect(page.getByTestId('calendar-events')).toContainText('No events.')
  })
})
