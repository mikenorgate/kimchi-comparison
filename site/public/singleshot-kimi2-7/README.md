# macOS Tahoe Web

A faithful, interactive recreation of the macOS desktop environment as a single-page web app. It features a working Desktop, Dock, Menu Bar, Launchpad, window manager, and a growing suite of built-in apps with localStorage persistence.

## Features

- **Desktop** with wallpaper, desktop icons, and right-click context menu
- **Menu Bar** with Apple menu and app-specific menus
- **Dock** with running indicators, tooltips, and app launching
- **Launchpad** with search
- **Window manager** with drag, resize, minimize, maximize, focus, and z-order
- **Apps** (23 total):
  - Finder with folder navigation
  - Safari with real web browsing via iframe
  - Terminal with a small shell
  - Calculator
  - Notes with persistence
  - System Settings with appearance/wallpaper options
  - Photos, Calendar, Music, Messages, Mail
  - Clock, Weather, Maps
  - App Store, TV, Podcasts, Reminders, FaceTime
  - TextEdit, Preview, Activity Monitor, Contacts
- **Persistence** using `localStorage` for Notes, Messages, Mail, Calendar, Reminders, Settings, Finder tree, etc.
- **Keyboard shortcuts** like `Cmd+N` (Finder), `Cmd+T` (Terminal), `Cmd+,` (Settings), `Cmd+Space` (Launchpad)

## Running locally

```bash
npm start
```

Then open http://localhost:8765 in your browser.

## Testing

```bash
npm test
```

Runs a Playwright end-to-end smoke test that opens every app.

## Project structure

```
.
├── index.html           # Main shell
├── styles/              # Global and app-specific CSS
├── js/                  # Core framework (window manager, dock, menus, etc.)
├── apps/                # Individual app implementations
└── e2e.test.cjs         # Smoke test
```

## Notes

This is a foundation/demo. A complete 1:1 recreation of every macOS app would be a much larger project, but the framework here is modular and easy to extend: add a new folder under `apps/`, register your app, and import it in `js/main.js`.
