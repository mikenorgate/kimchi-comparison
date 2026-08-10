# Tahoe Web Desktop Shell — Code Walkthrough

This document maps the acceptance demo flows to the source files and e2e tests that verify them.

## 1. Desktop shell

**What you see:** A full-screen desktop with a wallpaper, translucent menu bar, Dock, and context menu.

**Key files:**
- `src/components/shell/Desktop.tsx` — composes Wallpaper, MenuBar, Dock, Spotlight, ControlCenter, ContextMenu, and WindowManager.
- `src/components/shell/Wallpaper.tsx` — gradient background.
- `src/components/shell/MenuBar.tsx` — top bar with Apple icon, current-app menu, standard menus, Spotlight/Control Center triggers, clock.
- `src/components/shell/Dock.tsx` — horizontal Dock with app icons.
- `src/components/shell/ContextMenu.tsx` — right-click menu.

**Tests:** `e2e/dock.spec.ts` verifies the Dock renders and clicking Finder opens a window.

## 2. Liquid Glass styling

**What you see:** Frosted, translucent panels behind the Dock, windows, sidebars, and menus.

**Key files:**
- `src/components/ui/GlassPanel.tsx` — reusable glass panel using inline `backdropFilter` (default `blur(24px) saturate(180%)`, strong `blur(36px) saturate(200%)`).
- `src/components/ui/GlassButton.tsx`, `GlassSidebar.tsx`, `GlassToolbar.tsx`, `GlassPopover.tsx` — glass primitives.
- `src/index.css` — theme CSS variables and Tailwind v4 `@theme` tokens.

**Tests:** `e2e/system-settings.spec.ts` asserts `toHaveCSS('backdrop-filter', /blur/)` on a real glass panel.

## 3. Window manager

**What you see:** Multiple draggable/resizable windows with traffic-light buttons and z-order focus.

**Key files:**
- `src/components/window/windowStore.tsx` — reducer-based state (`OPEN`, `CLOSE`, `MINIMIZE`, `MAXIMIZE`, `RESTORE`, `FOCUS`, `MOVE`, `RESIZE`).
- `src/components/window/Window.tsx` — individual window frame with pointer handlers.
- `src/components/window/WindowManager.tsx` — renders all open windows from state.
- `src/components/window/WindowManagerContext.ts` / `useWindowManager.ts` — context/hook extracted for oxlint fast-refresh compliance.

**Tests:** `e2e/window-manager.spec.ts` covers focus/z-index, drag, resize, maximize/restore, minimize/close.

## 4. Dock and app registry

**What you see:** Dock icons for eight core apps. Clicking opens the corresponding app window.

**Key files:**
- `src/apps/registry.ts` — central `appRegistry` array plus `appRegistryById` map.
- `src/apps/types.ts` — `AppDefinition` type.
- `src/components/shell/Dock.tsx` — maps registry to Dock icons.

**Tests:** `e2e/dock.spec.ts` covers icon rendering and opening Finder.

## 5. Core apps

**What you see:** Mocked UIs for Finder, Safari, Notes, System Settings, Calendar, Photos, Phone, Journal.

**Key file:** `src/apps/components.tsx` — exports all eight app components with fake data.

**Tests:** Each app has a unit test (`src/apps/*.test.tsx`), and `e2e/system-settings.spec.ts` covers category switching and theme toggle.

## 6. Spotlight

**What you see:** Press `Cmd+Space` (or click the magnifying glass) to open a centered search overlay. Type to filter apps and actions, then press Enter or click a result.

**Key file:** `src/components/shell/Spotlight.tsx` — global keydown listener, app/action filtering, keyboard navigation, `handleSelect` opens a window for app results.

**Test:** `e2e/global-overlays.spec.ts` opens Spotlight with `Cmd+Space`, searches "notes", clicks the result, and asserts a Notes window appears.

## 7. Control Center

**What you see:** Click the menu-bar Control Center icon to open a glass panel with square toggles (Wi-Fi, Bluetooth, Airplane Mode, Focus), brightness/volume sliders, and a theme toggle.

**Key file:** `src/components/shell/ControlCenter.tsx` — toggle/slider state and theme integration.

**Test:** `e2e/global-overlays.spec.ts` opens Control Center and asserts the panel, toggles, and sliders are visible.

## 8. Menu-bar menus

**What you see:** The current app name opens a per-app menu; File/Edit/View/Go/Window/Help open generic mocked dropdowns.

**Key file:** `src/components/shell/MenuBar.tsx` — `MenuDropdown` component with click-outside + Escape close, per-app and generic menu arrays.

**Test:** `e2e/global-overlays.spec.ts` opens the app menu and File menu, asserting mocked items appear.

## 9. Build / lint / test surface

All verification is automated:
- `npm run build` — TypeScript + Vite production build.
- `npm run lint` — oxlint, currently 0 warnings/0 errors.
- `npm test` — 84 Vitest unit tests.
- `npm run test:e2e` — 15 Playwright tests.
