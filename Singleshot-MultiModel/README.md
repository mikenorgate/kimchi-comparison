# macOS Tahoe Web-App Prototype

A high-fidelity, interactive prototype of a macOS-style desktop environment
running entirely in the browser. Built with React 19 + Vite 6 + TypeScript 5 +
Tailwind CSS 4 + Zustand 5.

## Quick start

```bash
npm install
npm run dev      # start the dev server (Vite, default http://localhost:5173)
npm run build    # type-check + production build into dist/
npm run preview  # serve the built bundle locally
npm run test     # run the Vitest suite once (CI mode)
npm run test:watch  # run Vitest in watch mode
```

## Implemented features

- **Desktop** — wallpapers, draggable desktop icons, right-click context menu
  (Change Background, New Folder, per-wallpaper pick, System Settings).
- **Global menu bar** — Apple menu, active-app menus, status icons, live clock.
  Menu items dispatch real actions (Close / Minimize / Zoom) and the active
  app's menus (Terminal Shell etc.) are wired to live behaviour.
- **Dock** — pinned apps, running indicators, bounce animation, magnification
  with mouse-distance falloff, click to launch or focus.
- **Window manager** — title bar with traffic lights, drag-to-move, eight-edge
  resize handles (clamped to min size), minimize-to-dock, maximize with
  previous-bounds restore, focus-to-front with z-index tracking.
- **Finder** — sidebar favourites, back/forward history, breadcrumb toolbar,
  new folder/file, rename, delete, double-click to navigate or launch, icon
  and list views, `.app` launch, `.txt` preview, right-click context menus.
- **Calculator** — standard numeric pad, keyboard support, chained
  left-to-right evaluation, memory + history persisted to localStorage.
- **Notes** — sidebar list, create/delete, live title from first line,
  persisted to localStorage.
- **Terminal** — `help`, `ls`, `cd`, `pwd`, `cat`, `mkdir`, `touch`, `clear`;
  history navigation via Up/Down; working directory tracked in the app data
  store.
- **Safari** — address bar with sandboxed iframe, Back/Forward/Reload
  buttons, default welcome page, recent-URLs list.
- **System Settings** — appearance, accent colour, computer name, wallpaper
  picker, dock size / magnification / position; "Reset to Defaults" wipes
  persisted keys and reloads.
- **Persistence** — `useSystemStore`, `useFileSystemStore`, `useDockStore`,
  and `useAppDataStore` are wired to localStorage via Zustand's `persist`
  middleware (separate keys: `tahoe.system`, `tahoe.filesystem`,
  `tahoe.dock`, `tahoe.appdata`). Windows reopen to defaults on refresh.

## Chunk 8 additions

- **Global keyboard shortcuts** — `Cmd+W` close, `Cmd+M` minimize,
  `Cmd+N` new window of the active app, `Cmd+Option+Esc` Force Quit,
  `Escape` dismiss open menus / context menus / dialogs. Ctrl-prefixed
  equivalents on non-Mac platforms. Shortcuts are skipped while focus is in
  an editable element.
- **Force Quit dialog** — lists every open window and provides a one-click
  Force Quit action; closes on Escape, backdrop click, or Cancel.
- **Menu-bar default actions** — universal items (Close Window, Minimize,
  Zoom) are wired to the window store; Terminal's Shell menu dispatches real
  `terminal:menu-action` events.
- **Menu keyboard navigation** — ArrowUp/ArrowDown move focus, Home/End jump
  to the ends, Enter/Space activate, Escape dismisses.
- **Context menu Escape + outside click** — already supported by the shared
  `ContextMenu` component; also responds to the global `app:close-menus`
  event so a single Escape tears down any open menu surface.
- **README** — this document.

## Project layout

```
src/
  apps/            Finder, Calculator, Notes, Terminal, Safari, Settings
  components/      Desktop, MenuBar, Dock, Window, TitleBar, ResizeHandle,
                   ContextMenu, Menu, AppleMenu, StatusMenu, Clock,
                   WindowManager, DockItem, ForceQuitDialog
  hooks/           useDrag, useResize, useKeyboardShortcuts, useContextMenu
  lib/             apps (registry), initialFs, keyboard, terminalCommands,
                   wallpapers
  stores/          systemStore, fileSystemStore, windowStore, dockStore,
                   appDataStore
  types/           shared TS types
  __tests__/       Vitest + React Testing Library test suites
```

## Testing

`npm run test` runs the full suite in jsdom. Each chunk adds at least one
test file; the integration suite (`integration.test.tsx`) covers the
end-to-end flow including global keyboard shortcuts and the Force Quit
dialog.

## Notes & limitations

- The prototype targets desktop viewports (1280×800+); smaller windows may
  degrade gracefully but are not the focus.
- Safari is intentionally a mock (sandboxed iframe) — true web browsing is
  out of scope.
- No backend; everything runs in the browser with localStorage persistence.
- This is a UI prototype; accessibility is best-effort, not WCAG-complete.
