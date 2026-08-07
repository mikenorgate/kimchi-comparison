import { test, expect } from '@playwright/test'

/**
 * Messages e2e — conversation list + thread view + send + simulated auto-reply
 * + persistence across reload.
 */

async function openMessages(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('dock-icon-messages').click()
  await expect(page.getByTestId('messages-content')).toBeVisible()
}

test.describe('Messages', () => {
  test('opens from Dock with seeded conversations', async ({ page }) => {
    await openMessages(page)
    await expect(page.getByTestId('messages-list')).toBeVisible()
    await expect(page.getByTestId('messages-contact').filter({ hasText: 'Jamie' })).toBeVisible()
    await expect(page.getByTestId('messages-contact').filter({ hasText: 'Alex' })).toBeVisible()
  })

  test('selecting a conversation shows its thread', async ({ page }) => {
    await openMessages(page)
    await page.getByTestId('messages-conversation').filter({ hasText: 'Alex' }).click()
    await expect(page.getByTestId('messages-thread-contact')).toHaveText('Alex')
    // The seeded message should appear.
    await expect(page.getByTestId('messages-bubble-text').filter({ hasText: 'Tahoe update' })).toBeVisible()
  })

  test('sending a message appends it to the thread', async ({ page }) => {
    await openMessages(page)
    await page.getByTestId('messages-conversation').filter({ hasText: 'Jamie' }).click()
    const before = await page.getByTestId('messages-bubble').count()
    await page.getByTestId('messages-input').fill('See you at noon')
    await page.getByTestId('messages-send').click()
    const after = await page.getByTestId('messages-bubble').count()
    expect(after).toBe(before + 1)
    await expect(page.getByTestId('messages-bubble-text').filter({ hasText: 'See you at noon' })).toBeVisible()
  })

  test('sending a message triggers a simulated auto-reply', async ({ page }) => {
    await openMessages(page)
    await page.getByTestId('messages-conversation').filter({ hasText: 'Jamie' }).click()
    const before = await page.getByTestId('messages-bubble').count()
    await page.getByTestId('messages-input').fill('Hello there')
    await page.getByTestId('messages-send').click()
    // After sending, the user's message appears (+1). Then a reply arrives after ~800ms (+1).
    await expect(page.getByTestId('messages-bubble-text').filter({ hasText: 'Hello there' })).toBeVisible()
    // Wait for the auto-reply: total bubbles should grow by 2 (user + reply).
    await expect.poll(
      async () => page.getByTestId('messages-bubble').count(),
      { timeout: 5000 },
    ).toBe(before + 2)
  })

  test('sent messages persist across a full reload', async ({ page }) => {
    await openMessages(page)
    await page.getByTestId('messages-conversation').filter({ hasText: 'Jamie' }).click()
    await page.getByTestId('messages-input').fill('Persistent hello')
    await page.getByTestId('messages-send').click()
    await expect(page.getByTestId('messages-bubble-text').filter({ hasText: 'Persistent hello' })).toBeVisible()
    await page.reload()
    await openMessages(page)
    await page.getByTestId('messages-conversation').filter({ hasText: 'Jamie' }).click()
    await expect(page.getByTestId('messages-bubble-text').filter({ hasText: 'Persistent hello' })).toBeVisible()
  })

  test('the Enter key sends a message', async ({ page }) => {
    await openMessages(page)
    await page.getByTestId('messages-conversation').filter({ hasText: 'Alex' }).click()
    const before = await page.getByTestId('messages-bubble').count()
    await page.getByTestId('messages-input').fill('Quick message')
    await page.getByTestId('messages-input').press('Enter')
    await expect(page.getByTestId('messages-bubble-text').filter({ hasText: 'Quick message' })).toBeVisible()
    const after = await page.getByTestId('messages-bubble').count()
    expect(after).toBe(before + 1)
  })
})
