# macOS Tahoe Web Shell

A browser recreation of the macOS Tahoe 26 desktop. Transparent Liquid Glass surfaces, a working menu bar and Dock, draggable windows, all five OS overlays, and 14 apps with representative content. Built with React 19, Vite 8, and TypeScript 6.

## Run

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

Other commands:

```bash
pnpm build        # type-check + production build (must exit 0)
pnpm lint         # oxlint (no ESLint)
pnpm test         # vitest (18 runtime tests)
```

Node 24 and pnpm 11 were used in development. The dev server binds port 5173; if a stale Vite process holds the port, kill it with `pkill -f vite` before restarting.

## What's here

### Shell

- **Transparent menu bar** — Apple logo, active-app name, per-app menus, live clock. Clicking a top-level item opens a glass dropdown; hovering a sibling switches menus. The Apple menu has About, System Settings, Sleep/Restart/Shut Down, and Lock Screen.
- **Liquid Glass Dock** — 14 app icons with cursor-proximity magnification (Framer Motion spring), plus Launchpad and Mission Control triggers at the left edge. Running apps show an indicator dot; the focused app's dot is accent-tinted.
- **Window manager** — drag by title bar, resize via edges/corners, minimize to Dock, maximize, close. Click-to-front updates z-order and the menu bar re-titles to the focused app. Drag clamps keep the title bar below the menu bar.
- **Theming** — light/dark mode, seven accent colors (blue, purple, pink, red, orange, green, graphite), and a Reduce Transparency toggle that flattens backdrop-filter effects. All three write to `<html>` data-attributes, which every glass surface reads via CSS variables.

### Five OS overlays

| Overlay | Trigger | Behavior |
|---|---|---|
| Spotlight | `⌘+Space` (or `Ctrl+Space`) / menu-bar magnifier | Filters apps + mock files; `Enter` launches the selected app; quick math (`2+2` → `4`) via a shunting-yard evaluator (no `eval`) |
| Control Center | menu-bar toggle | Dark Mode, Brightness (dims the screen), Volume, Wi-Fi/Bluetooth/AirDrop/Focus tiles, accent swatches, Reduce Transparency |
| Launchpad | Dock icon | Full-screen blurred grid of all 14 apps; search filters; click opens the app and exits |
| Mission Control | Dock icon | Window overview with a glass-pane descend animation (staggered Framer Motion spring); click a thumbnail to focus |
| Notification Center | menu-bar clock | Right-edge slide-in with a live clock widget, weather widget (5-day forecast), and a notifications list |

Only one overlay is open at a time — opening a second replaces the first, matching macOS.

### 14 apps

Each app opens in a window and gets default menus (File/Edit/View/Window/Help). Four are interactive in-session (changes persist until refresh; nothing is saved):

| App | Content |
|---|---|
| Finder | Sidebar (Favorites + Locations) and a file grid with emoji icons; toolbar with back/forward/view-toggle/breadcrumb |
| Safari | Tab bar, editable address bar, reload, start page with Favorites tiles and a Reading List sidebar |
| Notes | Note list + textarea editor; "+" creates a new note; edits persist in-session |
| Calculator | Working state machine (`+ − × ÷`, `C ± % =`); division by zero shows "Error"; no `eval` |
| Terminal | Prompt `user@mac ~ %`; commands `ls`, `pwd`, `echo`, `clear`, `help`; unknown commands print `command not found`; up/down arrow history |
| System Settings | Appearance (Dark Mode, Reduce Transparency), Accent Color (7 swatches), Wallpaper (6 gradients that set the desktop), Displays/Sound/Network placeholders |
| Mail | Inbox list + message view; clicking a message selects it and marks it read |
| Calendar | Month grid with colored event pills; prev/next arrows |
| Messages | Thread list + conversation bubbles; sending appends a message in-session |
| TextEdit | Rich-text contentEditable; toolbar with font size, bold/italic/underline, alignment |
| Music | Sidebar, song list, now-playing bar with play/pause, prev/next cycling, progress bar |
| Photos | Responsive grid of 12 gradient thumbnails with labels |
| Maps | Static CSS-gradient map with absolutely-positioned pins, search bar, zoom buttons |
| Clock | World Clock (live, with timezone offsets) and a Timer tab with start/pause/reset |

## Project layout

```
src/
  apps/         14 app components (default exports, { windowId? } prop)
  components/   menubar, dock, windows, glass, overlays, system, desktop
  lib/          context stores (theme, os, windows, overlays, system), menus, launch hook, data
  data/         mock data (finder, notes, terminal, productivity, media)
  styles/       theme.css (Liquid Glass CSS variables + accent palette)
  test/         vitest + testing-library runtime tests (18 tests)
```

`DOCK_APPS` in `src/lib/app-registry.ts` is the single source of truth for the app list — the Dock, Launchpad, Spotlight, and the `renderApp` switch in `App.tsx` all consume it. App manifests (name + menus) register at module load in `src/lib/app-registration.ts`.

## Scope limits

This is a static, front-end-only recreation. The limits below are deliberate, not gaps:

- **Liquid Glass is approximated.** Real macOS Tahoe uses Apple's proprietary material system. This project approximates it with CSS `backdrop-filter` (blur + saturate) over translucent layers and specular borders. Visual fidelity is close but not pixel-perfect.
- **Static mock data.** No persistence, no real network. Mail, Calendar, Messages, Photos, Maps, and Clock show canned content. Notes, Messages, and TextEdit accept input but lose it on refresh.
- **No real audio or hardware.** The Music player's play/pause is visual only. Brightness dims the screen via an overlay; Volume moves a slider. Wi-Fi/Bluetooth/AirDrop/Focus toggles flip state but control nothing.
- **Maps is a static gradient**, not a real map tile service.
- **Desktop-only.** Mouse and keyboard are the input model. Hover-switching between menus, drag-to-move, and edge-resize assume a pointer. Touch is not supported.
- **Power overlays are demos.** Sleep/Restart/Shut Down and Lock Screen show a dismissible full-screen overlay rather than shutting anything down.
- **Maximized windows can't be dragged or resized**, matching macOS fullscreen behavior.

## Testing

`pnpm test` runs 27 vitest tests across five files:

- `focus-menu-bar.test.tsx` — clicking a Dock icon re-titles the menu bar.
- `overlays.test.tsx` — each of the five overlays opens via its trigger and renders load-bearing content.
- `apps.test.tsx` — Calculator computes and handles division by zero; Terminal responds to `ls`/`pwd`/`echo`/`clear` and unknown commands; Notes accepts text and creates notes; TextEdit renders an editable surface.
- `system-settings.test.tsx` — Dark Mode, Reduce Transparency, Accent Color, and Wallpaper each write through to `<html>` attributes.
- `spotlight-math.test.ts` — the quick-math evaluator handles arithmetic, `×`/`÷` glyph aliases, operator precedence, parentheses, decimals, division-by-zero (returns null), and non-math input (returns null).

The tests use `data-testid` and `getByRole` queries because app names appear in the menu bar, window title, and content simultaneously, which breaks `getByText`.
