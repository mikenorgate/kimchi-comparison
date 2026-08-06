# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: window-manager.spec.ts >> Window manager >> dragging the titlebar moves the window
- Location: e2e/window-manager.spec.ts:49:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('dock-icon-test')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - paragraph [ref=e5]: macOS Tahoe Desktop
    - heading "Same prompt. Different agents." [level=1] [ref=e6]: Same prompt.Different agents.
    - paragraph [ref=e7]: 12 implementations of the same macOS Tahoe web desktop, compared by agent, time, and approach.
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: "12"
        - generic [ref=e11]: implementations
      - generic [ref=e12]:
        - generic [ref=e13]: "3"
        - generic [ref=e14]: agents
      - generic [ref=e15]:
        - generic [ref=e16]: "8"
        - generic [ref=e17]: models
  - generic [ref=e19]:
    - generic [ref=e20]: The Prompt
    - blockquote [ref=e21]: Recreate the whole MacOs tahoe interface as a web app. Every app and menu should be working
  - generic [ref=e23]:
    - generic [ref=e24]:
      - heading "Kimchi" [level=2] [ref=e25]
      - generic [ref=e26]:
        - heading "Kimi K2.7" [level=3] [ref=e27]
        - generic [ref=e28]:
          - article [ref=e29]:
            - generic [ref=e30]:
              - generic [ref=e31]: Kimchi
              - generic [ref=e32]: ferment
              - generic [ref=e33]: enabled
            - heading "ferment — Kimi K2.7" [level=3] [ref=e34]
            - paragraph [ref=e35]: Core desktop shell
            - generic [ref=e36]:
              - generic [ref=e37]:
                - generic [ref=e38]: Model
                - generic [ref=e39]: Kimi K2.7
              - generic [ref=e40]:
                - generic [ref=e41]: Time
                - generic [ref=e42]: 46m
              - generic [ref=e43]:
                - generic [ref=e44]: Cost
                - generic [ref=e45]: $3.33
            - generic [ref=e46]:
              - link "Session details" [ref=e47] [cursor=pointer]:
                - /url: "#/example/ferment-kimi2-7"
              - link "Open app →" [ref=e48] [cursor=pointer]:
                - /url: /ferment-kimi2-7/index.html
          - article [ref=e49]:
            - generic [ref=e50]:
              - generic [ref=e51]: Kimchi
              - generic [ref=e52]: ferment
              - generic [ref=e53]: enabled
            - heading "ferment — Kimi K2.7" [level=3] [ref=e54]
            - paragraph [ref=e55]: Full desktop + bundled apps
            - generic [ref=e56]:
              - generic [ref=e57]:
                - generic [ref=e58]: Model
                - generic [ref=e59]: Kimi K2.7
              - generic [ref=e60]:
                - generic [ref=e61]: Time
                - generic [ref=e62]: 2h 30m
              - generic [ref=e63]:
                - generic [ref=e64]: Cost
                - generic [ref=e65]: $11.20
            - generic [ref=e66]:
              - link "Session details" [ref=e67] [cursor=pointer]:
                - /url: "#/example/ferment-full-kimi2-7"
              - link "Open app →" [ref=e68] [cursor=pointer]:
                - /url: /ferment-full-kimi2-7/index.html
          - article [ref=e69]:
            - generic [ref=e70]:
              - generic [ref=e71]: Kimchi
              - generic [ref=e72]: oneshot
              - generic [ref=e73]: enabled
            - heading "oneshot — Kimi K2.7" [level=3] [ref=e74]
            - paragraph [ref=e75]: Single-page build
            - generic [ref=e76]:
              - generic [ref=e77]:
                - generic [ref=e78]: Model
                - generic [ref=e79]: Kimi K2.7
              - generic [ref=e80]:
                - generic [ref=e81]: Time
                - generic [ref=e82]: 21m
              - generic [ref=e83]:
                - generic [ref=e84]: Cost
                - generic [ref=e85]: $2.21
            - generic [ref=e86]:
              - link "Session details" [ref=e87] [cursor=pointer]:
                - /url: "#/example/singleshot-kimi2-7"
              - link "Open app →" [ref=e88] [cursor=pointer]:
                - /url: /singleshot-kimi2-7/index.html
      - generic [ref=e89]:
        - heading "GLM 5.2" [level=3] [ref=e90]
        - generic [ref=e91]:
          - article [ref=e92]:
            - generic [ref=e93]:
              - generic [ref=e94]: Kimchi
              - generic [ref=e95]: oneshot
              - generic [ref=e96]: max
            - heading "oneshot — GLM 5.2" [level=3] [ref=e97]
            - paragraph [ref=e98]: Self-contained HTML/CSS/JS desktop
            - generic [ref=e99]:
              - generic [ref=e100]:
                - generic [ref=e101]: Model
                - generic [ref=e102]: GLM 5.2
              - generic [ref=e103]:
                - generic [ref=e104]: Time
                - generic [ref=e105]: 28m
              - generic [ref=e106]:
                - generic [ref=e107]: Cost
                - generic [ref=e108]: $1.64
            - generic [ref=e109]:
              - link "Session details" [ref=e110] [cursor=pointer]:
                - /url: "#/example/singleshot-glm5-2-max"
              - link "Open app →" [ref=e111] [cursor=pointer]:
                - /url: /singleshot-glm5-2-max/index.html
          - article [ref=e112]:
            - generic [ref=e113]:
              - generic [ref=e114]: Kimchi
              - generic [ref=e115]: oneshot
              - generic [ref=e116]: medium
            - heading "oneshot — GLM 5.2" [level=3] [ref=e117]
            - paragraph [ref=e118]: Self-contained HTML/CSS/JS desktop
            - generic [ref=e119]:
              - generic [ref=e120]:
                - generic [ref=e121]: Model
                - generic [ref=e122]: GLM 5.2
              - generic [ref=e123]:
                - generic [ref=e124]: Time
                - generic [ref=e125]: 14m
              - generic [ref=e126]:
                - generic [ref=e127]: Cost
                - generic [ref=e128]: $5.38
            - generic [ref=e129]:
              - link "Session details" [ref=e130] [cursor=pointer]:
                - /url: "#/example/singleshot-glm5-2"
              - link "Open app →" [ref=e131] [cursor=pointer]:
                - /url: /singleshot-glm5-2/index.html
      - generic [ref=e132]:
        - heading "Multi-model" [level=3] [ref=e133]
        - article [ref=e135]:
          - generic [ref=e136]:
            - generic [ref=e137]: Kimchi
            - generic [ref=e138]: oneshot
            - generic [ref=e139]: enabled
          - heading "oneshot — Multi-model" [level=3] [ref=e140]
          - paragraph [ref=e141]: Full desktop built with multi-model orchestration (Kimi K2.7 orchestrator + MiniMax M3 subagents)
          - generic [ref=e142]:
            - generic [ref=e143]:
              - generic [ref=e144]: Model
              - generic [ref=e145]: Multi-model
            - generic [ref=e146]:
              - generic [ref=e147]: Time
              - generic [ref=e148]: 41m
            - generic [ref=e149]:
              - generic [ref=e150]: Cost
              - generic [ref=e151]: $2.09
          - generic [ref=e152]:
            - link "Session details" [ref=e153] [cursor=pointer]:
              - /url: "#/example/singleshot-multimodel"
            - link "Open app →" [ref=e154] [cursor=pointer]:
              - /url: /singleshot-multimodel/index.html
    - generic [ref=e155]:
      - heading "Other agents" [level=2] [ref=e156]
      - generic [ref=e157]:
        - heading "GPT-5.6 Sol" [level=3] [ref=e158]
        - generic [ref=e159]:
          - article [ref=e160]:
            - generic [ref=e161]:
              - generic [ref=e162]: Other
              - generic [ref=e163]: oneshot
              - generic [ref=e164]: xhigh
            - heading "oneshot — GPT-5.6 Sol" [level=3] [ref=e165]
            - paragraph [ref=e166]: Self-contained HTML/CSS/JS desktop
            - generic [ref=e167]:
              - generic [ref=e168]:
                - generic [ref=e169]: Model
                - generic [ref=e170]: GPT-5.6 Sol
              - generic [ref=e171]:
                - generic [ref=e172]: Time
                - generic [ref=e173]: 6m
              - generic [ref=e174]:
                - generic [ref=e175]: Cost
                - generic [ref=e176]: $2.92
            - generic [ref=e177]:
              - link "Session details" [ref=e178] [cursor=pointer]:
                - /url: "#/example/codex-gpt5-6-sol-xhigh"
              - link "Open app →" [ref=e179] [cursor=pointer]:
                - /url: /codex-gpt5-6-sol-xhigh/index.html
          - article [ref=e180]:
            - generic [ref=e181]:
              - generic [ref=e182]: Other
              - generic [ref=e183]: oneshot
              - generic [ref=e184]: default
            - heading "oneshot — GPT-5.6 Sol" [level=3] [ref=e185]
            - paragraph [ref=e186]: Self-contained HTML/CSS/JS desktop
            - generic [ref=e187]:
              - generic [ref=e188]:
                - generic [ref=e189]: Model
                - generic [ref=e190]: GPT-5.6 Sol
              - generic [ref=e191]:
                - generic [ref=e192]: Time
                - generic [ref=e193]: 2m
              - generic [ref=e194]:
                - generic [ref=e195]: Cost
                - generic [ref=e196]: $1.02
            - generic [ref=e197]:
              - link "Session details" [ref=e198] [cursor=pointer]:
                - /url: "#/example/codex-gpt5-6-sol"
              - link "Open app →" [ref=e199] [cursor=pointer]:
                - /url: /codex-gpt5-6-sol/index.html
      - generic [ref=e200]:
        - heading "Fable 5" [level=3] [ref=e201]
        - article [ref=e203]:
          - generic [ref=e204]:
            - generic [ref=e205]: Claude
            - generic [ref=e206]: /goal
            - generic [ref=e207]: enabled
          - heading "/goal — Fable 5" [level=3] [ref=e208]
          - paragraph [ref=e209]: Static build
          - generic [ref=e210]:
            - generic [ref=e211]:
              - generic [ref=e212]: Model
              - generic [ref=e213]: Fable 5
            - generic [ref=e214]:
              - generic [ref=e215]: Time
              - generic [ref=e216]: 19m
            - generic [ref=e217]:
              - generic [ref=e218]: Cost
              - generic [ref=e219]: $8.79
          - generic [ref=e220]:
            - link "Session details" [ref=e221] [cursor=pointer]:
              - /url: "#/example/ccgoal-fable"
            - link "Open app →" [ref=e222] [cursor=pointer]:
              - /url: /ccgoal-fable/index.html
      - generic [ref=e223]:
        - heading "GPT-5.5" [level=3] [ref=e224]
        - article [ref=e226]:
          - generic [ref=e227]:
            - generic [ref=e228]: Other
            - generic [ref=e229]: oneshot
            - generic [ref=e230]: default
          - heading "oneshot — GPT-5.5" [level=3] [ref=e231]
          - paragraph [ref=e232]: Self-contained HTML/CSS/JS desktop
          - generic [ref=e233]:
            - generic [ref=e234]:
              - generic [ref=e235]: Model
              - generic [ref=e236]: GPT-5.5
            - generic [ref=e237]:
              - generic [ref=e238]: Time
              - generic [ref=e239]: 6m
            - generic [ref=e240]:
              - generic [ref=e241]: Cost
              - generic [ref=e242]: $1.15
          - generic [ref=e243]:
            - link "Session details" [ref=e244] [cursor=pointer]:
              - /url: "#/example/codex-gpt5-5"
            - link "Open app →" [ref=e245] [cursor=pointer]:
              - /url: /codex-gpt5-5/index.html
      - generic [ref=e246]:
        - heading "GPT-5.6 Luna" [level=3] [ref=e247]
        - article [ref=e249]:
          - generic [ref=e250]:
            - generic [ref=e251]: Other
            - generic [ref=e252]: oneshot
            - generic [ref=e253]: default
          - heading "oneshot — GPT-5.6 Luna" [level=3] [ref=e254]
          - paragraph [ref=e255]: Self-contained HTML/CSS/JS desktop
          - generic [ref=e256]:
            - generic [ref=e257]:
              - generic [ref=e258]: Model
              - generic [ref=e259]: GPT-5.6 Luna
            - generic [ref=e260]:
              - generic [ref=e261]: Time
              - generic [ref=e262]: 1h 38m
            - generic [ref=e263]:
              - generic [ref=e264]: Cost
              - generic [ref=e265]: $0.04
          - generic [ref=e266]:
            - link "Session details" [ref=e267] [cursor=pointer]:
              - /url: "#/example/codex-gpt5-6-luna"
            - link "Open app →" [ref=e268] [cursor=pointer]:
              - /url: /codex-gpt5-6-luna/index.html
      - generic [ref=e269]:
        - heading "Claude Sonnet 5" [level=3] [ref=e270]
        - article [ref=e272]:
          - generic [ref=e273]:
            - generic [ref=e274]: Claude
            - generic [ref=e275]: oneshot
            - generic [ref=e276]: enabled
          - heading "oneshot — Claude Sonnet 5" [level=3] [ref=e277]
          - paragraph [ref=e278]: React + Vite + TypeScript desktop with Zustand state
          - generic [ref=e279]:
            - generic [ref=e280]:
              - generic [ref=e281]: Model
              - generic [ref=e282]: Claude Sonnet 5
            - generic [ref=e283]:
              - generic [ref=e284]: Time
              - generic [ref=e285]: 22m
            - generic [ref=e286]:
              - generic [ref=e287]: Cost
              - generic [ref=e288]: $13.17
          - generic [ref=e289]:
            - link "Session details" [ref=e290] [cursor=pointer]:
              - /url: "#/example/cc-sonnet5"
            - link "Open app →" [ref=e291] [cursor=pointer]:
              - /url: /cc-sonnet5/index.html
  - paragraph [ref=e293]: Auto-generated from agent session metadata.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | /**
  4   |  * Window manager e2e — step 3 acceptance: windows open from the Dock, drag,
  5   |  * resize, minimize-to-Dock, close, with correct focus/z-order.
  6   |  */
  7   | test.describe('Window manager', () => {
  8   |   test('opens a window from the Dock', async ({ page }) => {
  9   |     await page.goto('/')
  10  |     await page.getByTestId('dock-icon-test').click()
  11  |     await expect(page.getByTestId('window')).toBeVisible()
  12  |     await expect(page.getByTestId('window-chrome')).toBeVisible()
  13  |     await expect(page.getByTestId('test-app-content')).toBeVisible()
  14  |   })
  15  | 
  16  |   test('close button removes the window', async ({ page }) => {
  17  |     await page.goto('/')
  18  |     await page.getByTestId('dock-icon-test').click()
  19  |     const win = page.getByTestId('window')
  20  |     await expect(win).toBeVisible()
  21  |     await page.getByTestId('traffic-close').click()
  22  |     await expect(win).toHaveCount(0)
  23  |   })
  24  | 
  25  |   test('minimize hides the window', async ({ page }) => {
  26  |     await page.goto('/')
  27  |     await page.getByTestId('dock-icon-test').click()
  28  |     const win = page.getByTestId('window')
  29  |     await expect(win).toBeVisible()
  30  |     await page.getByTestId('traffic-minimize').click()
  31  |     await expect(win).toHaveCount(0)
  32  |   })
  33  | 
  34  |   test('zoom toggles the window to fill the screen and back', async ({ page }) => {
  35  |     await page.goto('/')
  36  |     await page.getByTestId('dock-icon-test').click()
  37  |     const win = page.getByTestId('window')
  38  |     const before = await win.evaluate((el) => el.getBoundingClientRect().width)
  39  |     await page.getByTestId('traffic-maximize').click()
  40  |     await expect(win).toHaveAttribute('data-maximized', 'true')
  41  |     const zoomed = await win.evaluate((el) => el.getBoundingClientRect().width)
  42  |     expect(zoomed).toBeGreaterThan(before + 400)
  43  |     await page.getByTestId('traffic-maximize').click()
  44  |     await expect(win).toHaveAttribute('data-maximized', 'false')
  45  |     const restored = await win.evaluate((el) => el.getBoundingClientRect().width)
  46  |     expect(Math.abs(restored - before)).toBeLessThan(5)
  47  |   })
  48  | 
  49  |   test('dragging the titlebar moves the window', async ({ page }) => {
  50  |     await page.goto('/')
> 51  |     await page.getByTestId('dock-icon-test').click()
      |                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
  52  |     const chrome = page.getByTestId('window-chrome')
  53  |     const box = await chrome.boundingBox()
  54  |     expect(box).not.toBeNull()
  55  |     const cx = box!.x + box!.width / 2
  56  |     const cy = box!.y + box!.height / 2
  57  |     const before = await page
  58  |       .getByTestId('window')
  59  |       .evaluate((el) => {
  60  |         const r = el.getBoundingClientRect()
  61  |         return { x: r.x, y: r.y }
  62  |       })
  63  |     await page.mouse.move(cx, cy)
  64  |     await page.mouse.down()
  65  |     await page.mouse.move(cx + 100, cy + 60, { steps: 10 })
  66  |     await page.mouse.up()
  67  |     const after = await page
  68  |       .getByTestId('window')
  69  |       .evaluate((el) => {
  70  |         const r = el.getBoundingClientRect()
  71  |         return { x: r.x, y: r.y }
  72  |       })
  73  |     expect(after.x - before.x).toBeGreaterThan(50)
  74  |     expect(after.y - before.y).toBeGreaterThan(20)
  75  |   })
  76  | 
  77  |   test('resizing via the SE handle grows the window', async ({ page }) => {
  78  |     await page.goto('/')
  79  |     await page.getByTestId('dock-icon-test').click()
  80  |     const handle = page.getByTestId('resize-se')
  81  |     const box = await handle.boundingBox()
  82  |     expect(box).not.toBeNull()
  83  |     const before = await page
  84  |       .getByTestId('window')
  85  |       .evaluate((el) => {
  86  |         const r = el.getBoundingClientRect()
  87  |         return { w: r.width, h: r.height }
  88  |       })
  89  |     await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  90  |     await page.mouse.down()
  91  |     await page.mouse.move(box!.x + 120, box!.y + 80, { steps: 10 })
  92  |     await page.mouse.up()
  93  |     await page.waitForTimeout(50)
  94  |     const after = await page
  95  |       .getByTestId('window')
  96  |       .evaluate((el) => {
  97  |         const r = el.getBoundingClientRect()
  98  |         return { w: r.width, h: r.height }
  99  |       })
  100 |     expect(after.w - before.w).toBeGreaterThan(50)
  101 |     expect(after.h - before.h).toBeGreaterThan(30)
  102 |   })
  103 | 
  104 |   test('clicking a background window focuses it and raises z-order', async ({ page }) => {
  105 |     await page.goto('/')
  106 |     await page.getByTestId('dock-icon-test').click()
  107 |     await page.getByTestId('dock-icon-test').click()
  108 |     const wins = page.getByTestId('window')
  109 |     await expect(wins).toHaveCount(2)
  110 | 
  111 |     // The second window (nth 1) is focused & on top. Drag it down to fully
  112 |     // expose the first window.
  113 |     const chrome2 = wins.nth(1).getByTestId('window-chrome')
  114 |     const b2 = await chrome2.boundingBox()
  115 |     expect(b2).not.toBeNull()
  116 |     const cx = b2!.x + b2!.width / 2
  117 |     const cy = b2!.y + b2!.height / 2
  118 |     await page.mouse.move(cx, cy)
  119 |     await page.mouse.down()
  120 |     await page.mouse.move(cx, cy + 450, { steps: 12 })
  121 |     await page.mouse.up()
  122 | 
  123 |     const win1 = wins.nth(0)
  124 |     const zBefore = parseInt(
  125 |       await win1.evaluate((el) => getComputedStyle(el).zIndex),
  126 |       10,
  127 |     )
  128 |     await win1.getByTestId('window-content').click()
  129 |     const zAfter = parseInt(
  130 |       await win1.evaluate((el) => getComputedStyle(el).zIndex),
  131 |       10,
  132 |     )
  133 |     const zWin2 = parseInt(
  134 |       await wins.nth(1).evaluate((el) => getComputedStyle(el).zIndex),
  135 |       10,
  136 |     )
  137 |     expect(zAfter).toBeGreaterThan(zBefore)
  138 |     expect(zAfter).toBeGreaterThan(zWin2)
  139 |   })
  140 | })
  141 | 
```