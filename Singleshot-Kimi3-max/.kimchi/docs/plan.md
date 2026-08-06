# Tahoe Web — macOS Tahoe (26) as a web app

## Goal
A self-contained, dependency-free (vanilla HTML/CSS/JS) simulation of the macOS Tahoe desktop that runs by opening `index.html`. Every dock app, menu bar menu, and system panel is interactive and functional. State persists via localStorage.

## Constraints
- No build step, no npm deps; plain `<script>` tags (file:// safe, no ES modules)
- All artwork generated in-code (SVG icons, gradient wallpapers, seeded image art)
- No network access; Safari/Mail/Messages/etc. are simulations with real local behaviour

## Files
- `index.html` — DOM skeleton: boot, lock, screen (wallpaper, desktop, windows, menubar, dock, overlays)
- `css/main.css` — full Liquid Glass design system (light/dark, accent vars) + per-app styles
- `js/data.js` — utils, virtual file system + fs ops, seeded SVG art generator, mock data (mails, threads, contacts, music, photos, weather, store), persisted stores
- `js/icons.js` — hand-drawn SVG app icons
- `js/core.js` — window manager (drag/resize/minimize/zoom/focus/hide), menu bar + dropdown menu engine (submenus, shortcuts, checks), context menus, Dock (magnification, running apps, trash), notifications + banners, Control Center, Notification Center, Spotlight, Launchpad, Mission Control, app switcher, Force Quit, About This Mac, dialogs, boot/lock/sleep/restart/shutdown, settings state
- `js/apps1.js` — Finder (+AirDrop/Trash/Get Info), System Settings (bound panes: Wi-Fi/Bluetooth/Sound/Focus/Appearance/Desktop & Dock/Displays/Battery/General/About/Software Update/Storage/Users), Terminal (command shell on the VFS, `say`, `open -a`, neofetch), Calculator, Clock (world clock/alarms/stopwatch/timer), TextEdit, Preview, App Store (installs web clips to Launchpad)
- `js/apps2.js` — Safari (tabs, history, bookmarks, mock web, offline mode), Mail (3-pane, compose + simulated replies), Messages (bot replies, typing indicator), Contacts, FaceTime, Maps (canvas map + directions), Music (WebAudio synth sequencer playback), Photos (library/viewer/favourites/delete)
- `js/apps3.js` — Notes (folders, rich text, autosave), Reminders (lists, tasks), Calendar (month view, events), Weather (cities, hourly/10-day)
- `js/main.js` — boot sequence, global keyboard shortcuts (⌘Space, ⌘Tab, ⌘Q/W/M/H, F3, Ctrl+↑), first-run welcome

## Verification
`node --check` every JS file; static serve + curl smoke test.

## Decision log
- Single-window-per-app (dock semantics), multiple Finder/TextEdit docs handled in-app
- Abstract gradient wallpapers (no binary assets allowed)
- Music plays via WebAudio synth (deterministic per-track melody)
