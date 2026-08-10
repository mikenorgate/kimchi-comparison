# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: window-manager-screenshots.spec.ts >> capture window manager dynamic behavior screenshots
- Location: e2e/window-manager-screenshots.spec.ts:10:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-window-id="safari-1"]').getByRole('button', { name: 'Minimize' })
    - locator resolved to <button type="button" aria-label="Minimize" class="w-3 h-3 rounded-full transition-colors hover:bg-[#febc2e]/90"></button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="w-full h-full"></div> from <div role="dialog" aria-modal="false" aria-label="Finder" data-window-id="finder-1" data-testid="window-frame" class="absolute flex flex-col overflow-hidden rounded-tahoe transition-shadow duration-150">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="w-full h-full"></div> from <div role="dialog" aria-modal="false" aria-label="Finder" data-window-id="finder-1" data-testid="window-frame" class="absolute flex flex-col overflow-hidden rounded-tahoe transition-shadow duration-150">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    57 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="w-full h-full"></div> from <div role="dialog" aria-modal="false" aria-label="Finder" data-window-id="finder-1" data-testid="window-frame" class="absolute flex flex-col overflow-hidden rounded-tahoe transition-shadow duration-150">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - button "Apple menu" [ref=e7]
      - generic [ref=e10]: Finder
      - button "File" [ref=e11]
      - button "Edit" [ref=e12]
      - button "View" [ref=e13]
      - button "Go" [ref=e14]
      - button "Window" [ref=e15]
      - button "Help" [ref=e16]
    - generic [ref=e17]:
      - button "Spotlight" [ref=e18]
      - button "Control Center" [ref=e21]
      - generic [ref=e24]: Mon, Aug 10 3:13 PM
  - generic [ref=e25]:
    - dialog "Finder" [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]:
          - button "Close" [ref=e29]
          - button "Minimize" [ref=e30]
          - button "Maximize" [active] [ref=e31]
        - generic: Finder
    - dialog "Safari" [ref=e34]:
      - generic [ref=e35]:
        - generic [ref=e36]:
          - button "Close" [ref=e37]
          - button "Minimize" [ref=e38]
          - button "Maximize" [ref=e39]
        - generic: Safari
```

# Test source

```ts
  1  | import { test } from '@playwright/test'
  2  | import path from 'node:path'
  3  | 
  4  | const OUTPUT_DIR = '/tmp/tahoe-wm-screenshots'
  5  | 
  6  | function shot(name: string) {
  7  |   return path.join(OUTPUT_DIR, `${name}.png`)
  8  | }
  9  | 
  10 | test('capture window manager dynamic behavior screenshots', async ({ page }) => {
  11 |   await page.goto('/')
  12 |   await page.waitForSelector('[data-testid="window-frame"]', { timeout: 10000 })
  13 | 
  14 |   const finder = page.locator('[data-window-id="finder-1"]')
  15 |   const safari = page.locator('[data-window-id="safari-1"]')
  16 | 
  17 |   // 1. Initial state: two overlapping windows, Safari on top.
  18 |   await page.screenshot({ path: shot('01-initial'), fullPage: false })
  19 | 
  20 |   // 2. Focus Finder: click title bar to bring it front.
  21 |   await finder.locator('[data-testid="window-titlebar"]').click()
  22 |   await page.screenshot({ path: shot('02-focus'), fullPage: false })
  23 | 
  24 |   // 3. Drag Finder by the title bar.
  25 |   const box = await finder.boundingBox()
  26 |   await page.mouse.move(box!.x + 80, box!.y + 10)
  27 |   await page.mouse.down()
  28 |   await page.mouse.move(box!.x + 160, box!.y + 80)
  29 |   await page.mouse.up()
  30 |   await page.screenshot({ path: shot('03-drag'), fullPage: false })
  31 | 
  32 |   // 4. Resize Finder from the bottom-right handle.
  33 |   const handle = finder.locator('[data-testid="window-resize-handle"]')
  34 |   const handleBox = await handle.boundingBox()
  35 |   const startX = handleBox!.x + handleBox!.width / 2
  36 |   const startY = handleBox!.y + handleBox!.height / 2
  37 |   await page.mouse.move(startX, startY)
  38 |   await page.mouse.down()
  39 |   await page.mouse.move(startX + 80, startY + 70)
  40 |   await page.mouse.up()
  41 |   await page.screenshot({ path: shot('04-resize'), fullPage: false })
  42 | 
  43 |   // 5. Maximize Finder.
  44 |   await finder.getByRole('button', { name: 'Maximize' }).click()
  45 |   await page.screenshot({ path: shot('05-maximize'), fullPage: false })
  46 | 
  47 |   // 6. Minimize Safari and close Finder.
> 48 |   await safari.getByRole('button', { name: 'Minimize' }).click()
     |                                                          ^ Error: locator.click: Test timeout of 30000ms exceeded.
  49 |   await finder.getByRole('button', { name: 'Close' }).click()
  50 |   await page.screenshot({ path: shot('06-close'), fullPage: false })
  51 | })
  52 | 
```