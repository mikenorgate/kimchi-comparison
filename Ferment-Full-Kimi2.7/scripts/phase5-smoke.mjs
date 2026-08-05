import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { setTimeout } from 'node:timers/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const docsDir = path.resolve(
  root,
  '.kimchi/ferments/019fd294-8e66-72bb-bf75-0ec02d410b9a/docs'
)

const apps = [
  { name: 'Mail', testId: 'mail-app' },
  { name: 'Messages', testId: 'messages-app' },
  { name: 'Photos', testId: 'photos-app' },
  { name: 'Music', testId: 'music-app' },
  { name: 'TV', testId: 'tv-app' },
  { name: 'Maps', testId: 'maps-app' },
  { name: 'FaceTime', testId: 'facetime-app' },
]

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
    proc.stderr.on('data', (data) => {
      // ignore vite preview warnings
    })
    setTimeout(10000).then(() => reject(new Error('server did not start')))
  })
}

async function main() {
  const server = await startServer()
  let browser
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await context.newPage()
    await page.goto('http://localhost:4173')
    await page.waitForSelector('[data-testid="dock"]', { timeout: 10000 })

    for (const app of apps) {
      const button = page.getByRole('button', { name: app.name })
      await button.waitFor({ state: 'visible' })
      await button.click()
      const windowContent = page.getByTestId(app.testId)
      await windowContent.waitFor({ state: 'visible', timeout: 10000 })
      await setTimeout(300)
      await page.screenshot({
        path: path.join(docsDir, `phase5-smoke-${app.name.toLowerCase().replace(/\s+/g, '-')}.png`),
        fullPage: false,
      })
      const closeButton = page.locator('[data-testid="window-close"]').first()
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click()
        await windowContent.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
      }
    }

    console.log('Phase 5 smoke screenshots captured.')
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
