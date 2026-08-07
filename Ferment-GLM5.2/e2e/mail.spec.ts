import { test, expect } from '@playwright/test'

/**
 * Mail e2e — inbox + message view + compose; send moves to Sent; persisted.
 */

async function openMail(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('dock-icon-mail').click()
  await expect(page.getByTestId('mail-content')).toBeVisible()
}

test.describe('Mail', () => {
  test('opens from Dock on Inbox with seeded messages', async ({ page }) => {
    await openMail(page)
    await expect(page.getByTestId('mail-list')).toBeVisible()
    // Seed includes "Welcome to Mail" and "Tahoe is here".
    await expect(page.getByTestId('mail-item-subject').filter({ hasText: 'Welcome to Mail' })).toBeVisible()
    await expect(page.getByTestId('mail-item-subject').filter({ hasText: 'Tahoe is here' })).toBeVisible()
  })

  test('clicking a message shows it in the reading pane', async ({ page }) => {
    await openMail(page)
    await page.getByTestId('mail-item-subject').filter({ hasText: 'Welcome to Mail' }).click()
    await expect(page.getByTestId('mail-view')).toBeVisible()
    await expect(page.getByTestId('mail-view-subject')).toHaveText('Welcome to Mail')
    await expect(page.getByTestId('mail-view-body')).toContainText('Your inbox is set up')
  })

  test('unread indicator disappears after reading', async ({ page }) => {
    await openMail(page)
    // "Welcome to Mail" is unread initially (blue dot). Click it.
    const item = page.locator('[data-testid="mail-item"]').filter({ hasText: 'Welcome to Mail' })
    // Before reading, the unread dot exists.
    await expect(item.locator('.rounded-full')).toBeVisible()
    await item.click()
    // After reading, the dot is gone.
    await expect(item.locator('.rounded-full')).toHaveCount(0)
  })

  test('compose + send moves the message to Sent', async ({ page }) => {
    await openMail(page)
    await page.getByTestId('mail-compose').click()
    await expect(page.getByTestId('mail-compose-form')).toBeVisible()
    await page.getByTestId('mail-compose-to').fill('friend@example.com')
    await page.getByTestId('mail-compose-subject').fill('Lunch tomorrow')
    await page.getByTestId('mail-compose-body').fill('Want to grab lunch?')
    await page.getByTestId('mail-compose-send').click()
    // After send, we land on Sent with the new message selected.
    await expect(page.getByTestId('mail-view-subject')).toHaveText('Lunch tomorrow')
    await expect(page.getByTestId('mail-view-to')).toContainText('friend@example.com')
    await expect(page.getByTestId('mail-view-body')).toHaveText('Want to grab lunch?')
  })

  test('sent mail appears in the Sent mailbox', async ({ page }) => {
    await openMail(page)
    await page.getByTestId('mail-compose').click()
    await page.getByTestId('mail-compose-to').fill('colleague@work.com')
    await page.getByTestId('mail-compose-subject').fill('Project update')
    await page.getByTestId('mail-compose-body').fill('The build is green.')
    await page.getByTestId('mail-compose-send').click()
    // Switch to Sent and confirm the message is listed.
    await page.getByTestId('mail-mailbox-sent').click()
    await expect(page.getByTestId('mail-item-subject').filter({ hasText: 'Project update' })).toBeVisible()
  })

  test('sent mail persists across a full reload', async ({ page }) => {
    await openMail(page)
    await page.getByTestId('mail-compose').click()
    await page.getByTestId('mail-compose-to').fill('persist@example.com')
    await page.getByTestId('mail-compose-subject').fill('Persistent message')
    await page.getByTestId('mail-compose-body').fill('Survives reload.')
    await page.getByTestId('mail-compose-send').click()
    await page.reload()
    await openMail(page)
    await page.getByTestId('mail-mailbox-sent').click()
    await expect(page.getByTestId('mail-item-subject').filter({ hasText: 'Persistent message' })).toBeVisible()
  })

  test('delete removes a message from the list', async ({ page }) => {
    await openMail(page)
    const before = await page.getByTestId('mail-item').count()
    // Select and delete the first message.
    await page.getByTestId('mail-item').first().click()
    await page.getByTestId('mail-delete').click()
    const after = await page.getByTestId('mail-item').count()
    expect(after).toBe(before - 1)
  })

  test('seed Sent mailbox contains a sent message', async ({ page }) => {
    await openMail(page)
    await page.getByTestId('mail-mailbox-sent').click()
    await expect(page.getByTestId('mail-item-subject').filter({ hasText: 'Hello from Tahoe' })).toBeVisible()
  })
})
