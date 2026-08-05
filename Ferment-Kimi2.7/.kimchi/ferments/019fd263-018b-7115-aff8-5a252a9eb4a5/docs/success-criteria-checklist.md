# macOS Tahoe Web Shell — Success Criteria Checklist

Verified on 2026-08-05.

| # | Criterion | Result | Verification Method |
|---|-----------|--------|---------------------|
| 1 | `npm run build` exits 0 with no errors | PASS | Ran `npm run build`; Vite reported "✓ built in 77ms" with no errors. |
| 2 | Core desktop shell renders on load: wallpaper, top Menu Bar, Dock, and window manager layer | PASS | `App.test.jsx` asserts `desktop`, `menu-bar`, and `dock` test IDs are present; `Window` renders for each open window. |
| 3 | Apps openable from Dock/Finder/Spotlight; windows draggable/resizable/minimizable/closable | PASS | `Dock.test.jsx`, `Finder.test.jsx`, `Spotlight.test.jsx`, `useWindowManager.test.jsx`, and `WindowFrame.test.jsx` cover open, focus, close, minimize, drag, and resize handlers. |
| 4 | Menu Bar context-aware with File/Edit/View/Window menus | PASS | `MenuBar.test.jsx` verifies app name and menu labels update when the active window changes. |
| 5 | Spotlight via Cmd+Space filters built-in list and launching opens window | PASS | `Spotlight.test.jsx` tests filtering and item selection; `useSpotlightShortcut.test.jsx` tests Cmd+Space toggle. |
| 6 | Control Center toggles Wi-Fi/Bluetooth/brightness/volume/DND with visible state | PASS | `ControlCenter.test.jsx` verifies each toggle updates its state and UI label. |
| 7 | Finder sidebar + main content; double-click opens stub folders/apps | PASS | `Finder.test.jsx` verifies sidebar places and double-click opening. |
| 8 | Calculator performs +, −, ×, ÷ | PASS | `Calculator.test.jsx` 8 tests including all four operations. |
| 9 | Notes create/select/edit in split two-pane layout | PASS | `Notes.test.jsx` 5 tests covering render, selection, editing, and creation. |
| 10 | Calendar month grid with navigation and current date highlight | PASS | `Calendar.test.jsx` 7 tests covering grid, today highlight, and month navigation. |
| 11 | Clock live current time + world-clock city list | PASS | `Clock.test.jsx` verifies live ticking and world-city rows. |
| 12 | Safari shell address bar + tabs + mocked content | PASS | `Safari.test.jsx` 6 tests covering navigation, tabs, and mocked pages. |
| 13 | macOS Tahoe visual: translucent panels, rounded corners, layered shadows, smooth animations | PASS | `src/styles/transparency.css` uses `backdrop-filter` and material classes; `src/styles/animations.css` defines keyframes and transition utilities; `src/components/VisualStyle.test.jsx` asserts blur/shadow/radius and class application. |
| 14 | Browser E2E smoke: shell, Dock launch, Spotlight launch, Control Center toggle, window minimize/close | PASS | `npm run test:e2e` runs 5 Playwright tests in Chromium, all passing. |
| 15 | Client-side input security: no `eval` in Calculator, Safari rejects `javascript:`/`data:` URLs, Notes uses text content only | PASS | `src/apps/security.test.js` verifies safe arithmetic, URL normalization, and absence of `eval`. |

## Commands Run

```bash
npm run test    # 22 test files passed, 94 tests passed
npm run build   # exited 0, dist/ generated
npm run lint    # 0 warnings, 0 errors
npm run test:e2e # 5 E2E tests passed
```
