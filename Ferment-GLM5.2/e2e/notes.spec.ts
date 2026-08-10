import { test, expect } from '@playwright/test'

test.describe('Notes', () => {
  test('renders with sidebar, note list, and editor', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-notes').click()
    await expect(page.getByTestId('notes-root')).toBeVisible()
    await expect(page.getByTestId('notes-sidebar')).toBeVisible()
    await expect(page.getByTestId('notes-list')).toBeVisible()
    await expect(page.getByTestId('notes-textarea')).toBeVisible()
  })

  test('create a new note', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-notes').click()
    await expect(page.getByTestId('notes-root')).toBeVisible()

    const initialCount = await page.locator('[data-testid^="notes-item-"]').count()

    await page.getByTestId('notes-new').click()
    await page.waitForTimeout(300)

    const newCount = await page.locator('[data-testid^="notes-item-"]').count()
    expect(newCount).toBe(initialCount + 1)

    // Textarea should be focused and empty
    await expect(page.getByTestId('notes-textarea')).toBeVisible()
    await expect(page.getByTestId('notes-textarea')).toHaveValue('')
  })

  test('edit a note and title auto-updates', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-notes').click()

    // Create a new note
    await page.getByTestId('notes-new').click()
    await page.waitForTimeout(200)

    // Type in the textarea
    const textarea = page.getByTestId('notes-textarea')
    await textarea.fill('My Important Note\n\nThis is the body text.')
    await page.waitForTimeout(300)

    // The first note in the list should show "My Important Note" as title
    const firstNote = page.locator('[data-testid^="notes-item-"]').first()
    await expect(firstNote).toContainText('My Important Note')
  })

  test('delete a note', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-notes').click()

    const initialCount = await page.locator('[data-testid^="notes-item-"]').count()
    expect(initialCount).toBeGreaterThan(0)

    // Select the first note and delete it
    await page.locator('[data-testid^="notes-item-"]').first().click()
    await page.waitForTimeout(200)

    await page.getByTestId('notes-delete').click()
    await page.waitForTimeout(300)

    const newCount = await page.locator('[data-testid^="notes-item-"]').count()
    expect(newCount).toBe(initialCount - 1)
  })

  test('search filters notes by title and body', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-notes').click()

    const initialCount = await page.locator('[data-testid^="notes-item-"]').count()

    // Search for "Grocery" (seeded note)
    await page.getByTestId('notes-search').fill('Grocery')
    await page.waitForTimeout(300)

    const filteredCount = await page.locator('[data-testid^="notes-item-"]').count()
    expect(filteredCount).toBeLessThan(initialCount)
    expect(filteredCount).toBeGreaterThanOrEqual(1)

    // Clear search — all notes should be back
    await page.getByTestId('notes-search').fill('')
    await page.waitForTimeout(300)

    const restoredCount = await page.locator('[data-testid^="notes-item-"]').count()
    expect(restoredCount).toBe(initialCount)
  })

  test('notes persist across page reload', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-notes').click()

    // Create a note with identifiable content
    await page.getByTestId('notes-new').click()
    await page.waitForTimeout(200)
    await page.getByTestId('notes-textarea').fill('Persistence Test Note\n\nThis should survive a reload.')
    await page.waitForTimeout(500)

    // Reload the page
    await page.reload()
    await page.getByTestId('dock-icon-notes').click()
    await page.waitForTimeout(300)

    // The note should still exist
    const noteItems = page.locator('[data-testid^="notes-item-"]')
    const count = await noteItems.count()
    expect(count).toBeGreaterThan(0)

    // Find the note with "Persistence Test Note" in the list
    const found = await noteItems.filter({ hasText: 'Persistence Test Note' }).count()
    expect(found).toBe(1)

    // Click it and verify content in editor
    await noteItems.filter({ hasText: 'Persistence Test Note' }).first().click()
    await page.waitForTimeout(300)
    await expect(page.getByTestId('notes-textarea')).toHaveValue(/Persistence Test Note/)
  })
})
