# macOS Tahoe Web — Implementation Plan

## Goal

A single-page web app that recreates the **macOS Tahoe (macOS 26) desktop experience** with its "Liquid Glass" design language: boot → lock screen → desktop, working menu bar with real drop-down menus + keyboard shortcuts, Dock with magnification/minimize, full window manager, Control Center, Notification Center, Spotlight, Launchpad, Mission Control — and **every Dock/Launchpad app functional** (simulated where real OS services don't exist in a browser).

## Constraints

- Vanilla HTML/CSS/JS only. **No dependencies, no build step.**
- Must work when opened via `file://` → **classic scripts** (no ES modules; they are CORS-blocked on `file://`). Load order fixed in `index.html`; everything hangs off a global `window.Mac` namespace.
- No copyrighted assets: wallpaper = CSS gradients; app icons = hand-made inline SVG squircles; Apple logo = `\u{F8FF}` (renders as  on Apple devices).
- Persistence via `localStorage` (files, notes, reminders, events, settings, music state, installed apps).
- Desktop-only layout. English UI. Fonts: system stack (`-apple-system`, SF).

## Architecture

```
index.html            shell + script tags in fixed order
css/base.css          palette vars, light/dark, desktop, menubar, windows, dock, overlays
css/apps.css          per-app styling
js/util.js            Mac.Bus (pub/sub), h() DOM builder, $/$$, fmt helpers, ICONS (SVG), appIcon()
js/store.js           loadJSON/saveJSON, Mac.Settings (get/set/on, 'setting:' bus events)
js/fs.js              Mac.FS: virtual tree FS, paths, CRUD, default content, .Trash, persistence
js/wm.js              Mac.wm: app registry, launch/quit/hide, createWindow (drag/resize/zoom/minimize/focus)
js/menubar.js         Mac.Menus: menu spec engine, Apple menu, per-app menus, Window/Help auto-menus,
                      accelerator registry + global keydown, extras (battery/wifi menus), clock
js/dock.js            Mac.Dock: pinned/running/minimized/trash, magnification, bounce, autohide, ctx menus
js/system.js          Mac.System: boot/lock/login, wallpaper engine, brightness/appearance/dock live-apply,
                      Control Center, Notification Center + widgets, Spotlight, Launchpad, Mission Control,
                      app switcher (Ctrl+Tab), notifications + banners, alert/sheet dialogs, context menus,
                      power actions (sleep/restart/shutdown/lock/logout), About This Mac, Force Quit
js/apps/finder.js     Finder (sidebar, icon/list views, nav history, rename/duplicate/trash/get-info,
                      new folder, search, path/status bars, desktop icons, file-open dispatch)
js/apps/safari.js     Safari (tabs, address bar, internal fake sites, history, bookmarks, start page)
js/apps/comms.js      Mail, Messages (auto-replies), FaceTime (getUserMedia + fallback), Contacts, Maps (OSM iframe + fallback)
js/apps/productivity.js Notes, Reminders, Calendar (+events), TextEdit (rich text, save/open to FS)
js/apps/media.js      Photos (seed-generated images, viewer, favorites), Music (library, playback sim,
                      CC/Now-Playing sync), Podcasts, TV, Preview
js/apps/utilities.js  Calculator, Terminal (FS-backed shell), Activity Monitor, Clock (world/stopwatch/timer), Weather
js/apps/storeapp.js   App Store (Get → Install → Open, Updates)
js/apps/settings.js   System Settings (Wi-Fi/BT/Sound/Focus/General/Appearance/Wallpaper/Desktop&Dock/
                      Storage/Battery/Users — appearance/wallpaper/dock apply live)
js/main.js            registration order, Applications folder sync, boot start
```

### Shared API contract (cross-file, must stay consistent)

- `Mac.h(tag, attrs?, ...children)` → element. attrs: class, html, onclick…, style(object).
- `Mac.Bus.on/emit(event, data)`. Events: `activeapp`, `windows`, `running`, `apps`, `setting:<k>`, `music:state`, `notify`, `fs`.
- `Mac.Settings.get(k) / set(k,v) / all()`. Keys: theme(light/dark/auto), accent, wallpaper, wifi, bluetooth, airdrop, focus, brightness, volume, battery, charging, dockSize, dockMag, dockAutohide, dockPos, username, dockPinned[].
- `Mac.FS`: `get(path)` → node `{name,type:'folder'|'file',kind,content,children{},modified,appId?}`; `list(path)`; `mkdir, write, read, remove, rename, move, exists, join, parent, base, walk(cb)`; consts `FS.HOME`, `FS.TRASH`, `FS.APPS`.
- `Mac.wm.register(app)`; app = `{id,name,icon,menus?(win),open(args),settings?(),singleton?,hidden?}`.
  `Mac.wm.launch(id,args?)` → win; `quitApp(id)`, `hideApp(id)`, `activeApp`, `windows`, `createWindow({app,title,width,height,x,y,resizable,build(body,win),onClose,onFocus,noChrome?})`.
  Win: `{id, appId, el, body, setTitle(), setDirty(), close(), minimize(), zoom(), focus(), isMin}`.
- `Mac.Menus.register(appId, specFn)`; spec item: `{label, accel?, action?, enabled?:bool|fn, checked?:bool|fn, submenu?:[...], sep?:true}`. Sep item: `{sep:true}`.
- `Mac.System`: `notify({title,body,icon,appId})`, `alert({title,message,icon,buttons:[{label,primary,destructive}]})` → Promise<index>, `confirm(...)`, `contextMenu(x,y,items)`, `applyWallpaper()`, `applyAppearance()`, `openSpotlight()`, `toggleCC()`, `toggleNC()`, `missionControl()`, `launchpad()`, power: `sleep/restart/shutdown/lock/logout`, `aboutThisMac()`, `forceQuit()`.
- Photo art: `Mac.genPhoto(seed, w?,h?)` → dataURL (deterministic, canvas). Music art: `Mac.albumArt(seed,title)`.

## Chunks

### 1. Shell + base CSS — `index.html`, `css/base.css`
DOM scaffold: #boot, #lockscreen, #desktop(#wallpaper,#dim,#deskicons,#windows,#mission), #menubar(#mb-left,#mb-right), #dock, overlays (#sp otlight, #cc, #nc, #launchpad, #switcher, #ctxmenu, #alerts, #banners, #power).
CSS vars + `body.light/.dark` palettes; Liquid Glass = translucent `backdrop-filter: blur+saturate`, hairline borders, specular highlights, 12–16px radii; traffic-light window chrome; dock glass bar + magnification-ready icons.
**Accept when:** static desktop renders with menubar + dock skeleton, no JS errors (JS stubs at this point not required — CSS/HTML may ship before JS; full acceptance at chunk 11).

### 2. Core JS — `js/util.js`, `store.js`, `fs.js`, `wm.js`, `menubar.js`, `dock.js`
Depends on: 1.
Window manager: draggable titlebar, 8 resize handles, traffic buttons (close destroys, minimize animates to dock chip, zoom toggles), focus → `activeapp` bus event, cascade placement.
Menu engine: click-open → hover-swap, Esc/outside close, submenu-on-hover, accel registry → global keydown (meta || ctrl).
Dock: pinned (Settings.dockPinned) + running + minimized chips + Trash; hover magnification (distance falloff); launch bounce; ctx menu (Keep in Dock / Hide / Quit); autohide.
**Accept when:** can open/close/drag/resize/minimize/zoom windows; menus drop down and fire actions; shortcuts work; dock reflects running apps.
**Tests:** `node --check` all four files.

### 3. System layer — `js/system.js`
Boot (logo + progress ~1.6s) → lock screen (blurred wallpaper, live clock, click → login password field, Enter unlocks) → desktop fade-in. Panels: CC (Wifi/BT/AirDrop/Focus toggles, brightness→#dim, volume, Now Playing via `music:state`, dark toggle), NC (calendar/weather/clock widgets + notification list + Clear). Spotlight (apps + FS files + `=math`). Launchpad grid + search. Mission Control (Ctrl+↑). App switcher (Ctrl+Tab). Notifications w/ banners. Power menu wired (sleep → black, any key wakes; restart → boot; shutdown → "safe to close tab"; lock/logout → lock screen). About This Mac + Force Quit windows. Live appliers: appearance (class + accent var), wallpaper presets, brightness overlay, dock settings.
Depends on: 2. **Accept when:** full boot→unlock→desktop loop; all panels open/dismiss correctly; toggles visibly change the UI.

### 4. Finder + desktop — `js/apps/finder.js`
Views (icon/list + sort), sidebar favs/locations, toolbar (back/fwd, view switch, new-folder, search), status + path bars, ctx menus, Get Info window, inline rename, duplicate, move-to-/restore-from-trash (⌘⌫), Empty Trash, ⌘N/⇧⌘N/⌘[/⌘]/⌘1/⌘2/⌘I + Go-menu shortcuts, file-open dispatch (txt/md→TextEdit, photo→Preview, .app→launch, folder→navigate). Desktop icons mirror ~/Desktop with selection + dbl-click + ctx menu. Recents = most recent files via FS.walk.
**Accept when:** real CRUD on virtual FS persists across reload; Trash flow works; desktop mirrors FS.

### 5. Apps batch A — `safari.js`, `comms.js`
Safari: tabs (⌘T/⌘W/⌘L/⌘R/⌘[/]), address bar (known hosts → internal pages; else fake search results; bad host → error page), bookmarks bar (⌘B toggle, ⌘D add), History view + Clear, start page with favorites/privacy report. Internal sites: apple.com, wikipedia.org, github.com, news.
Mail: mailboxes/compose/send→Sent + banner, auto-reply demo. Messages: threads, send → typing… → reply, notification if unfocused. FaceTime: getUserMedia preview (graceful fallback), recents, fake call UI. Contacts: list/detail/add/delete. Maps: OSM embed iframe + fallback panel + search.
**Accept when:** all five apps open, navigate, and react; emails/messages persist in-session.

### 6. Apps batch B — `productivity.js`
Notes (folders, rich text b/i/u/lists/headings, autosave), Reminders (lists, add/complete/flag, counts), Calendar (month nav, dbl-click add event, event store feeds NC widget), TextEdit (contenteditable + toolbar, Save/Open dialogs against FS).
**Accept when:** data persists through reload (localStorage).

### 7. Apps batch C — `media.js`
Photos grid/viewer/favorites/albums/delete on `Mac.genPhoto` seeds; Music library + footer player + `music:state` sync to CC; Podcasts/TV browse + subscribe/playback modals; Preview viewer (opens photo files).
**Accept when:** start playback in Music → CC Now Playing shows track + pause works.

### 8. Apps batch D — `utilities.js`, `storeapp.js`
Calculator (keyboard), Terminal (help/ls/cd/pwd/cat/echo/open/date/whoami/sw_vers/clear/history), Activity Monitor (live fake procs, quit), Clock (4 tabs incl. working stopwatch/timer + completion banner), Weather (3 cities, hourly/10-day), App Store (install state persists, Open launches).
**Accept when:** `open safari` in terminal launches Safari; timer fires notification.

### 9. System Settings — `settings.js`
Sidebar nav + search; panes per contract; Appearance (light/dark/auto + 8 accents), Wallpaper (6 presets → live), Desktop & Dock (size/magnification/autohide/position → live), Sound sliders, Wifi/BT/Focus toggles bound to same Settings keys as CC, General→About/Software Update/Storage, Battery, Users.
**Accept when:** changing theme/accent/wallpaper/dock size visibly transforms desktop instantly.

### 10. Verification
`node --check` every JS file; grep pass on the shared API contract (no stale references); open `index.html` in default browser; fix LSP diagnostics; final review of module load order.

## Verification Strategy

- Per-chunk: `node --check` + `lsp_diagnostics` on edited files.
- End: boot the app from `file://` in the default browser; click-through smoke list: boot→unlock, open each of 22 apps once, minimize/zoom/close, run one FS op in Finder, toggle theme + wallpaper + dock size, Spotlight-launch Terminal, run `sw_vers`, send a Messages reply, start Music track & pause from CC, lock + unlock.

## Decision Log

1. **Classic scripts + `window.Mac` namespace over ES modules** — modules fail under `file://` CORS; zero-friction open matters more.
2. **Simulated network/services** (Safari sites, Mail send, Music playback, FaceTime callee) — browsers can't provide them; simulated but stateful and internally consistent. Maps uses the real OSM embed iframe with an offline fallback.
3. **Generated art instead of assets** — no copyrighted wallpaper/icons; deterministic SVG/canvas art keeps repo self-contained.
4. **`⌘Q`/`⌘H`/`⌘Tab` shown in menus but optionally interceptable** — Chrome reserves some ⌘ combos; non-reserved ones (⌘N/⌘W/⌘T/⌘M/⌘Space…) are intercepted and routed. App switcher bound to Ctrl+Tab instead.
5. **Zoom semantic = fill-screen minus chrome** (real macOS behavior) rather than OS fullscreen API.
6. **Finder "Recents" computed from FS metadata at open**, not a stored folder.
7. Single global settings object shared by CC + Settings app so both mutate the same live system state (same for FS across Finder/TextEdit/Terminal).

## Risks

- **Scale** (~8k lines): cross-file API drift → mitigated by the contract above + final grep pass.
- **backdrop-filter performance** with many windows → blur kept on chrome surfaces only; content panes use lighter translucency.
- **localStorage 5MB cap** → photos generated deterministically in memory, never persisted as dataURLs.
- Browser differences in backdrop-filter → graceful (still translucent colors).
