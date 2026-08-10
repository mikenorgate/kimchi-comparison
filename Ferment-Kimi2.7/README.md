# Tahoe Web Desktop Shell

A React-based, desktop-only web recreation of the macOS Tahoe interface. The app loads straight into a full-screen desktop with a translucent menu bar, Dock, window manager, Spotlight search, Control Center, and eight core app mockups rendered with Liquid Glass styling.

> **Important scope boundary:** Every app and menu in this project is a **visual/interactive mockup** that uses fake, in-memory data. There is no backend, no real file system, no real browser engine, and no persistence across page reloads. Finder, Safari, Notes, System Settings, Calendar, Photos, Phone, and Journal are clickable simulations only.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) with custom theme tokens
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for unit tests
- [Playwright](https://playwright.dev/) for end-to-end tests
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html) for linting

## What works

- **Desktop shell** — wallpaper, transparent menu bar, Dock, global right-click context menu
- **Liquid Glass** — CSS `backdrop-filter` blur/saturate + translucent backgrounds on windows, Dock, sidebars, and menus
- **Window manager** — open, close, minimize, maximize/restore, drag, resize, and z-index ordering for multiple windows
- **Dock** — app icons with hover tooltips and running indicators; clicking opens apps
- **Spotlight** — open with `Cmd+Space` or the menu-bar icon; search apps and common actions
- **Control Center** — menu-bar dropdown with mocked toggles (Wi-Fi, Bluetooth, Airplane Mode, Focus), brightness/volume sliders, and a dark/light theme toggle
- **Menu bar menus** — per-app menus (About, Preferences, Hide, Quit) and generic File/Edit/View/Go/Window/Help menus
- **Core apps** — Finder, Safari, Notes, System Settings, Calendar, Photos, Phone, Journal (all mocked)

## Out of scope

- Mobile/tablet responsiveness
- Real backend integrations or persistence
- Boot/login sequence
- Accessibility/screen-reader polish beyond basic ARIA roles

## Run locally

```bash
npm install
npm run dev          # development server
npm run build        # production build
npm run preview      # preview production build
npm test             # unit tests
npm run test:e2e     # e2e tests
npm run lint         # linting
```

## E2E acceptance flow mapping

| Demo step | e2e spec |
|-----------|----------|
| Desktop shell loads (menu bar, Dock, wallpaper) | `e2e/dock.spec.ts` |
| Finder/Safari open from Dock; Liquid Glass visible | `e2e/dock.spec.ts`, `e2e/system-settings.spec.ts` |
| Window manager: focus, drag, resize, maximize, minimize, close | `e2e/window-manager.spec.ts` |
| Spotlight opens via `Cmd+Space` and opens an app | `e2e/global-overlays.spec.ts` |
| Control Center opens from menu bar and shows toggles/sliders | `e2e/global-overlays.spec.ts` |
| Menu-bar app menus and standard menus render | `e2e/global-overlays.spec.ts` |

## Deployment

The production build is deployed to GitHub Pages from the `dist/` folder. See the repository Pages settings for the live URL.
