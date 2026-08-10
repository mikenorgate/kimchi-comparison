import { test, expect } from '@playwright/test'

test.describe('Calculator', () => {
  test('renders with display and buttons', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await expect(page.getByTestId('calculator-root')).toBeVisible()
    await expect(page.getByTestId('calculator-display')).toHaveText('0')
    await expect(page.getByTestId('calculator-buttons')).toBeVisible()
  })

  test('basic addition via button clicks', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await expect(page.getByTestId('calculator-root')).toBeVisible()

    // 5 + 3 = 8
    await page.getByTestId('calc-5').click()
    await page.getByTestId('calc-add').click()
    await page.getByTestId('calc-3').click()
    await page.getByTestId('calc-equals').click()

    await expect(page.getByTestId('calculator-display')).toHaveText('8')
  })

  test('multiplication via button clicks', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()

    // 6 × 7 = 42
    await page.getByTestId('calc-6').click()
    await page.getByTestId('calc-multiply').click()
    await page.getByTestId('calc-7').click()
    await page.getByTestId('calc-equals').click()

    await expect(page.getByTestId('calculator-display')).toHaveText('42')
  })

  test('division by zero shows Error', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()

    // 5 ÷ 0 = Error
    await page.getByTestId('calc-5').click()
    await page.getByTestId('calc-divide').click()
    await page.getByTestId('calc-0').click()
    await page.getByTestId('calc-equals').click()

    await expect(page.getByTestId('calculator-display')).toHaveText('Error')

    // AC should clear
    await page.getByTestId('calc-clear').click()
    await expect(page.getByTestId('calculator-display')).toHaveText('0')
  })

  test('keyboard input works', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await expect(page.getByTestId('calculator-root')).toBeVisible()

    // Focus the calculator for keyboard input
    await page.getByTestId('calculator-root').click()

    // Type: 9 - 4 Enter
    await page.keyboard.press('9')
    await page.keyboard.press('-')
    await page.keyboard.press('4')
    await page.keyboard.press('Enter')

    await expect(page.getByTestId('calculator-display')).toHaveText('5')
  })

  test('keyboard division and decimal', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await page.getByTestId('calculator-root').click()

    // Type: 3 . 5 / 2 =
    await page.keyboard.press('3')
    await page.keyboard.press('.')
    await page.keyboard.press('5')
    await page.keyboard.press('/')
    await page.keyboard.press('2')
    await page.keyboard.press('=')

    await expect(page.getByTestId('calculator-display')).toHaveText('1.75')
  })

  test('clear with Escape key', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()
    await page.getByTestId('calculator-root').click()

    await page.keyboard.press('5')
    await page.keyboard.press('+')
    await page.keyboard.press('3')
    await page.keyboard.press('Escape')

    await expect(page.getByTestId('calculator-display')).toHaveText('0')
  })

  test('toggle sign button', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()

    await page.getByTestId('calc-5').click()
    await page.getByTestId('calc-sign').click()
    await expect(page.getByTestId('calculator-display')).toHaveText('-5')

    await page.getByTestId('calc-sign').click()
    await expect(page.getByTestId('calculator-display')).toHaveText('5')
  })

  test('percent button', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()

    // 50% = 0.5
    await page.getByTestId('calc-5').click()
    await page.getByTestId('calc-0').click()
    await page.getByTestId('calc-percent').click()
    await expect(page.getByTestId('calculator-display')).toHaveText('0.5')
  })

  test('chained operations (2 + 3 × 4 = 20)', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('dock-icon-calculator').click()

    await page.getByTestId('calc-2').click()
    await page.getByTestId('calc-add').click()
    await page.getByTestId('calc-3').click()
    await page.getByTestId('calc-multiply').click()
    await page.getByTestId('calc-4').click()
    await page.getByTestId('calc-equals').click()

    await expect(page.getByTestId('calculator-display')).toHaveText('20')
  })
})
