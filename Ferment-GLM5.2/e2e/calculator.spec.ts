import { test, expect } from '@playwright/test'

/**
 * Calculator e2e — arithmetic correctness, precedence/chaining, keyboard
 * input, and Tahoe button grid interactions.
 */

async function openCalculator(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('dock-icon-calculator').click()
  await expect(page.getByTestId('calculator-content')).toBeVisible()
}

function display(page: import('@playwright/test').Page) {
  return page.getByTestId('calculator-display-text')
}

/** Click a sequence of calculator buttons by value. */
async function clickButtons(page: import('@playwright/test').Page, values: string[]) {
  for (const v of values) {
    await page.getByTestId(`calc-btn-${v}`).click()
  }
}

test.describe('Calculator', () => {
  test('opens from Dock with a 0 display', async ({ page }) => {
    await openCalculator(page)
    await expect(display(page)).toHaveText('0')
  })

  test('simple addition', async ({ page }) => {
    await openCalculator(page)
    await clickButtons(page, ['1', '+', '2', '='])
    await expect(display(page)).toHaveText('3')
  })

  test('multiplication precedence over addition', async ({ page }) => {
    await openCalculator(page)
    await clickButtons(page, ['1', '+', '2', '*', '3', '='])
    await expect(display(page)).toHaveText('7')
  })

  test('left-associative subtraction chaining', async ({ page }) => {
    await openCalculator(page)
    await clickButtons(page, ['1', '0', '-', '3', '-', '2', '='])
    await expect(display(page)).toHaveText('5')
  })

  test('parentheses override precedence', async ({ page }) => {
    await openCalculator(page)
    // ( 1 + 2 ) * 3 =
    await clickButtons(page, ['()', '1', '+', '2', '()', '*', '3', '='])
    await expect(display(page)).toHaveText('9')
  })

  test('division', async ({ page }) => {
    await openCalculator(page)
    await clickButtons(page, ['8', '/', '2', '='])
    await expect(display(page)).toHaveText('4')
  })

  test('chained expression with all four operators', async ({ page }) => {
    await openCalculator(page)
    // 2 + 3 * 4 - 6 / 2 = 11
    await clickButtons(page, ['2', '+', '3', '*', '4', '-', '6', '/', '2', '='])
    await expect(display(page)).toHaveText('11')
  })

  test('AC clears the display', async ({ page }) => {
    await openCalculator(page)
    await clickButtons(page, ['1', '2', '+'])
    await page.getByTestId('calc-btn-AC').click()
    await expect(display(page)).toHaveText('0')
  })

  test('decimals', async ({ page }) => {
    await openCalculator(page)
    // 0.5 * 2 =
    await clickButtons(page, ['0', '.', '5', '*', '2', '='])
    await expect(display(page)).toHaveText('1')
  })

  test('keyboard input works', async ({ page }) => {
    await openCalculator(page)
    await page.keyboard.press('5')
    await page.keyboard.press('+')
    await page.keyboard.press('3')
    await page.keyboard.press('Enter')
    await expect(display(page)).toHaveText('8')
  })

  test('keyboard backspace deletes', async ({ page }) => {
    await openCalculator(page)
    await page.keyboard.press('1')
    await page.keyboard.press('2')
    await page.keyboard.press('3')
    await page.keyboard.press('Backspace')
    await expect(display(page)).toHaveText('12')
  })

  test('division by zero shows Error', async ({ page }) => {
    await openCalculator(page)
    await clickButtons(page, ['5', '/', '0', '='])
    await expect(display(page)).toHaveText('Error')
  })

  test('continuing after equals with an operator', async ({ page }) => {
    await openCalculator(page)
    // 2 + 3 = 5, then + 5 = 10
    await clickButtons(page, ['2', '+', '3', '='])
    await clickButtons(page, ['+', '5', '='])
    await expect(display(page)).toHaveText('10')
  })
})
