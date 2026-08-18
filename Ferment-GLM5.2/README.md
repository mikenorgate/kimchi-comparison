# macOS Tahoe Web Shell

A faithful web recreation of the macOS Tahoe 26 desktop shell, built with React 18 + TypeScript + Vite + Tailwind CSS. Features a transparent menu bar, frosted Liquid Glass Dock, Control Center, Spotlight, Mission Control, draggable/resizable windows, and 8 interactive built-in apps — all with in-memory session state.

## Quick Start

```bash
npm install
npm run dev      # Start dev server (http://localhost:5173)
npm run build     # Production build → dist/
npm run test      # Run Vitest (unit/component) + Playwright (e2e) tests
```

## Architecture

- **Shell**: `src/Desktop.tsx` composes the MenuBar, Dock, ControlCenter, Spotlight, MissionControl, and window layer. Wrapped in `ShellSettingsProvider` (appearance/wallpaper) and `WindowManagerProvider` (window state).
- **Liquid Glass**: Real CSS `backdrop-filter: blur(20px) saturate(180%)` via `.glass` / `.glass-dark` utilities in `src/index.css`. Applied to Dock, menu bar, menus, Control Center, Spotlight, Mission Control, and window frames.
- **Window Manager**: `src/WindowManager.tsx` — React context holding an array of `{id, appId, title, x, y, w, h, z, minimized}`. Supports open, close, focus, minimize, restore, move, resize.
- **App Registry**: `src/apps/registry.ts` — single source of truth for all 8 apps (id, name, icon, gradient, default window dimensions). Consumed by Dock, Spotlight, and WindowManager.
- **8 Apps**: Each in `src/apps/<name>/` with its own component + test:
  - **Finder** — mock filesystem tree with sidebar Locations, file grid, breadcrumb navigation
  - **Safari** — URL toolbar, back/forward/reload, iframe loading, blocklist fallback screen
  - **Notes** — two-pane layout, create/edit/delete notes with isolated state
  - **Calculator** — digit buttons, operators, equals, clear, decimal, keyboard support
  - **Calendar** — month grid, prev/next navigation, event creation popover, event pills
  - **Mail + Messages** — two-tab app: Mail (inbox + reading pane + compose) and Messages (conversation list + thread + send)
  - **Terminal** — toy shell responding to pwd/ls/cd/echo/clear/help/whoami/date against a mock filesystem
  - **System Settings** — Appearance (dark/light toggle), Wallpaper (6 gradients), Dock (magnification + icon size)

## In-Memory State — No Persistence

All application state is held in React `useState` and context providers. There is **no localStorage, IndexedDB, cookies, or backend**. Reloading the page resets everything to defaults:
- No windows open
- Dark mode on, Tahoe wallpaper selected
- Notes, Calendar events, Mail inbox/outbox, Terminal history, conversations all reset to their initial mock data
- Safari returns to the default URL (example.com)

## Testing

- **Vitest** (78 tests): Component and logic unit tests in `src/**/*.test.tsx`
- **Playwright** (36 tests): End-to-end browser tests in `e2e/*.spec.ts` covering window management, Spotlight, Mission Control, Dock, Safari, System Settings, Liquid Glass CSS assertions, and full app-launch integration

```bash
npm run test      # Runs both Vitest and Playwright
npx vitest run    # Vitest only
npx playwright test  # Playwright only
```

## Tech Stack

- React 18 + TypeScript
- Vite 8 (build tool + dev server)
- Tailwind CSS v4
- Vitest (unit/component testing)
- Playwright (end-to-end testing)
