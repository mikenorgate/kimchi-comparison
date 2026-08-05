# macOS Tahoe — Web Edition

A recreation of the macOS Tahoe (macOS 26) desktop as a static web app. No frameworks, no build step — plain HTML/CSS/JS.

## Run it

```sh
python3 -m http.server 8741
# then open http://localhost:8741
```

(Opening `index.html` directly via `file://` also works.)

Append `?demo` to the URL to boot with a few windows already open.

## What works

**System UI**
- Menu bar with working  menu (About This Mac, Sleep, Restart, Shut Down, Lock Screen) and per-app menus (File/Edit/View/Window/Help plus app-specific menus) — every item does something
- Dock with magnification, launch bounce, running indicators, right-click menus, Trash
- Window manager: drag, 8-way resize, close/minimize/zoom traffic lights, focus/z-order, ⌘W/⌘M/⌘Q shortcuts
- Spotlight (⌘/Ctrl+Space): app launching, inline calculator, web search
- Control Center: Wi-Fi/Bluetooth/AirDrop/Focus toggles, dark mode, brightness & volume sliders
- Launchpad, notifications, desktop icons, desktop right-click menu, lock screen, sleep/shutdown

**Apps** (all launchable from Dock, Launchpad or Spotlight)
- **Finder** — simulated filesystem, sidebar favorites, navigation, new folders, move to Trash, opens files in the right app
- **Safari** — start page with favorites, URL/search bar, iframe browsing (sites that allow embedding)
- **Notes** — multi-note editor persisted to localStorage
- **TextEdit** — opens/saves files from the virtual filesystem, bold/italic/underline
- **Calculator** — fully functional, with keyboard support
- **Terminal** — zsh-flavored shell over the virtual FS: `ls, cd, cat, mkdir, touch, rm, echo, open <app>, sw_vers`, history…
- **Calendar** — real month view, navigation, double-click to add events (persisted)
- **Messages** — threads with auto-replying contacts + notifications
- **Mail** — inbox with read/unread state
- **Music** — playlist that actually plays generated melodies (Web Audio), respects system volume
- **Photos** — gallery with full-screen viewer
- **Maps** — embedded OpenStreetMap with place search
- **System Settings** — appearance (dark mode, accent colors), wallpapers, network, sound, displays, about
- **Trash** — fed by Finder's "Move to Trash", with Empty Trash

## Files

- `index.html` — shell markup
- `style.css` — Liquid Glass design system (light + dark)
- `js/os.js` — window manager, menu bar, dock, Spotlight, Control Center, notifications
- `js/apps.js` — virtual filesystem + all applications
- `js/boot.js` — startup
- `test.html` — in-browser smoke test suite (49 checks)
