import { test, expect, type Page } from '@playwright/test'

/**
 * Control Center e2e — step 5 acceptance: opens from the menu bar; Wi-Fi /
 * Bluetooth toggles flip state; Brightness / Volume sliders mutate the
 * system store; click-away and Escape close it.
 */

// Set a range input's value in a React-compatible way (Playwright's fill()
// does not support type="range").
async function setRange(page: Page, testId: string, value: number) {
  await page.getByTestId(testId).evaluate((el, val) => {
    const input = el as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!
    setter.call(input, String(val))
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

test.describe('Control Center', () => {
  test('opens from the menu bar trigger', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('control-center-trigger').click()
    await expect(page.getByTestId('control-center')).toBeVisible()
  })

  test('Wi-Fi toggle flips state', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('control-center-trigger').click()
    const tile = page.getByTestId('tile-wifi')
    await expect(tile).toHaveAttribute('data-active', 'true')
    await tile.click()
    await expect(tile).toHaveAttribute('data-active', 'false')
    await tile.click()
    await expect(tile).toHaveAttribute('data-active', 'true')
  })

  test('Bluetooth toggle flips state', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('control-center-trigger').click()
    const tile = page.getByTestId('tile-bluetooth')
    await expect(tile).toHaveAttribute('data-active', 'true')
    await tile.click()
    await expect(tile).toHaveAttribute('data-active', 'false')
  })

  test('AirDrop toggle flips state', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('control-center-trigger').click()
    const tile = page.getByTestId('tile-airdrop')
    await expect(tile).toHaveAttribute('data-active', 'false')
    await tile.click()
    await expect(tile).toHaveAttribute('data-active', 'true')
  })

  test('Focus (Do Not Disturb) toggle flips state', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('control-center-trigger').click()
    const tile = page.getByTestId('tile-focus')
    await expect(tile).toHaveAttribute('data-active', 'false')
    await tile.click()
    await expect(tile).toHaveAttribute('data-active', 'true')
  })

  test('Brightness slider mutates the system store', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('control-center-trigger').click()
    const container = page.getByTestId('slider-brightness')
    const before = await container.getAttribute('data-value')
    await setRange(page, 'slider-brightness-input', 25)
    await expect(container).toHaveAttribute('data-value', '25')
    expect(before).not.toBe('25')
  })

  test('Volume slider mutates the system store', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('control-center-trigger').click()
    const container = page.getByTestId('slider-volume')
    await setRange(page, 'slider-volume-input', 90)
    await expect(container).toHaveAttribute('data-value', '90')
  })

  test('click-away closes Control Center', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('control-center-trigger').click()
    await expect(page.getByTestId('control-center')).toBeVisible()
    await page.getByTestId('control-center-scrim').click()
    await expect(page.getByTestId('control-center')).toHaveCount(0)
  })

  test('Escape closes Control Center', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('control-center-trigger').click()
    await expect(page.getByTestId('control-center')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('control-center')).toHaveCount(0)
  })
})
