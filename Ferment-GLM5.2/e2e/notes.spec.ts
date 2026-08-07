import { test, expect } from '@playwright/test'

/**
 * Notes e2e — note list, create/edit/delete, search, autosave to localStorage,
 * and cross-app file-open dispatch (Finder → Notes).
 */

async function openNotes(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('dock-icon-notes').click()
  await expect(page.getByTestId('notes-content')).toBeVisible()
}

test.describe('Notes', () => {
  test('opens from Dock with the seed note', async ({ page }) => {
    await openNotes(page)
    await expect(page.getByTestId('notes-list')).toBeVisible()
    // The seed note "Welcome to Notes" should be present.
    await expect(page.getByTestId('notes-item-title')).toContainText('Welcome to Notes')
  })

  test('create a new note and edit it', async ({ page }) => {
    await openNotes(page)
    await page.getByTestId('notes-new').click()
    // The new note's title defaults to "New Note".
    await expect(page.getByTestId('notes-item-title').filter({ hasText: 'New Note' })).toBeVisible()
    // Type into the editor.
    const editor = page.getByTestId('notes-editor')
    await editor.fill('My Shopping List\nMilk\nEggs')
    // The list item title should update to the first line.
    await expect(page.getByTestId('notes-item-title').filter({ hasText: 'My Shopping List' })).toBeVisible()
  })

  test('autosave persists the note across a full reload', async ({ page }) => {
    await openNotes(page)
    await page.getByTestId('notes-new').click()
    const editor = page.getByTestId('notes-editor')
    await editor.fill('Persisted Note\nThis should survive a reload.')
    await page.reload()
    await openNotes(page)
    await expect(page.getByTestId('notes-item-title').filter({ hasText: 'Persisted Note' })).toBeVisible()
  })

  test('delete removes a note from the list', async ({ page }) => {
    await openNotes(page)
    // Count notes before.
    const before = await page.getByTestId('notes-item').count()
    await page.getByTestId('notes-delete').click()
    const after = await page.getByTestId('notes-item').count()
    expect(after).toBe(before - 1)
  })

  test('search filters the note list by body content', async ({ page }) => {
    await openNotes(page)
    // Create two distinct notes.
    await page.getByTestId('notes-new').click()
    await page.getByTestId('notes-editor').fill('Recipe\nPancakes and syrup')
    await page.getByTestId('notes-new').click()
    await page.getByTestId('notes-editor').fill('Workout\nPush ups and squats')
    // Search for "Pancakes" — only the Recipe note should remain.
    await page.getByTestId('notes-search').fill('Pancakes')
    await expect(page.getByTestId('notes-item')).toHaveCount(1)
    await expect(page.getByTestId('notes-item-title')).toContainText('Recipe')
  })

  test('opening a text file from Finder imports its content as a note', async ({ page }) => {
    await page.goto('/')
    // Open Finder, navigate to Desktop, double-click Welcome.txt.
    await page.getByTestId('dock-icon-finder').click()
    await page.getByTestId('finder-fav-desktop').click()
    await page.getByTestId('finder-item-welcome').dblclick()
    // A Notes window should open with the file content as a new note.
    await expect(page.getByTestId('notes-content')).toBeVisible()
    const editor = page.getByTestId('notes-editor')
    await expect(editor).toHaveValue(/Welcome to macOS Tahoe/)
  })

  test('switching between notes preserves each note content', async ({ page }) => {
    await openNotes(page)
    // Create note A.
    await page.getByTestId('notes-new').click()
    await page.getByTestId('notes-editor').fill('Note A content')
    // Create note B.
    await page.getByTestId('notes-new').click()
    await page.getByTestId('notes-editor').fill('Note B content')
    // Switch back to note A by clicking its list item.
    await page.getByTestId('notes-item-title').filter({ hasText: 'Note A content' }).click()
    await expect(page.getByTestId('notes-editor')).toHaveValue('Note A content')
  })
})
