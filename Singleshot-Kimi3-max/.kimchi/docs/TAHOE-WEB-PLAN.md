# macOS Tahoe Web — Build Spec

## Goal
Faithful, *working* recreation of the macOS 26 (Tahoe) desktop as a static web app. Vanilla HTML/CSS/JS, no build step, runs from `file://` or any static server. Liquid Glass design: transparent menu bar, glass Dock/Control Center, squircle icons, dark/light appearance.

## Architecture (no modules — plain scripts, file:// safe)
- `index.html` — shell: #boot, #lockscr, #desktop (#menubar, #dsk-icons, #windows, #dock), overlays (#cc, #spot, #nc, #banner, #ctx, .modal layer, #launchpad, #mc)
- `css/style.css` — full theme via CSS vars (`body.dark` flips), glass recipe (blur+saturate+hairline), wallpapers as pure-CSS gradients
- `js/core.js` — `el()` DOM builder, `Sys` persisted settings store w/ pub-sub, `notify()` banners + NC store, `ctxMenu()`, `modal()`, utils
- `js/fs.js` — persistent virtual FS tree (localStorage), trash store, seed data, path utils; shared by Finder/Terminal/TextEdit/Preview/desktop
- `js/icons.js` — inline SVG icon set for 22 apps + file types + status icons, `iconEl(name,size)`
- `js/wm.js` — window manager: open/close/focus/minimize(genie-ish)/zoom/8-grip resize/edge snap/keyboard; active-app events; Mission Control overlay
- `js/dock.js` — pinned+running icons, magnification, bounce-on-launch, badges, trash w/ full state, item context menus; Launchpad overlay
- `js/menubar.js` — transparent bar, per-app menu model (App/File/Edit/View/Window/Help + app extras), Apple menu (About/Force Quit/Sleep/Restart/Shutdown/Lock all functional), status items (battery via navigator.getBattery, Wi-Fi menu, CC toggle, Spotlight, live clock)
- `js/systemui.js` — Control Center (real Wi-Fi/BT/DND/Dark/brightness/volume state), Spotlight (apps+files+settings search, kbd nav), Notification Center (widgets + banners)
- `js/apps.core.js` — Finder (icon/list/column views, rename/duplicate/trash/get-info), Safari (tabs, bookmarks, built-in mini-web), Notes (folders+search, persisted), TextEdit (fonts, save→FS)
- `js/apps.sys.js` — Terminal (zsh-ish, 20 cmds on real FS), Calculator (keyboard), Calendar (month+events), Settings (appearance/wallpaper/wifi/sound/display/focus — live effects), App Store (install flow), Activity Monitor (live process table + CPU canvas), Preview (image viewer), Trash, Photo Booth (getUserMedia + fallback)
- `js/apps.media.js` — Mail (3-pane, compose→Sent), Messages (bot replies, unread badge), Reminders (lists, persisted), Photos (generated gradient library, favorites, slideshow), Music (player w/ progress, eq anim), Weather (Cupertino mock), Clock (world clock, working stopwatch/timer), Maps (OSM embed), Stickies
- `js/main.js` — boot splash → lock screen → desktop; desktop icons = real `~/Desktop` FS items (drag, dbl-click open); global shortcuts (⌘Space, ⌘W/⌘M/⌘Q, ⌃↑); appearance/wallpaper application; Files.app-style file→app routing (`openFile`)

## Key APIs
- `Apps` registry: `{id,name,icon,single,size,min,menus(win),build(win,args)}`; `WM.open(id,args)` routes; `WM.activeApp` drives menu bar.
- `win` object: `{el,content,setTitle(),close(),app}`.
- Persistence namespaces: `tahoe-sys`, `tahoe-fs`, `tahoe-notes`, `tahoe-rem`, `tahoe-cal`, `tahoe-mail`.
- Every control must do something real (toggle state, mutate FS, launch app, or show a dialog). No dead buttons.

## Verification
`node --check` each JS; `python3 -m http.server` + curl 200s; grep audit that every `Apps.*` id has registry icon & dock/launchpad entry.

## Decision log
- Plain scripts (not ES modules) so `file://` works — modules hit CORS on file://.
- Photos are generated CSS gradients (offline-safe, no binary assets).
- Maps uses OSM iframe (only feature needing network); degrades silently.
- True "every app works": scope = 22 apps, each fully interactive; no placeholder pages.
