import { test, expect } from '@playwright/test'

/**
 * Reminders e2e — lists + tasks, add/complete/delete, persisted.
 */

async function openReminders(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('dock-icon-reminders').click()
  await expect(page.getByTestId('reminders-content')).toBeVisible()
}

test.describe('Reminders', () => {
  test('opens from Dock with the seed list and tasks', async ({ page }) => {
    await openReminders(page)
    await expect(page.getByTestId('reminders-list-title')).toHaveText('Reminders')
    await expect(page.getByTestId('reminders-task-title').filter({ hasText: 'Explore macOS Tahoe' })).toBeVisible()
    await expect(page.getByTestId('reminders-task-title').filter({ hasText: 'Try the new Dock' })).toBeVisible()
  })

  test('add a task to the current list', async ({ page }) => {
    await openReminders(page)
    const before = await page.getByTestId('reminders-task').count()
    await page.getByTestId('reminders-new-task').fill('Buy groceries')
    await page.getByTestId('reminders-new-task').press('Enter')
    const after = await page.getByTestId('reminders-task').count()
    expect(after).toBe(before + 1)
    await expect(page.getByTestId('reminders-task-title').filter({ hasText: 'Buy groceries' })).toBeVisible()
  })

  test('complete a task strikes it through', async ({ page }) => {
    await openReminders(page)
    // 'Explore macOS Tahoe' is initially incomplete.
    const row = page.locator('[data-testid="reminders-task"]').filter({ hasText: 'Explore macOS Tahoe' })
    await expect(row.getByTestId('reminders-task-check')).not.toHaveClass(/bg-\[var\(--accent\)\]/)
    await row.getByTestId('reminders-task-check').click()
    // Now the check is accent-filled and the title is struck through.
    await expect(row.getByTestId('reminders-task-check')).toHaveClass(/bg-\[var\(--accent\)\]/)
    await expect(row.getByTestId('reminders-task-title')).toHaveClass(/line-through/)
  })

  test('delete a task removes it', async ({ page }) => {
    await openReminders(page)
    await page.getByTestId('reminders-new-task').fill('Temp task')
    await page.getByTestId('reminders-new-task').press('Enter')
    await expect(page.getByTestId('reminders-task-title').filter({ hasText: 'Temp task' })).toBeVisible()
    const row = page.locator('[data-testid="reminders-task"]').filter({ hasText: 'Temp task' })
    await row.hover()
    await row.getByTestId('reminders-task-delete').click()
    await expect(page.getByTestId('reminders-task-title').filter({ hasText: 'Temp task' })).toHaveCount(0)
  })

  test('add a new list and switch to it', async ({ page }) => {
    await openReminders(page)
    await page.getByTestId('reminders-new-list-input').fill('Work')
    await page.getByTestId('reminders-add-list').click()
    await expect(page.getByTestId('reminders-list-name').filter({ hasText: 'Work' })).toBeVisible()
    // The new list should be selected.
    await expect(page.getByTestId('reminders-list-title')).toHaveText('Work')
    // It should be empty.
    await expect(page.getByTestId('reminders-tasks')).toContainText('No tasks.')
  })

  test('tasks persist across a full reload', async ({ page }) => {
    await openReminders(page)
    await page.getByTestId('reminders-new-task').fill('Persisted task')
    await page.getByTestId('reminders-new-task').press('Enter')
    await page.reload()
    await openReminders(page)
    await expect(page.getByTestId('reminders-task-title').filter({ hasText: 'Persisted task' })).toBeVisible()
  })

  test('lists persist across a full reload', async ({ page }) => {
    await openReminders(page)
    await page.getByTestId('reminders-new-list-input').fill('Shopping')
    await page.getByTestId('reminders-add-list').click()
    await page.reload()
    await openReminders(page)
    await expect(page.getByTestId('reminders-list-name').filter({ hasText: 'Shopping' })).toBeVisible()
  })

  test('delete a list removes it', async ({ page }) => {
    await openReminders(page)
    await page.getByTestId('reminders-new-list-input').fill('To Delete')
    await page.getByTestId('reminders-add-list').click()
    await expect(page.getByTestId('reminders-list-name').filter({ hasText: 'To Delete' })).toBeVisible()
    const row = page.locator('[data-testid="reminders-list"]').filter({ hasText: 'To Delete' })
    await row.hover()
    await row.getByTestId('reminders-delete-list').click()
    await expect(page.getByTestId('reminders-list-name').filter({ hasText: 'To Delete' })).toHaveCount(0)
  })
})
