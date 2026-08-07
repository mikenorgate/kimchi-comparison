import { test, expect } from '@playwright/test'

/**
 * Terminal e2e — a working shell over the virtual filesystem.
 *
 * Exercises ls, cd, pwd, cat, mkdir, touch, echo (incl. redirect), clear,
 * help, plus command history (Up/Down). Each test gets a fresh context →
 * fresh localStorage → VFS rehydrates from the deterministic seed.
 */

async function openTerminal(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('dock-icon-terminal').click()
  await expect(page.getByTestId('terminal-content')).toBeVisible()
  return page.getByTestId('terminal-input')
}

/** Run a command in the terminal and return the last output line's text. */
async function run(page: import('@playwright/test').Page, cmd: string) {
  const input = page.getByTestId('terminal-input')
  await input.fill(cmd)
  await input.press('Enter')
}

/** Get the text of the Nth-from-last terminal line. */
function line(page: import('@playwright/test').Page, fromEnd = 1) {
  return page
    .getByTestId('terminal-line')
    .nth(-fromEnd)
    .locator('pre')
}

test.describe('Terminal', () => {
  test('opens from Dock and shows a prompt', async ({ page }) => {
    await openTerminal(page)
    // The banner mentions 'help'.
    await expect(page.getByTestId('terminal-output')).toContainText('help')
  })

  test('pwd prints the working directory (root by default)', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'pwd')
    await expect(line(page, 1)).toHaveText('/')
  })

  test('ls lists the root folder contents', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'ls')
    // Root contains Desktop/ Documents/ Downloads/ Pictures/ Projects/
    await expect(page.getByTestId('terminal-output')).toContainText('Desktop/')
    await expect(page.getByTestId('terminal-output')).toContainText('Documents/')
    await expect(page.getByTestId('terminal-output')).toContainText('Projects/')
  })

  test('cd changes directory and pwd reflects it', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'cd Documents')
    await run(page, 'pwd')
    await expect(line(page, 1)).toHaveText('/Documents')
  })

  test('cat prints a file contents', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'cat /Desktop/Welcome.txt')
    await expect(page.getByTestId('terminal-output')).toContainText('Welcome to macOS Tahoe')
  })

  test('cat on a directory errors', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'cat /Documents')
    await expect(line(page, 1)).toContainText('Is a directory')
  })

  test('mkdir creates a folder visible to ls', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'mkdir testdir')
    await run(page, 'ls')
    await expect(page.getByTestId('terminal-output')).toContainText('testdir/')
  })

  test('touch creates an empty file visible to ls', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'touch empty.txt')
    await run(page, 'ls')
    await expect(page.getByTestId('terminal-output')).toContainText('empty.txt')
  })

  test('echo prints text', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'echo hello world')
    await expect(line(page, 1)).toHaveText('hello world')
  })

  test('echo with redirect writes to a file', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'echo hello > greet.txt')
    await run(page, 'cat greet.txt')
    await expect(line(page, 1)).toHaveText('hello')
  })

  test('clear empties the screen', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'echo before-clear')
    await run(page, 'clear')
    // After clear, only the live prompt line remains; no prior output lines.
    await expect(page.getByTestId('terminal-line')).toHaveCount(0)
  })

  test('help lists the available commands', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'help')
    await expect(page.getByTestId('terminal-output')).toContainText('ls')
    await expect(page.getByTestId('terminal-output')).toContainText('mkdir')
    await expect(page.getByTestId('terminal-output')).toContainText('clear')
  })

  test('unknown command errors', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'foobar')
    await expect(line(page, 1)).toContainText('command not found')
  })

  test('command history: Up arrow recalls the previous command', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'echo first')
    await run(page, 'echo second')
    const input = page.getByTestId('terminal-input')
    await input.press('ArrowUp')
    await expect(input).toHaveValue('echo second')
    await input.press('ArrowUp')
    await expect(input).toHaveValue('echo first')
  })

  test('mkdir creates a folder that persists across reload', async ({ page }) => {
    await openTerminal(page)
    await run(page, 'mkdir persisted-dir')
    await page.reload()
    await openTerminal(page)
    await run(page, 'ls')
    await expect(page.getByTestId('terminal-output')).toContainText('persisted-dir/')
  })
})
