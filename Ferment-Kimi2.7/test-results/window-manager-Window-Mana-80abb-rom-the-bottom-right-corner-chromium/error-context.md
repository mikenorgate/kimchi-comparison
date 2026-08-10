# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: window-manager.spec.ts >> Window Manager >> resizes a window from the bottom-right corner
- Location: e2e/window-manager.spec.ts:56:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.dragTo: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-window-id="finder-1"]').locator('.cursor-nwse-resize')
    - locator resolved to <div class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"></div>
  - attempting move and down action
    2 × waiting for element to be visible and stable
      - element is visible and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="w-full h-full"></div> from <div role="dialog" aria-modal="false" aria-label="Safari" data-window-id="safari-1" data-testid="window-frame" class="absolute flex flex-col overflow-hidden rounded-tahoe transition-shadow duration-150">…</div> subtree intercepts pointer events
    - retrying move and down action
    - waiting 20ms
    2 × waiting for element to be visible and stable
      - element is visible and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="w-full h-full"></div> from <div role="dialog" aria-modal="false" aria-label="Safari" data-window-id="safari-1" data-testid="window-frame" class="absolute flex flex-col overflow-hidden rounded-tahoe transition-shadow duration-150">…</div> subtree intercepts pointer events
    - retrying move and down action
      - waiting 100ms
    57 × waiting for element to be visible and stable
       - element is visible and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="w-full h-full"></div> from <div role="dialog" aria-modal="false" aria-label="Safari" data-window-id="safari-1" data-testid="window-frame" class="absolute flex flex-col overflow-hidden rounded-tahoe transition-shadow duration-150">…</div> subtree intercepts pointer events
     - retrying move and down action
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
      - generic [ref=e24]: Mon, Aug 10 3:06 PM
  - generic [ref=e25]:
    - dialog "Finder" [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]:
          - button "Close" [ref=e29]
          - button "Minimize" [ref=e30]
          - button "Maximize" [ref=e31]
        - generic: Finder
    - dialog "Safari" [ref=e35]:
      - generic [ref=e36]:
        - generic [ref=e37]:
          - button "Close" [ref=e38]
          - button "Minimize" [ref=e39]
          - button "Maximize" [ref=e40]
        - generic: Safari
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
> 62  |     await handle.dragTo(handle, {
      |                  ^ Error: locator.dragTo: Test timeout of 30000ms exceeded.
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
  94  |     await expect(finder).toBeHidden()
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