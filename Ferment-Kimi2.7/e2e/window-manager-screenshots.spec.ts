import { test } from '@playwright/test'
import path from 'node:path'

const OUTPUT_DIR = '/tmp/tahoe-wm-screenshots'

function shot(name: string) {
  return path.join(OUTPUT_DIR, `${name}.png`)
}

test('capture window manager dynamic behavior screenshots', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('[data-testid="window-frame"]', { timeout: 10000 })

  const finder = page.locator('[data-window-id="finder-1"]')
  const safari = page.locator('[data-window-id="safari-1"]')

  // 1. Initial state: two overlapping windows, Safari on top.
  await page.screenshot({ path: shot('01-initial'), fullPage: false })

  // 2. Focus Finder: click title bar to bring it front.
  await finder.locator('[data-testid="window-titlebar"]').click()
  await page.screenshot({ path: shot('02-focus'), fullPage: false })

  // 3. Drag Finder by the title bar.
  const box = await finder.boundingBox()
  await page.mouse.move(box!.x + 80, box!.y + 10)
  await page.mouse.down()
  await page.mouse.move(box!.x + 160, box!.y + 80)
  await page.mouse.up()
  await page.screenshot({ path: shot('03-drag'), fullPage: false })

  // 4. Resize Finder from the bottom-right handle.
  const handle = finder.locator('[data-testid="window-resize-handle"]')
  const handleBox = await handle.boundingBox()
  const startX = handleBox!.x + handleBox!.width / 2
  const startY = handleBox!.y + handleBox!.height / 2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + 80, startY + 70)
  await page.mouse.up()
  await page.screenshot({ path: shot('04-resize'), fullPage: false })

  // 5. Maximize Finder, then restore it so Safari remains reachable.
  await finder.getByRole('button', { name: 'Maximize' }).click()
  await page.screenshot({ path: shot('05-maximize'), fullPage: false })
  await finder.getByRole('button', { name: 'Maximize' }).click()

  // 6. Minimize Safari and close Finder.
  await safari.getByRole('button', { name: 'Minimize' }).click()
  await finder.getByRole('button', { name: 'Close' }).click()
  await page.screenshot({ path: shot('06-close'), fullPage: false })
})
