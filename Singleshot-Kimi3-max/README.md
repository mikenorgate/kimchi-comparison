# macOS Tahoe — Web Edition

A fully interactive recreation of the macOS 26 "Tahoe" desktop in pure HTML/CSS/JS — no frameworks, no build step, no network dependencies (except the Maps app).

## Run it

**Easiest:** double-click `index.html` (works from `file://`).

**Or serve it:**
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Boot splash → lock screen (click / press Return) → desktop.

## What's working

**System**
- Window manager: drag, 8-direction resize, minimize (genie-style into the Dock), zoom, title-bar double-click, edge snapping with preview, per-app focus model
- Fully transparent Tahoe menu bar:  menu (About This Mac, Force Quit, Sleep / Restart / Shut Down / Lock — all real), per-app File / Edit / View / Window / Help menus, battery (real % via Battery API), Wi-Fi menu, live clock
- Control Center: Wi-Fi / Bluetooth / AirDrop / Focus toggles, Dark Mode, brightness (really dims the screen), volume, music mini-player
- Spotlight (⌘Space): searches apps, files, settings panes, web
- Notification Center (click clock): widgets (Calendar, Weather, Screen Time) + notification history; banners; Do Not Disturb actually suppresses banners
- Dock: hover magnification, launch bounce, running indicators, unread badges (Mail, Messages), Trash with full/empty states
- Launchpad (F4), Mission Control (Ctrl+↑), right-click context menus everywhere
- System Settings: wallpaper picker, appearance (light/dark), accent color, Wi-Fi networks, Bluetooth devices, sound, display brightness, Focus, About/Software Update — all live

**Apps (22)**
Finder (icon/list/column views, rename, duplicate, trash, Get Info) · Safari (tabs, bookmarks, built-in mini-web) · Notes (persistent, searchable) · Mail (compose sends to Sent) · Messages (replies bot + badges) · Calendar (persistent events) · Reminders (persistent lists) · Photos (library, favorites, slideshow; Photo Booth captures appear here) · Music (player with progress + EQ) · Maps (OpenStreetMap embed) · App Store (GET → install → OPEN) · Terminal (zsh-ish, 20 commands on the shared virtual FS — try `ls ~`, `cat ~/Desktop/Welcome.txt`, `open -a Notes`, `say hello`) · Calculator (keyboard support) · Weather · Clock (world clock, alarms, stopwatch, timer) · TextEdit (fonts, save to Documents, opens .txt from Finder/Terminal) · Preview (zoom, thumbnails) · Activity Monitor (live process table + CPU graph) · Photo Booth (uses your webcam if allowed) · Stickies · Trash (Put Back, Delete Immediately)

**Data**
Virtual file system (`~/Desktop` icons are real files you can edit/delete/restore), settings, notes, reminders, events, mail, stickies, favorites — all persisted in `localStorage`.

## Layout
```
index.html          shell + script order
css/base.css        tokens, boot/lock, menu bar, controls
css/chrome.css      windows, Dock, Launchpad, MC, modals, Spotlight, CC, NC
css/apps1.css       Finder · Safari · Notes · TextEdit · Terminal · Calculator · Calendar
css/apps2.css       Settings · Store · Activity · Preview · Booth · Music · Photos · Weather · Clock · Mail · Messages · Reminders · Maps · Stickies
js/core.js          DOM builder, Sys settings store, notifications, context menus, modals
js/fs.js            persistent virtual file system + trash + file→app routing
js/icons.js         inline SVG icon set
js/wm.js            window manager + Mission Control
js/menubar.js       menu bar + Apple menu
js/systemui.js      Control Center + Spotlight + Notification Center
js/dock.js          Dock + Launchpad
js/apps.core.js     Finder · Safari · Notes · TextEdit
js/apps.sys.js      Terminal · Calculator · Calendar · Settings · Store · Activity · Preview · Trash · Photo Booth
js/apps.media.js    Music · Photos · Weather · Clock · Mail · Messages · Reminders · Maps · Stickies
js/main.js          boot/lock, desktop icons, global shortcuts
```

Reset everything: run `localStorage.clear()` in the browser console and reload.
