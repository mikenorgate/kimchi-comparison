import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { setTimeout } from 'node:timers/promises'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const docsDir = path.resolve(
  root,
  '.kimchi/ferments/019fd294-8e66-72bb-bf75-0ec02d410b9a/docs'
)
const shotsDir = path.resolve(docsDir, 'shell-e2e-shots')
await fs.mkdir(shotsDir, { recursive: true })

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('./node_modules/.bin/vite', ['preview', '--port', '4173'], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    proc.stdout.on('data', (data) => {
      const line = data.toString()
      if (line.includes('Local:') || line.includes('http://localhost:4173')) {
        resolve(proc)
      }
    })
    proc.stderr.on('data', () => {})
    setTimeout(10000).then(() => reject(new Error('server did not start')))
  })
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(shotsDir, `${name}.png`), fullPage: false })
}

async function main() {
  const server = await startServer()
  let browser
  const results = []
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({ viewport: { width: 2560, height: 1200 } })
    const page = await context.newPage()
    await page.goto('http://localhost:4173')
    await page.waitForSelector('[data-testid="dock"]', { timeout: 10000 })
    await screenshot(page, '01-initial-desktop')

    // Menu Bar Apple menu opens
    {
      const appleButton = page.locator('[data-testid="apple-menu-button"]')
      const before = await appleButton.isVisible()
      await appleButton.hover()
      const menu = page.locator('[data-testid="apple-menu-popover"]')
      const opened = await menu.isVisible()
      await screenshot(page, '02-apple-menu-open')
      results.push({ name: 'apple-menu-opens', pass: before && opened })
      await page.keyboard.press('Escape')
    }

    // Dock opens a window and shows running indicator
    {
      await page.getByRole('button', { name: 'Finder' }).click({ force: true })
      const finder = page.getByTestId('finder-content')
      await finder.waitFor({ state: 'visible', timeout: 10000 })
      const indicators = await page.locator('[data-testid="dock"] [data-testid="running-indicator"]').count()
      await screenshot(page, '03-finder-open')
      results.push({ name: 'dock-opens-finder', pass: true })
      results.push({ name: 'dock-running-indicator', pass: indicators > 0 })
    }

    // Window traffic lights exist
    {
      const close = await page.locator('[data-testid="window-close"]').first().isVisible()
      const minimize = await page.locator('[data-testid="window-minimize"]').first().isVisible()
      const maximize = await page.locator('[data-testid="window-maximize"]').first().isVisible()
      results.push({ name: 'traffic-lights-present', pass: close && minimize && maximize })
    }

    // Minimize hides window
    {
      const windowContent = page.getByTestId('finder-content')
      await page.locator('[data-testid="window-minimize"]').first().click()
      await setTimeout(500)
      await screenshot(page, '04-finder-minimized')
      const hidden = await windowContent.isHidden().catch(() => true)
      results.push({ name: 'minimize-hides-window', pass: hidden })
      await page.getByRole('button', { name: 'Finder' }).click({ force: true })
      await windowContent.waitFor({ state: 'visible', timeout: 5000 })
    }

    // Maximize expands and restore returns
    {
      const boxBefore = await page.locator('[data-testid="finder-content"]').first().boundingBox()
      await page.locator('[data-testid="window-maximize"]').first().click()
      await setTimeout(500)
      await screenshot(page, '05-finder-maximized')
      const boxAfter = await page.locator('[data-testid="finder-content"]').first().boundingBox()
      const maximized = boxAfter && boxBefore && (boxAfter.width > boxBefore.width || boxAfter.height > boxBefore.height)
      results.push({ name: 'maximize-expands-window', pass: !!maximized })

      await page.locator('[data-testid="window-maximize"]').first().click()
      await setTimeout(500)
      await screenshot(page, '06-finder-restored')
      const boxRestored = await page.locator('[data-testid="finder-content"]').first().boundingBox()
      const restored = boxRestored && boxAfter && (boxRestored.width < boxAfter.width || boxRestored.height < boxAfter.height)
      results.push({ name: 'restore-returns-window', pass: !!restored })
    }

    // Drag title bar moves window
    {
      const titleBar = page.locator('[data-testid="window-title-bar"]').first()
      const boxBefore = await titleBar.boundingBox()
      await titleBar.dragTo(page.locator('[data-testid="desktop"]').first(), {
        sourcePosition: { x: 40, y: 10 },
        targetPosition: { x: 200, y: 100 },
      })
      await setTimeout(300)
      await screenshot(page, '07-window-dragged')
      const boxAfter = await titleBar.boundingBox()
      const moved = boxBefore && boxAfter && (Math.abs(boxAfter.x - boxBefore.x) > 5 || Math.abs(boxAfter.y - boxBefore.y) > 5)
      results.push({ name: 'drag-titlebar-moves-window', pass: !!moved })
    }

    // Resize handle resizes window
    {
      const handle = page.locator('[data-testid="window-resize"]').first()
      const boxBefore = await page.locator('[data-testid="finder-content"]').first().boundingBox()
      const handleBox = await handle.boundingBox()
      if (handleBox) {
        await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
        await page.mouse.down()
        await page.mouse.move(handleBox.x + handleBox.width / 2 + 60, handleBox.y + handleBox.height / 2 + 40)
        await page.mouse.up()
      }
      await setTimeout(300)
      await screenshot(page, '08-window-resized')
      const boxAfter = await page.locator('[data-testid="finder-content"]').first().boundingBox()
      const resized = boxBefore && boxAfter && (boxAfter.width > boxBefore.width || boxAfter.height > boxBefore.height)
      results.push({ name: 'resize-handle-resizes-window', pass: !!resized })
    }

    // Close button closes window
    {
      const finder = page.getByTestId('finder-content')
      await page.locator('[data-testid="window-close"]').first().click()
      await setTimeout(300)
      await screenshot(page, '09-finder-closed')
      const closed = await finder.isHidden().catch(() => true)
      results.push({ name: 'close-button-closes-window', pass: closed })
    }

    // Focus / z-order: open two windows, click back brings to front
    {
      await page.getByRole('button', { name: 'Notes' }).click({ force: true })
      await page.getByTestId('notes-app').waitFor({ state: 'visible', timeout: 10000 })
      await page.getByRole('button', { name: 'Mail' }).click({ force: true })
      await page.getByTestId('mail-app').waitFor({ state: 'visible', timeout: 10000 })
      const notesWindow = page.locator('[data-testid^="window-"]').filter({ has: page.getByTestId('notes-app') })
      const mailWindow = page.locator('[data-testid^="window-"]').filter({ has: page.getByTestId('mail-app') })
      const notesTitle = notesWindow.locator('[data-testid="window-title-bar"]').first()
      const mailZBefore = await mailWindow.evaluate((el) => parseInt(getComputedStyle(el).zIndex || '0', 10))
      const notesZBefore = await notesWindow.evaluate((el) => parseInt(getComputedStyle(el).zIndex || '0', 10))
      await notesTitle.dispatchEvent('mousedown')
      await setTimeout(600)
      await screenshot(page, '10-focus-notes-front')
      const notesZAfter = await notesWindow.evaluate((el) => parseInt(getComputedStyle(el).zIndex || '0', 10))
      const mailZAfter = await mailWindow.evaluate((el) => parseInt(getComputedStyle(el).zIndex || '0', 10))
      const pass = !isNaN(notesZAfter) && !isNaN(mailZAfter) && notesZAfter > mailZBefore
      console.log(`z-order: notes ${notesZBefore} -> ${notesZAfter}, mail ${mailZBefore} -> ${mailZAfter}`)
      results.push({ name: 'focus-raises-z-order', pass })
      await notesWindow.locator('[data-testid="window-close"]').first().click({ force: true })
      await mailWindow.locator('[data-testid="window-close"]').first().click({ force: true })
    }

    // Desktop context menu
    {
      const desktop = page.locator('[data-testid="desktop"]').first()
      await desktop.click({ button: 'right' })
      const menu = page.locator('[data-testid="desktop-context-menu"]')
      const visible = await menu.isVisible()
      await screenshot(page, '11-desktop-context-menu')
      results.push({ name: 'desktop-context-menu-opens', pass: visible })
      await page.keyboard.press('Escape')
    }

    const passed = results.filter((r) => r.pass).length
    const failed = results.filter((r) => !r.pass).length
    console.log(`Shell E2E: ${passed} passed, ${failed} failed out of ${results.length}`)
    for (const r of results) {
      console.log(`  ${r.pass ? '✓' : '✗'} ${r.name}`)
    }

    await fs.writeFile(path.join(docsDir, 'phase7-shell-e2e-report.json'), JSON.stringify({ passed, failed, total: results.length, results }, null, 2))

    if (failed > 0) process.exitCode = 1
  } finally {
    if (browser) await browser.close()
    server.kill('SIGTERM')
    await setTimeout(1000)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
