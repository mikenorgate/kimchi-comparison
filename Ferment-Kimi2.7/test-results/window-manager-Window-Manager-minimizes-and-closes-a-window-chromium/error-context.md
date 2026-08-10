# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: window-manager.spec.ts >> Window Manager >> minimizes and closes a window
- Location: e2e/window-manager.spec.ts:91:3

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  locator('[data-window-id="finder-1"]')
Expected: hidden
Received: visible
Timeout:  5000ms

Call log:
  - Expect "toBeHidden" with timeout 5000ms
  - waiting for locator('[data-window-id="finder-1"]')
    14 × locator resolved to <div role="dialog" aria-modal="false" aria-label="Finder" data-window-id="finder-1" data-testid="window-frame" class="absolute flex flex-col overflow-hidden rounded-tahoe transition-shadow duration-150">…</div>
       - unexpected value "visible"

```

```yaml
- dialog "Finder":
  - button "Close"
  - button "Minimize"
  - button "Maximize"
  - text: Finder
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | test.describe('Window Manager', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('/')
  6   |     await page.waitForSelector('[data-testid="window-frame"]', { timeout: 10000 })
  7   |   })
  8   | 
  9   |   test('renders sample Finder and Safari windows', async ({ page }) => {
  10  |     const frames = page.locator('[data-testid="window-frame"]')
  11  |     await expect(frames).toHaveCount(2)
  12  |     await expect(page.getByRole('dialog', { name: 'Finder' })).toBeVisible()
  13  |     await expect(page.getByRole('dialog', { name: 'Safari' })).toBeVisible()
  14  |   })
  15  | 
  16  |   test('focuses a window on click and raises its z-index', async ({ page }) => {
  17  |     const finder = page.locator('[data-window-id="finder-1"]')
  18  |     const safari = page.locator('[data-window-id="safari-1"]')
  19  | 
  20  |     const initialFinderZ = await finder.evaluate((el) =>
  21  |       Number(window.getComputedStyle(el).zIndex),
  22  |     )
  23  |     const initialSafariZ = await safari.evaluate((el) =>
  24  |       Number(window.getComputedStyle(el).zIndex),
  25  |     )
  26  |     expect(initialFinderZ).toBeLessThan(initialSafariZ)
  27  | 
  28  |     // Click on the Finder window (currently behind Safari) to bring it front.
  29  |     await finder.locator('[data-testid="window-titlebar"]').click()
  30  | 
  31  |     const nextFinderZ = await finder.evaluate((el) =>
  32  |       Number(window.getComputedStyle(el).zIndex),
  33  |     )
  34  |     const nextSafariZ = await safari.evaluate((el) =>
  35  |       Number(window.getComputedStyle(el).zIndex),
  36  |     )
  37  |     expect(nextFinderZ).toBeGreaterThan(nextSafariZ)
  38  |   })
  39  | 
  40  |   test('drags a window by the title bar', async ({ page }) => {
  41  |     const finder = page.locator('[data-window-id="finder-1"]')
  42  |     const boxBefore = await finder.boundingBox()
  43  |     expect(boxBefore).not.toBeNull()
  44  | 
  45  |     const titlebar = finder.locator('[data-testid="window-titlebar"]')
  46  |     await titlebar.dragTo(titlebar, {
  47  |       sourcePosition: { x: 200, y: 10 },
  48  |       targetPosition: { x: 280, y: 80 },
  49  |     })
  50  | 
  51  |     const boxAfter = await finder.boundingBox()
  52  |     expect(boxAfter!.x).toBeGreaterThan(boxBefore!.x)
  53  |     expect(boxAfter!.y).toBeGreaterThan(boxBefore!.y)
  54  |   })
  55  | 
  56  |   test('resizes a window from the bottom-right corner', async ({ page }) => {
  57  |     const finder = page.locator('[data-window-id="finder-1"]')
  58  |     const boxBefore = await finder.boundingBox()
  59  |     expect(boxBefore).not.toBeNull()
  60  | 
  61  |     const handle = finder.locator('.cursor-nwse-resize')
  62  |     await handle.dragTo(handle, {
  63  |       sourcePosition: { x: 8, y: 8 },
  64  |       targetPosition: { x: 80, y: 60 },
  65  |     })
  66  | 
  67  |     const boxAfter = await finder.boundingBox()
  68  |     expect(boxAfter!.width).toBeGreaterThan(boxBefore!.width)
  69  |     expect(boxAfter!.height).toBeGreaterThan(boxBefore!.height)
  70  |   })
  71  | 
  72  |   test('maximizes and restores a window', async ({ page }) => {
  73  |     const finder = page.locator('[data-window-id="finder-1"]')
  74  |     const boxBefore = await finder.boundingBox()
  75  | 
  76  |     await finder.getByRole('button', { name: 'Maximize' }).click()
  77  |     const boxMax = await finder.boundingBox()
  78  |     expect(boxMax!.x).toBe(0)
  79  |     expect(boxMax!.y).toBe(32)
  80  |     expect(boxMax!.width).toBeGreaterThan(boxBefore!.width)
  81  |     expect(boxMax!.height).toBeGreaterThan(boxBefore!.height)
  82  | 
  83  |     await finder.getByRole('button', { name: 'Maximize' }).click()
  84  |     const boxRestored = await finder.boundingBox()
  85  |     expect(boxRestored!.width).toBe(boxBefore!.width)
  86  |     expect(boxRestored!.height).toBe(boxBefore!.height)
  87  |     expect(boxRestored!.x).toBe(boxBefore!.x)
  88  |     expect(boxRestored!.y).toBe(boxBefore!.y)
  89  |   })
  90  | 
  91  |   test('minimizes and closes a window', async ({ page }) => {
  92  |     const finder = page.locator('[data-window-id="finder-1"]')
  93  |     await finder.getByRole('button', { name: 'Minimize' }).click()
> 94  |     await expect(finder).toBeHidden()
      |                          ^ Error: expect(locator).toBeHidden() failed
  95  | 
  96  |     const safari = page.locator('[data-window-id="safari-1"]')
  97  |     await safari.getByRole('button', { name: 'Close' }).click()
  98  |     await expect(safari).toBeHidden()
  99  | 
  100 |     const frames = page.locator('[data-testid="window-frame"]')
  101 |     await expect(frames).toHaveCount(0)
  102 |   })
  103 | })
  104 | 
```