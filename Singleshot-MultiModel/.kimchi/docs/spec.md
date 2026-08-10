# macOS Tahoe Web-App Prototype — Specification

## Goal
Build a high-fidelity, interactive web-app prototype of a macOS-style desktop environment ("Tahoe") using React + Vite + TypeScript + Tailwind CSS. The prototype must include:

1. Desktop with wallpaper, icons, and right-click context menu.
2. Global menu bar that updates based on the active app.
3. Dock with app launch, running indicators, bounce animation, and magnification.
4. Window manager supporting open/close/minimize/maximize/drag/resize/z-order.
5. Finder app with folders, files, list/icon view, and sidebar.
6. Bundled mini-apps: Calculator, Notes, Terminal, Safari, Settings.
7. Persistence via `localStorage` so files, notes, and settings survive refresh.

## Constraints
- **Stack**: React 19, Vite 6, TypeScript 5.7, Tailwind CSS 4, Zustand 5, lucide-react.
- **No backend**: everything runs in the browser.
- **No new unsafe dependencies**: only well-known, maintained libraries.
- **Tests**: Vitest + React Testing Library + `jsdom`; at least one test per chunk.
- **Responsive-ish**: primary target is desktop viewport (1280×800+); layout may degrade gracefully on smaller screens.
- **Accessibility**: keyboard navigation for menus and windows where practical, though full a11y compliance is out of scope for this MVP.

## Architecture

### State stores (Zustand)
All global state lives in typed Zustand stores. Stores may import each other for actions but should not create circular dependencies.

1. **`useSystemStore`** — wallpaper, appearance (light/dark/auto), accent color, computer name, volume, date/time, booted flag. `accentColor`, `computerName`, `appearance`, and `wallpaper` are persisted to `localStorage`.
2. **`useFileSystemStore`** — hierarchical file system: nodes (`FileNode` | `FolderNode`), current path, selected items, view mode (icon/list). Persisted to `localStorage`.
3. **`useWindowStore`** — open windows, active window id, z-index counter, window states (position, size, minimized, maximized). Not persisted; windows reopen to defaults on refresh. Windows are generic; app content is rendered by mapping `appId` to a component.
4. **`useDockStore`** — pinned apps, running apps, bounce state, dock size (10–100), magnification enabled flag, dock position (`bottom` | `left` | `right`). `size`, `magnificationEnabled`, and `position` are persisted to `localStorage`.
5. **`useAppDataStore`** — per-app data: calculator memory/history, notes collection, terminal history, Safari recent URLs. Persisted to `localStorage`.

### File system model
```ts
export type FsNode =
  | { id: string; type: 'folder'; name: string; parentId: string | null; createdAt: number; updatedAt: number }
  | { id: string; type: 'file'; name: string; parentId: string | null; content: string; createdAt: number; updatedAt: number };
```
Default tree on first boot:
```
/
  Applications/
    Calculator.app
    Notes.app
    Terminal.app
    Safari.app
    Settings.app
  Documents/
    Welcome.txt
  Downloads/
  Pictures/
    Wallpaper 1.png
    Wallpaper 2.png
    Wallpaper 3.png
  Music/
  Movies/
```

### App registry
```ts
export interface AppDefinition {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  component: React.ComponentType<{ windowId: string }>;
  menus: MenuItem[];
}
```
Apps: `finder`, `calculator`, `notes`, `terminal`, `safari`, `settings`.

### Window model
```ts
export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  prevBounds?: { x: number; y: number; width: number; height: number };
}
```
Window manager actions:
- `openWindow(appId, title?, opts?)`
- `closeWindow(id)`
- `focusWindow(id)`
- `minimizeWindow(id)`
- `maximizeWindow(id)` / `restoreWindow(id)`
- `moveWindow(id, dx, dy)`
- `resizeWindow(id, dw, dh, anchor)`

### Menu bar model
Menu bar receives the active app's `menus` plus a universal Apple menu and system status menus. Menu items may have keyboard shortcuts, separators, submenus, and disabled states.
```ts
export interface MenuItem {
  id: string;
  label?: string;
  separator?: boolean;
  shortcut?: string; // e.g. "Cmd+O"
  disabled?: boolean;
  action?: () => void;
  submenu?: MenuItem[];
}
```

### Context menus
Reusable `ContextMenu` component positioned absolutely. Used for desktop, Finder items, Dock, etc. Triggered via right-click.

## Chunks

### Chunk 1: Project scaffolding + core types + stores
**Goal**: Initialize the Vite + React + TypeScript project, install dependencies, configure Tailwind, and implement the typed Zustand stores that every other chunk depends on.

**Files changed / created**:
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tailwind.config.ts` (or CSS-based config for v4)
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/index.css`
- `src/types/index.ts`
- `src/stores/systemStore.ts`
- `src/stores/fileSystemStore.ts`
- `src/stores/windowStore.ts`
- `src/stores/dockStore.ts`
- `src/stores/appDataStore.ts`
- `src/lib/initialFs.ts`
- `src/lib/apps.ts` (registry, partial—filled in later chunks)
- `src/__tests__/stores.test.tsx`

**Acceptance criteria**:
1. `npm install` succeeds.
2. `npm run dev` starts without errors.
3. `npm run test` runs and at least 7 store tests pass (filesystem CRUD, window open/close/focus, dock pin/bounce/size/position, app data persistence, system appearance/wallpaper/accentColor/computerName).
4. All stores are typed and export typed hooks.
5. `useSystemStore`, `useFileSystemStore`, `useDockStore`, and `useAppDataStore` are wired with Zustand `persist` middleware to `localStorage` using distinct storage names. `useWindowStore` is not persisted.
6. Stores expose actions for the new fields: `setAccentColor`, `setComputerName`, `setDockSize`, `setDockMagnification`, `setDockPosition`.

**Test coverage**:
- File system: create folder, create file, rename, delete, navigate path.
- Window store: open two windows, active window switches, close removes window, z-index increments.
- Dock store: pin/unpin, bounce sets then clears, running set, size/position/magnification set.
- App data: notes CRUD, calculator memory, terminal history append.
- System store: appearance, wallpaper, accentColor, computerName.
- Persistence: rehydration of a stored note after creating a fresh store instance.

**Complexity**: `simple` (no UI, mostly typed data plumbing).

---

### Chunk 2: Desktop + MenuBar + Dock shell
**Goal**: Render the desktop environment chrome: wallpaper, desktop icons, global menu bar, and Dock. Menus and Dock drive actions defined in stores.

**Files changed / created**:
- `src/components/Desktop.tsx`
- `src/components/MenuBar.tsx`
- `src/components/Dock.tsx`
- `src/components/DockItem.tsx`
- `src/components/AppleMenu.tsx`
- `src/components/Menu.tsx`
- `src/components/StatusMenu.tsx`
- `src/components/Clock.tsx`
- `src/lib/wallpapers.ts`
- `src/__tests__/chrome.test.tsx`

**Acceptance criteria**:
1. Desktop renders selected wallpaper as full-screen background.
2. Desktop renders at least three default icons (e.g., Home, Applications, Settings) positioned on the upper-left area.
3. Double-clicking a desktop icon opens the corresponding app or folder in a Finder window.
4. Right-clicking desktop opens a context menu with "Change Desktop Background" and "New Folder".
5. Menu bar shows Apple logo, active app name, app-specific menus, status icons, and a live clock.
6. Dock shows pinned app icons; clicking launches the app (creates a window) or focuses an existing one.
7. Running apps show a dot indicator under the icon.
8. Bounce animation plays once when an app is launched.
9. Dock magnification follows mouse position while hovering.

**Test coverage**:
- Menu bar renders active app name.
- Dock renders pinned apps and responds to click by calling `openWindow`.
- Desktop renders the default desktop icons.
- Double-clicking a desktop icon calls `openWindow`.
- Desktop context menu opens on right-click and offers background change.

**Complexity**: `complex` (interactions, animations, menu positioning, hover tracking).

---

### Chunk 3: Window manager
**Goal**: Implement a generic `Window` component with macOS-style title bar, traffic lights, drag-to-move, resize handles, minimize/maximize/restore, and z-order focus management.

**Files changed / created**:
- `src/components/Window.tsx`
- `src/components/TitleBar.tsx`
- `src/components/ResizeHandle.tsx`
- `src/components/WindowManager.tsx`
- `src/hooks/useDrag.ts`
- `src/hooks/useResize.ts`
- `src/__tests__/window.test.tsx`

**Acceptance criteria**:
1. Windows render with title, close/minimize/maximize buttons, and content area.
2. Clicking a window brings it to front (highest z-index).
3. Dragging the title bar moves the window; movement is constrained so the title bar remains reachable.
4. Resize handles on corners/edges resize with minimum dimensions.
5. Minimize shrinks window to Dock and restores on Dock click.
6. Maximize fills the usable screen area (excluding menu bar); restore returns to previous bounds.
7. Close removes the window from the store.

**Test coverage**:
- Focus increments z-index.
- Minimize toggles `minimized` state.
- Maximize toggles and restores previous bounds.
- Close removes window.

**Complexity**: `complex` (DOM event handling, coordinate math, state synchronization).

---

### Chunk 4: Finder app
**Goal**: Build the Finder application: navigable file tree, sidebar, toolbar with view toggles, file/folder creation, rename, delete, and double-click to open files or launch apps.

**Files changed / created**:
- `src/apps/Finder.tsx`
- `src/apps/FinderToolbar.tsx`
- `src/apps/FinderSidebar.tsx`
- `src/apps/FinderIconView.tsx`
- `src/apps/FinderListView.tsx`
- `src/components/ContextMenu.tsx`
- `src/__tests__/finder.test.tsx`

**Acceptance criteria**:
1. Finder window opens at `/` by default.
2. Sidebar shows favorites (Applications, Documents, Downloads, Pictures, etc.).
3. Main area shows current folder contents in icon or list view.
4. Double-clicking a folder navigates into it.
5. Double-clicking a `.app` file or an app alias launches that app.
6. Double-clicking `.txt` opens a read-only preview in a simple modal/inline viewer.
7. Toolbar supports back/forward, view toggle (icon/list), new folder, and new file.
8. Right-click on empty space or item opens context menu (Open, Rename, Delete, New Folder).
9. Finder contributes its own menu bar menus (`File`, `Edit`, `View`, `Go`).

**Test coverage**:
- Render current folder contents.
- Double-click folder updates path.
- Toolbar new folder creates a node.
- Context menu delete removes item.

**Complexity**: `complex` (nested UI, file operations, context menus).

---

### Chunk 5: Calculator + Notes apps
**Goal**: Implement two self-contained apps: Calculator and Notes.

**Files changed / created**:
- `src/apps/Calculator.tsx`
- `src/apps/Notes.tsx`
- `src/__tests__/calculator.test.tsx`
- `src/__tests__/notes.test.tsx`

**Acceptance criteria**:

*Calculator*:
1. Standard numeric pad and operators (+, −, ×, ÷, =, C, ±, %).
2. Displays current input and computed result.
3. Keyboard support for digits, operators, Enter, Escape, Backspace.
4. Chain calculations correctly (left-to-right, immediate execution per operator).

*Notes*:
1. List of notes in sidebar; selecting opens editor.
2. Create/delete notes.
3. Live title derived from first line.
4. Persisted across reloads.

**Test coverage**:
- Calculator computes `12 + 7 = 19` and clears.
- Notes creates a note and derives title.

**Complexity**: `simple` (form-driven UI, no subtle ordering).

---

### Chunk 6: Terminal app
**Goal**: Implement a Terminal app with command parsing, filesystem integration, and history navigation.

**Files changed / created**:
- `src/apps/Terminal.tsx`
- `src/lib/terminalCommands.ts`
- `src/__tests__/terminal.test.tsx`

**Acceptance criteria**:
1. Prompt shows current working directory from filesystem store.
2. Commands implemented: `help`, `ls`, `cd <path>`, `pwd`, `cat <file>`, `mkdir <name>`, `touch <name>`, `clear`.
3. Command history via up/down arrows; history index resets correctly after executing a new command.
4. Scrollable output.
5. Terminal contributes its own menu bar menu (`Shell`) with at least "New Window" and "Clear" items.

**Test coverage**:
- Terminal parses `pwd` and `ls` commands.
- `cd` rejects invalid paths.
- History navigation cycles correctly (up loads previous, down returns to empty prompt).

**Complexity**: `complex` (command parsing, filesystem state ordering, history index management).

---

### Chunk 7: Safari + Settings apps
**Goal**: Implement Safari (address bar + iframe/webview mock) and Settings (appearance, wallpaper, accent color, computer name, dock preferences). Persistence is already wired in Chunk 1; this chunk only consumes and exposes the persisted fields through UI.

**Files changed / created**:
- `src/apps/Safari.tsx`
- `src/apps/Settings.tsx`
- `src/__tests__/settings.test.tsx`
- `src/__tests__/safari.test.tsx`

**Acceptance criteria**:

*Safari*:
1. Address bar accepts a URL and loads it in a sandboxed iframe.
2. Navigation buttons Back/Forward/Reload are UI-only (iframe history is limited; at minimum reload works).
3. Default homepage is a friendly welcome page rendered inline.
4. Maintains recent URLs list.

*Settings*:
1. General pane: appearance toggle (light/dark), accent color selector, computer name.
2. Desktop pane: wallpaper picker (at least 3 wallpapers).
3. Dock pane: size slider, magnification toggle, position (bottom/left/right).
4. Changes reflect immediately in the UI.
5. A "Reset to Defaults" button clears persisted `localStorage` keys and reloads the page.

**Test coverage**:
- Settings toggles appearance in store.
- Wallpaper change updates system store.
- Accent color and dock position changes persist after store rehydration.
- Safari stores a recent URL.

**Complexity**: `simple` (Settings/Safari are mostly forms; persistence already implemented).

---

### Chunk 8: Context menus, keyboard shortcuts, integration
**Goal**: Add global context menus, keyboard shortcuts, and final integration so the prototype feels cohesive. Add smoke tests and end-to-end integration tests.

**Files changed / created**:
- `src/hooks/useContextMenu.ts`
- `src/components/ContextMenu.tsx` (enhancements)
- `src/hooks/useKeyboardShortcuts.ts`
- `src/lib/keyboard.ts`
- `src/App.tsx` (integration)
- `src/__tests__/integration.test.tsx`
- `README.md`

**Acceptance criteria**:
1. Global `Cmd+Option+Esc` (or `Ctrl+Alt+Esc` on non-Mac) opens a "Force Quit" dialog listing windows that can be closed.
2. `Cmd+N` (or `Ctrl+N`) opens a new window of the active app if applicable.
3. `Cmd+W` closes the active window.
4. `Cmd+M` minimizes the active window.
5. Desktop right-click context menu closes on outside click or Escape.
6. Menu bar menu opens on click and closes on outside click/Escape.
7. README documents how to run, build, test, and the implemented features.

**Test coverage**:
- Keyboard shortcut closes active window.
- Force Quit dialog lists windows.
- Integration test: open Finder, navigate, create folder, close Finder.

**Complexity**: `complex` (keyboard handling, global event listeners, integration).

## Verification strategy
1. After each chunk: run `npm run test` and `npm run build`; failures must be fixed before proceeding.
2. Final review by a Reviewer agent reading the spec and all source files.
3. Manual smoke checklist (orchestrator reads README, not manual QA): dev server starts, no console errors on initial load, all six apps open from Dock.

## Decision log
1. **Why Zustand?** Minimal boilerplate vs. Redux; persistence middleware built-in; fits small-to-medium React apps.
2. **Why Tailwind CSS v4?** Modern, utility-first, fast to style pixel-perfect macOS chrome. If v4 setup proves unstable during build, fallback to v3 is acceptable with a one-line note in README.
3. **Why iframe for Safari?** True web browsing is blocked by CORS/security; iframe provides a plausible browsing experience for same-origin or whitelisted pages. A built-in welcome page is the default.
4. **Why no real file downloads/uploads?** Out of MVP scope; files are in-memory objects with text content only.
5. **Why `localStorage`?** Simplest browser persistence; sufficient for MVP data volume.

## Risks
1. Tailwind CSS v4 configuration may differ from v3; mitigated by using Vite plugin and pinning documented install steps.
2. Window drag/resize math can be finicky across browsers; mitigated by thorough tests and manual smoke check.
3. Scope is large; mitigated by strict chunk acceptance criteria and stopping at MVP boundary.
4. State-store circular imports; mitigated by keeping store definitions in separate files and action imports explicit.
