# macOS Tahoe Web App Spec

## Goal
Build a single-page web app that recreates the macOS Tahoe desktop experience in the browser using vanilla HTML/CSS/JS. The desktop, window manager, Dock, Menu Bar, and a subset of apps are functional; remaining apps are visually accurate shells with sample data.

## Constraints
- No build tools or frameworks. Pure HTML, CSS, and ES modules (or a single JS file).
- Local-only / in-memory persistence via `localStorage` where applicable.
- Runs from `index.html` opened in a modern browser.
- Tahoe visual style: translucent materials (blur), rounded corners, consistent spacing, SF-like system font stack.

## Files
- `index.html` — root page, app containers, templates for windows.
- `styles.css` — all styling: desktop, Dock, Menu Bar, windows, apps.
- `app.js` — all behavior: window manager, app launchers, per-app logic.
- `README.md` — how to run.

## Chunks

### 1. Desktop Shell
**Files changed:** `index.html`, `styles.css`, `app.js`
**Goal:** Render a Tahoe-style desktop with wallpaper, Menu Bar, Dock, and a desktop context menu.
**Accept when:**
- Wallpaper fills the viewport.
- Menu Bar is fixed at top, contains Apple logo, active app name, status icons, and a live clock.
- Dock is centered at the bottom with app icons that bounce/hover and launch apps.
- Right-clicking the desktop shows a context menu (Change Wallpaper, New Folder).

### 2. Window Manager
**Files changed:** `app.js`, `styles.css`
**Goal:** Support draggable, resizable, minimizable, maximizable, focus-managed windows.
**Accept when:**
- Windows can be dragged by the title bar.
- Windows can be resized from the bottom-right corner.
- Traffic-light buttons close/minimize/maximize work.
- Clicking a window brings it to the front (z-index).
- Only the focused window shows the colored traffic lights at full opacity.
- Minimized windows shrink to the Dock; clicking the Dock icon restores them.

### 3. Finder App
**Files changed:** `app.js`, `styles.css`
**Goal:** Provide a file manager with sidebar and folder navigation.
**Accept when:**
- Sidebar shows Favorites (Desktop, Documents, Downloads, Applications, Home).
- Main area lists files/folders as icons or list items.
- Double-clicking a folder navigates into it.
- Breadcrumb/path bar updates.
- A default in-memory file tree is created on first load.

### 4. Safari App
**Files changed:** `app.js`, `styles.css`
**Goal:** Provide a browser UI that loads external sites via iframe.
**Accept when:**
- Address bar accepts a URL and loads it in an iframe.
- Back/forward/reload buttons update the iframe.
- Tab bar with at least one functional tab.
- Handles sites that allow iframing; shows a friendly error page for X-Frame-Options blocks.

### 5. Terminal App
**Files changed:** `app.js`, `styles.css`
**Goal:** Provide a terminal emulator with a small command set.
**Accept when:**
- Prompt shows current path.
- Supported commands: `help`, `ls`, `cd`, `pwd`, `cat`, `clear`, `echo`, `whoami`, `date`.
- Command history (Up/Down arrow) works.
- Output scrolls automatically.

### 6. Calculator App
**Files changed:** `app.js`, `styles.css`
**Goal:** Provide a working calculator.
**Accept when:**
- Supports +, −, ×, ÷, ±, %, clear, backspace, decimal.
- Keyboard input works.
- Displays current operation and result.

### 7. Notes App
**Files changed:** `app.js`, `styles.css`
**Goal:** Provide a notes app that persists to `localStorage`.
**Accept when:**
- Sidebar lists notes.
- Selecting a note opens it for editing.
- Notes auto-save on input.
- New/delete note works.

### 8. System Settings App
**Files changed:** `app.js`, `styles.css`
**Goal:** Provide a settings UI that controls the desktop theme.
**Accept when:**
- Settings categories list on the left, detail pane on the right.
- Appearance: toggle light/dark/auto.
- Wallpaper: pick from preset wallpapers.
- Dock: toggle position (bottom/left/right) and auto-hide.
- Changes apply immediately and persist to `localStorage`.

### 9. Shell Apps (Photos, Music, Mail, Messages)
**Files changed:** `app.js`, `styles.css`
**Goal:** Provide visually accurate placeholder apps with sample data.
**Accept when:**
- Photos shows a grid of sample images.
- Music shows a library list and a now-playing bar.
- Mail shows an inbox list and a reading pane.
- Messages shows a conversation list and a chat view.

### 10. Integration
**Files changed:** `app.js`, `index.html`, `styles.css`
**Goal:** Wire every app into the Dock and Menu Bar.
**Accept when:**
- All apps have Dock icons and launch correctly.
- Menu Bar app menu updates based on focused app.
- Dock shows indicators for running apps.

## Verification Strategy
- Open `index.html` in a browser.
- Launch each app from the Dock; confirm windows open and can be dragged/focused/closed.
- Test Finder navigation, Terminal commands, Calculator math, Notes CRUD, Settings changes, Safari iframe load.
- Check no console errors during normal use.

## Risks
- Safari iframe may be blocked by some sites; fallback page is required.
- Building 10 apps in one session means some will be shallow; scope is limited to the acceptance criteria above.
