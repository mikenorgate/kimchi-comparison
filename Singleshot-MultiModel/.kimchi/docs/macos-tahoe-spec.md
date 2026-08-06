# macOS Tahoe Web App — Architecture & Build Spec

## Goal
Create a browser-based recreation of the macOS 26 Tahoe desktop interface using React + Vite + TypeScript. The deliverable is a fully interactive single-page application that looks and feels like macOS, with a working desktop shell, window manager, Dock, menu bar, and a representative set of bundled apps. All data is mock/sample data (nothing persists beyond the session).

## Constraints
- **Stack:** React 18+, Vite, TypeScript, CSS modules (no Tailwind, no heavy UI kit).
- **No backend:** all state is in-memory; data resets on reload.
- **Pixel-perfect visual match:** macOS window chrome, menus, animations, spacing, shadows, blur effects, and iconography should be immediately recognizable.
- **Accessibility:** keyboard shortcuts (Cmd+Tab, Cmd+Space, Cmd+W, Cmd+Q, Cmd+N, arrows), focus, and basic ARIA where feasible.
- **Browser support:** latest Chrome/Safari/Firefox, desktop only.

## Architecture

### State shape (Zustand store: `src/store/osStore.ts`)
```ts
interface OSState {
  activeAppId: string | null;
  apps: Record<string, AppDefinition>;
  windows: WindowInstance[];
  dockAppIds: string[];
  desktopIcons: DesktopIcon[];
  menuBar: MenuBarState;
  spotlightOpen: boolean;
  launchpadOpen: boolean;
  controlCenterOpen: boolean;
  wallpaper: string;
  appearance: 'light' | 'dark';
}

interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  payload?: unknown;
}

interface AppDefinition {
  id: string;
  name: string;
  icon: string; // emoji or SVG path
  category: 'system' | 'productivity' | 'media' | 'utilities';
  component: React.ComponentType<{ windowId: string }>;
  canOpenMultiple: boolean;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
}
```

### App contract
Every app is a React component registered in `src/apps/index.ts`. It receives `windowId` and reads/writes its window state via the store. Apps use shared UI primitives:
- `WindowChrome` — traffic lights, title bar, toolbar slots
- `Sidebar` — macOS-style source list
- `IconButton` — toolbar controls
- `MenuBarMenus` — per-app menu definitions

### Window manager
- Floating, resizable, draggable windows.
- Global z-index managed in store; focused window gets the top z-index.
- Drag via title bar; resize via 8 handles.
- Minimize animates down to the Dock; maximize fills the screen minus menu bar.
- Constraints: keep 40 px inside viewport; respect `minWidth`/`minHeight`.

### Desktop shell
- **Wallpaper:** full-screen background image with CSS `object-fit: cover`.
- **Menu bar:** 28 px fixed top bar with blur. Contains Apple menu, app-specific menus (File, Edit, View, etc.), status icons (Wi-Fi, battery, clock), and Control Center/Spotlight triggers.
- **Dock:** bottom-centered with magnification on hover, running indicators, bounce animation on launch.
- **Launchpad:** full-screen app grid with search, opened by Dock icon or pinch gesture fallback.
- **Spotlight:** centered search overlay (Cmd+Space).
- **Control Center:** dropdown from menu bar with toggles (Wi-Fi, Bluetooth, AirDrop, brightness, sound).

### Apps to build

#### Phase 1 — Shell (required foundation)
1. `src/main.tsx` / `src/App.tsx` — root render, global styles, store provider.
2. `src/store/osStore.ts` — Zustand store with actions.
3. `src/components/Desktop.tsx` — wallpaper + desktop icons.
4. `src/components/MenuBar.tsx` — menu bar shell + dynamic menus.
5. `src/components/Dock.tsx` — Dock + magnification.
6. `src/components/Launchpad.tsx` — app launcher overlay.
7. `src/components/Spotlight.tsx` — search overlay.
8. `src/components/ControlCenter.tsx` — system toggles overlay.
9. `src/components/WindowManager.tsx` + `Window.tsx` — window chrome + move/resize.
10. `src/apps/index.ts` — app registry.
11. Global styles in `src/styles/global.css`.

#### Phase 2 — Core apps
1. **Finder** (`src/apps/Finder.tsx`)
   - Sidebar: Favorites, Locations, Tags.
   - Toolbar: back/forward, view toggles (icon/list), search.
   - Main area: folder contents with mock file system.
   - Status bar, path bar.
   - Drag/drop to rearrange desktop icons and move files between folders.
2. **Safari** (`src/apps/Safari.tsx`)
   - Address bar with mock search suggestions.
   - Tabs (new/close/reorder).
   - Bookmarks bar.
   - Web view: `iframe` to a safe demo page or custom rendered page.
3. **Terminal** (`src/apps/Terminal.tsx`)
   - Scrollback buffer, prompt, command parser.
   - Commands: `help`, `ls`, `cd`, `pwd`, `clear`, `open`, `whoami`, `date`, `echo`.
4. **System Settings** (`src/apps/SystemSettings.tsx`)
   - Sidebar of preference panes.
   - Panes: Wi-Fi, Bluetooth, Appearance, Wallpaper, Sound, Battery.
5. **Notes** (`src/apps/Notes.tsx`)
   - Sidebar of notes, note editor, create/delete.
6. **Calculator** (`src/apps/Calculator.tsx`)
   - Standard calculator with full arithmetic and memory.

#### Phase 3 — Additional bundled apps
1. **Calendar** (`src/apps/Calendar.tsx`) — month view, events, create/delete.
2. **Mail** (`src/apps/Mail.tsx`) — inbox list, message reader, compose mock.
3. **Music** (`src/apps/Music.tsx`) — library, now playing, playback controls (mock).
4. **Photos** (`src/apps/Photos.tsx`) — grid of sample images, lightbox.
5. **Weather** (`src/apps/Weather.tsx`) — current + forecast for sample cities.
6. **Maps** (`src/apps/Maps.tsx`) — pannable/zoomable fake map with pins.
7. **Clock** (`src/apps/Clock.tsx`) — world clocks, alarm, timer, stopwatch.
8. **Stocks** (`src/apps/Stocks.tsx`) — watchlist with sparklines.
9. **TV / Podcasts** (`src/apps/TV.tsx`, `src/apps/Podcasts.tsx`) — media browser placeholders with working navigation.
10. **Reminders** (`src/apps/Reminders.tsx`) — lists and tasks.

## File Layout
```
public/
  wallpapers/
  sample-photos/
src/
  main.tsx
  App.tsx
  store/
    osStore.ts
  types/
    os.ts
  styles/
    global.css
    variables.css
  components/
    Desktop.tsx
    MenuBar.tsx
    Dock.tsx
    Launchpad.tsx
    Spotlight.tsx
    ControlCenter.tsx
    WindowManager.tsx
    Window.tsx
    ui/
      WindowChrome.tsx
      Sidebar.tsx
      Toolbar.tsx
      IconButton.tsx
      Menu.tsx
      ContextMenu.tsx
      Modal.tsx
  apps/
    index.ts
    Finder.tsx
    Safari.tsx
    Terminal.tsx
    SystemSettings.tsx
    Notes.tsx
    Calculator.tsx
    Calendar.tsx
    Mail.tsx
    Music.tsx
    Photos.tsx
    Weather.tsx
    Maps.tsx
    Clock.tsx
    Stocks.tsx
    TV.tsx
    Podcasts.tsx
    Reminders.tsx
  hooks/
    useShortcut.ts
    useWindow.ts
  utils/
    mockData.ts
    helpers.ts
```

## Build Plan / Chunks

### Chunk 1 — Project scaffold + global styles + types
**Files:** `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/global.css`, `src/styles/variables.css`, `src/types/os.ts`
**Goal:** Build a runnable Vite React TypeScript project with macOS-themed base styles and shared types.
**Complexity:** simple
**Accept when:** `npm run dev` starts without errors and the page shows a Tahoe-style wallpaper.

### Chunk 2 — OS store
**Files:** `src/store/osStore.ts`
**Goal:** Implement in-memory state and actions: open/close/focus/minimize/maximize windows, launch apps, Dock management, desktop icons, menu bar state, Spotlight/Launchpad toggles.
**Complexity:** complex (window ordering, app lifecycle, focus management)
**Accept when:** All actions have unit-style behavior covered via a small test harness in `src/store/osStore.test.ts` (or manual verification log).

### Chunk 3 — Desktop shell components
**Files:** `src/components/Desktop.tsx`, `src/components/MenuBar.tsx`, `src/components/Dock.tsx`, `src/components/Launchpad.tsx`, `src/components/Spotlight.tsx`, `src/components/ControlCenter.tsx`, `src/components/ui/*`
**Goal:** Build all shell UI pieces with animations and keyboard shortcuts.
**Complexity:** complex (multiple overlays, focus traps, shortcut handling)
**Accept when:** Desktop shows wallpaper, menu bar, Dock; Cmd+Space opens Spotlight; clicking Dock launches a placeholder app window; Launchpad opens and filters apps; Control Center toggles.

### Chunk 4 — Window manager
**Files:** `src/components/WindowManager.tsx`, `src/components/Window.tsx`, `src/components/WindowChrome.tsx`, `src/hooks/useWindow.ts`
**Goal:** Draggable, resizable, focusable, minimizable/maximizable windows.
**Complexity:** complex (mouse drag, resize handles, z-index, constraints)
**Accept when:** A window can be moved, resized, focused, minimized, maximized, and closed.

### Chunk 5 — Finder
**Files:** `src/apps/Finder.tsx`, `src/apps/index.ts` update, mock file system data
**Goal:** Full Finder with sidebar, toolbar, icon/list views, status bar, and drag/drop.
**Complexity:** complex (drag-and-drop, tree navigation, view modes)
**Accept when:** User can navigate folders, switch views, and drag files to the Trash or other folders.

### Chunk 6 — Core apps (Safari, Terminal, System Settings, Notes, Calculator)
**Files:** `src/apps/Safari.tsx`, `src/apps/Terminal.tsx`, `src/apps/SystemSettings.tsx`, `src/apps/Notes.tsx`, `src/apps/Calculator.tsx`, `src/apps/index.ts`
**Goal:** Implement each core app to functional, interactive level.
**Complexity:** simple to medium (each app isolated)
**Accept when:** Each app opens from Dock/Launchpad and its primary interactions work.

### Chunk 7 — Additional apps (Calendar, Mail, Music, Photos, Weather, Maps, Clock, Stocks, TV, Podcasts, Reminders)
**Files:** `src/apps/Calendar.tsx`, `src/apps/Mail.tsx`, `src/apps/Music.tsx`, `src/apps/Photos.tsx`, `src/apps/Weather.tsx`, `src/apps/Maps.tsx`, `src/apps/Clock.tsx`, `src/apps/Stocks.tsx`, `src/apps/TV.tsx`, `src/apps/Podcasts.tsx`, `src/apps/Reminders.tsx`, `src/apps/index.ts`
**Goal:** Build remaining bundled apps with sample data and working UI.
**Complexity:** simple
**Accept when:** Each app is launchable and demonstrates its main screen(s).

### Chunk 8 — Review, lint, polish
**Files:** all
**Goal:** Run lint, verify TypeScript, test interactions, polish visuals, add README.
**Complexity:** simple
**Accept when:** `npm run build` succeeds, no TypeScript errors, README documents how to run and extend.

## Visual Reference
- Menu bar: 28 px, `background: rgba(255,255,255,0.2)`, `backdrop-filter: blur(20px)`, 1 px bottom border.
- Windows: 12 px rounded corners, `box-shadow: 0 22px 70px rgba(0,0,0,0.35)`, title bar 52 px.
- Traffic lights: 12 px circles, red/yellow/green, spacing 8 px, left 16 px.
- Dock: 64 px tall, pill shape, centered bottom, `backdrop-filter: blur(20px)`, magnification 1.5x.
- Spotlight: 680 px wide, centered, rounded 12 px, dark translucent.
- Animations: 0.2–0.3 s ease-out for menus/overlays; bounce on app launch.

## Known Limitations
- No real file system or persistence.
- Safari web view uses an `iframe` to a safe demo page; cross-origin sites will not load.
- No actual networking, iCloud, or hardware integration.
- Some apps (Photos, Maps, Music) use generated/sample assets, not real content.

## Extension Pattern
To add a new app:
1. Create `src/apps/MyApp.tsx`.
2. Export a component that accepts `{ windowId: string }`.
3. Register it in `src/apps/index.ts` with name, icon, default size, and menu definitions.
4. Add to `dockAppIds` in the store if it should appear in the Dock.
