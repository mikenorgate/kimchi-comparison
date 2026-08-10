# macOS Tahoe — Web Edition

A faithful, fully interactive recreation of the **macOS Tahoe (macOS 26)** desktop as a single
dependency-free web app — Liquid Glass translucency, a real menu bar, a working Dock, 23 apps,
a shared virtual filesystem, and system settings that genuinely change the OS.

## Run it

Open `index.html` in any modern browser (works straight off the filesystem — no server, no build):

```bash
open index.html        # macOS
# or just double-click index.html
```

Boot → lock screen → any password → desktop.

## Highlights

- **Boot / Lock / Login** screens, plus Sleep, Restart, Shut Down, Lock, Log Out from the  menu.
- **Menu bar** —  menu (About This Mac, Force Quit, power…), per-app menus that swap per focused
  window, working keyboard shortcuts (⌘N, ⌘T, ⌘W, ⌘M, ⌘Q, ⌘H, ⌘,, ⌘[, ⇧⌘N, ⌘I, ⌘⌫, ⌘1/⌘2…),
  live clock, Wi-Fi and Battery menus, Spotlight and Control Center buttons.
- **Dock** — pinned + running apps, magnification, launch bounce, right-click (Keep in Dock, Quit),
  minimized-window chips, live Trash (fills up), auto-hide and left/right positions.
- **Spotlight** (⌘Space) — apps, files in the virtual filesystem, `=4*(3+2)` calculator results, web search.
- **Control Center** — Wi-Fi/Bluetooth/AirDrop/Do Not Disturb toggles, Dark Mode, brightness (actually
  dims), volume, **Now Playing** that stays in sync with Music (play/pause/skip work).
- **Notification Center** (click the clock) — Calendar/Weather/Clock/Music widgets + notification history.
- **Launchpad** (F4) and **Mission Control** (Ctrl+↑, scales live windows), **App Switcher** (Ctrl+Tab).
- **Window server** — drag, resize (8 handles), minimize-to-dock with animation, zoom (green light),
  double-click title bar, traffic lights that light up in a group.
- **System Settings** that are real: Appearance (light/dark/auto + 8 accent colors), Wallpaper picker,
  Desktop & Dock (size/magnification/auto-hide/position), Sound, Wi-Fi, Focus, Storage visualization…
- **23 apps**, all functional (simulated where a browser can't do a thing):

  | Core | Productivity | Media | Utilities |
  |---|---|---|---|
  | Finder* | Notes (rich text) | Photos (generated art, favorites, import) | Calculator (keyboard) |
  | Safari (tabs, history, bookmarks, fake web) | Reminders (lists, flags) | Music (player, Now Playing sync) | Terminal (zsh-ish: ls, cd, cat, open, sw_vers, neofetch) |
  | Mail (send → real auto-replies) | Calendar (double-click to add events) | Podcasts (follow) | Activity Monitor (live procs) |
  | Messages (send → they answer) | TextEdit (⌘S saves to the FS) | TV (pre-paused streams) | Clock (world time/laps/timer with banner) |
  | Maps (live OpenStreetMap) | | Preview | Weather (4 cities) |
  | FaceTime (camera preview + fake calls) | | | App Store (GET → install state) |
  | Contacts | | | System Settings |

  *Finder: icon/list views, sort, back/forward, Recents, search, rename (⌘I info), duplicate (⌘D),
  cut/copy/paste (⌘X/⌘C/⌘V), Trash ↔ Put Back, Get Info windows, desktop icons, Go menu.

## Files on "Macintosh HD"

Notes, Reminders, Calendar events, Mail, Messages, Contacts, bookmarks, alarms, settings and every
document you save persist to `localStorage` (one per key: `mac.*`). To factory-reset the Mac:

```js
// in the browser console:
Object.keys(localStorage).filter(k => k.startsWith('mac.')).forEach(k => localStorage.removeItem(k));
location.reload();
```

## Structure

```
index.html            shell + fixed script order (file://-safe, classic scripts)
css/base.css          tokens, Liquid Glass surfaces, menubar, windows, dock, overlays
css/apps.css          per-app styling
js/util.js            bus, h() DOM builder, hand-drawn SVG icon set, photo/album art generators
js/store.js           settings + localStorage
js/fs.js              virtual filesystem
js/wm.js              window manager & app registry
js/menubar.js         menu engine + accelerators + menu extras
js/dock.js            the Dock
js/system.js          boot/lock, CC/NC/Spotlight/Launchpad/MC, alerts, power, wallpapers
js/apps/*.js          the 23 apps
js/main.js            glue + boot
```

Not affiliated with Apple Inc. macOS, the Apple logo, and app names are trademarks of Apple.
All artwork here is hand-drawn SVG/CSS/canvas; no Apple assets are used.
