# macOS Tahoe Web — Build Spec

## Goal
Recreate the macOS Tahoe (macOS 26) desktop as a self-contained web app with the
Liquid Glass design language: transparent menu bar, glass dock, glassy menus,
working Control Center, Spotlight, and a window manager. Every menu and a broad
suite of apps are genuinely functional.

## Tech
- Vanilla JS (ES modules, `type="module"`) + CSS. No build step, no deps.
- Served via static server (`python3 -m http.server`).
- State (notes, files, settings) in `localStorage`.
- Icons: inline SVG (no binary assets). Wallpapers: CSS gradients.

## Architecture
- `js/main.js` — bootstrap, wires shell.
- `js/store.js` — localStorage helpers + global event bus (`on/emit`).
- `js/vfs.js` — virtual filesystem shared by Finder & Terminal.
- `js/wm.js` — window manager (create/move/resize/min/max/close/focus/z-order).
- `js/menubar.js` — menu bar + dropdown menu system; per-app menus.
- `js/dock.js` — dock with magnification, running indicators, launch.
- `js/controlcenter.js` — Control Center panel (Wi-Fi/BT/AirDrop/Focus/brightness/sound).
- `js/spotlight.js` — Spotlight search (apps + files + actions).
- `js/apps/*.js` — each app exports `{ id, name, icon, menus, mount(el) }`.

## Shell
- **Desktop**: full-screen wallpaper gradient (Tahoe-like). Desktop icons.
- **Menu bar** (top, transparent glass):  Apple menu | app menus (bold app) | right: battery, wifi, search, control center, siri, date/time.
- **Apple menu**: About This Mac, System Settings…, App Store…, Sleep/Restart/Shut Down/Lock/Log Out (visual).
- **App menus**: File / Edit / View / Window / Help — context-aware per app, with real menu items that work.
- **Control Center**: toggles + sliders that affect volume (Web Audio), brightness (filter), dark mode, wallpaper.
- **Spotlight**: ⌘Space / click → search apps & files, Enter launches.
- **Dock**: app icons, magnify on hover, running dots, bounce on launch, genie minimize, Trash.

## Windows
- Translucent Liquid Glass toolbar, traffic lights (close/min/maximize), title center, draggable, resizable (8 handles), focus z-order + shadow, minimize to dock.

## Apps (functional)
Finder (VFS browse, sidebar, view modes), Notes (CRUD + localStorage), Calculator (full), Terminal (shell cmds over VFS), Safari (tabs, address bar, start page, allowed iframe sites), System Settings (appearance/wallpaper/menubar/about — actually working), Calendar (month nav + events), TextEdit (editor + save), Photos (gallery), Music (player UI + Web Audio tones), Clock (world clock + timer).

## Verification
- `python3 -m http.server 8000` then open browser.
- Open LSP diagnostics on edited JS.
- Manual: launch each app from dock, drag/resize/min/close windows, use menus, Spotlight search, control center toggles, persistence reload.
