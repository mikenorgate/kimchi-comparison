import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { setTimeout } from 'node:timers/promises'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const docsDir = path.resolve(
  root,
  '.kimchi/ferments/019fd294-8e66-72bb-bf75-0ec02d410b9a/docs'
)
const baselineDir = path.resolve(docsDir, 'visual-baselines')
const currentDir = path.resolve(docsDir, 'visual-current')
const diffDir = path.resolve(docsDir, 'visual-diff')

await fs.mkdir(baselineDir, { recursive: true })
await fs.mkdir(currentDir, { recursive: true })
await fs.mkdir(diffDir, { recursive: true })

const apps = [
  { name: 'Desktop', label: null, testId: 'desktop' },
  { name: 'MenuBar', label: null, testId: 'menu-bar' },
  { name: 'Dock', label: null, testId: 'dock' },
  { name: 'Finder', label: 'Finder', testId: 'finder-content' },
  { name: 'SystemSettings', label: 'System Settings', testId: 'settings-detail' },
  { name: 'Safari', label: 'Safari', testId: 'safari-page' },
  { name: 'Terminal', label: 'Terminal', testId: 'terminal' },
  { name: 'Calculator', label: 'Calculator', testId: 'calculator' },
  { name: 'Notes', label: 'Notes', testId: 'notes-app' },
  { name: 'Mail', label: 'Mail', testId: 'mail-app' },
  { name: 'Messages', label: 'Messages', testId: 'messages-app' },
  { name: 'Calendar', label: 'Calendar', testId: 'calendar-app' },
  { name: 'Photos', label: 'Photos', testId: 'photos-app' },
  { name: 'Music', label: 'Music', testId: 'music-app' },
  { name: 'Maps', label: 'Maps', testId: 'maps-app' },
  { name: 'TV', label: 'TV', testId: 'tv-app' },
  { name: 'Weather', label: 'Weather', testId: 'weather-app' },
  { name: 'Clock', label: 'Clock', testId: 'clock-app' },
  { name: 'FaceTime', label: 'FaceTime', testId: 'facetime-app' },
  { name: 'Reminders', label: 'Reminders', testId: 'reminders-app' },
  { name: 'AppStore', label: 'App Store', testId: 'app-store-app' },
  { name: 'Contacts', label: 'Contacts', testId: 'contacts-app' },
  { name: 'Books', label: 'Books', testId: 'books-app' },
  { name: 'Podcasts', label: 'Podcasts', testId: 'podcasts-app' },
  { name: 'News', label: 'News', testId: 'news-app' },
  { name: 'Stocks', label: 'Stocks', testId: 'stocks-app' },
  { name: 'Home', label: 'Home', testId: 'home-app' },
  { name: 'VoiceMemos', label: 'Voice Memos', testId: 'voice-memos-app' },
  { name: 'Freeform', label: 'Freeform', testId: 'freeform-app' },
  { name: 'Passwords', label: 'Passwords', testId: 'passwords-app' },
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
    proc.stderr.on('data', () => {})
    setTimeout(10000).then(() => reject(new Error('server did not start')))
  })
}

async function diffImages(currentPath, baselinePath, diffPath) {
  const current = PNG.sync.read(await fs.readFile(currentPath))
  const baseline = PNG.sync.read(await fs.readFile(baselinePath))
  const { width, height } = current
  if (baseline.width !== width || baseline.height !== height) {
    return { mismatch: 1, message: `size mismatch ${baseline.width}x${baseline.height} vs ${width}x${height}` }
  }
  const diff = new PNG({ width, height })
  const mismatch = pixelmatch(current.data, baseline.data, diff.data, width, height, { threshold: 0.1 })
  await fs.writeFile(diffPath, PNG.sync.write(diff))
  const totalPixels = width * height
  const percent = (mismatch / totalPixels) * 100
  return { mismatch, percent }
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

    for (const app of apps) {
      if (app.label) {
        const button = page.getByRole('button', { name: app.label })
        await button.waitFor({ state: 'visible' })
        await button.click({ force: true })
        await page.getByTestId(app.testId).waitFor({ state: 'visible', timeout: 10000 })
        await setTimeout(300)
      }
      const selector = app.testId === 'desktop' ? undefined : app.testId === 'menu-bar' ? '[data-testid="menu-bar"]' : app.testId === 'dock' ? '[data-testid="dock"]' : `[data-testid="${app.testId}"]`
      const currentPath = path.join(currentDir, `${app.name}.png`)
      if (selector) {
        await page.locator(selector).first().screenshot({ path: currentPath })
      } else {
        await page.screenshot({ path: currentPath })
      }

      const baselinePath = path.join(baselineDir, `${app.name}.png`)
      let status = 'PASS'
      let diffResult = { mismatch: 0, percent: 0, message: '' }
      try {
        await fs.access(baselinePath)
        diffResult = await diffImages(currentPath, baselinePath, path.join(diffDir, `${app.name}.png`))
        if (diffResult.percent > 0.5) {
          status = 'FAIL'
        }
      } catch {
        await fs.copyFile(currentPath, baselinePath)
        diffResult.message = 'baseline created'
      }

      results.push({ name: app.name, status, ...diffResult })

      if (app.label) {
        const closeButton = page.locator('[data-testid="window-close"]').first()
        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click()
          await page.getByTestId(app.testId).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
        }
      }
    }

    const passed = results.filter((r) => r.status === 'PASS').length
    const failed = results.filter((r) => r.status === 'FAIL').length
    console.log(`Visual regression: ${passed} passed, ${failed} failed out of ${results.length}`)

    const report = { passed, failed, total: results.length, results }
    await fs.writeFile(path.join(docsDir, 'phase7-visual-regression-report.json'), JSON.stringify(report, null, 2))

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Phase 7 Visual Regression</title>
<style>body{font-family:system-ui,sans-serif;margin:2rem}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px}th{text-align:left}img{max-width:240px;border:1px solid #ddd}.pass{color:green}.fail{color:red}</style></head>
<body><h1>Phase 7 Visual Regression Report</h1><p>${passed} passed, ${failed} failed out of ${results.length}</p>
<table><tr><th>App</th><th>Status</th><th>Mismatch pixels</th><th>Current</th><th>Baseline</th><th>Diff</th></tr>
${results.map(r => `<tr><td>${r.name}</td><td class="${r.status.toLowerCase()}">${r.status}</td><td>${r.mismatch ?? '-'}${r.percent !== undefined ? ` (${r.percent.toFixed(3)}%)` : ''}${r.message ? `<br><small>${r.message}</small>` : ''}</td>
<td><img src="visual-current/${r.name}.png" alt="current"></td>
<td><img src="visual-baselines/${r.name}.png" alt="baseline"></td>
<td><img src="visual-diff/${r.name}.png" alt="diff"></td></tr>`).join('')}</table></body></html>`
    await fs.writeFile(path.join(docsDir, 'phase7-visual-regression-report.html'), html)

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
