# macOS Tahoe Web Recreation — Manual QA Checklist

## Phase 2: Desktop Shell and Window Manager

### Desktop & Wallpaper
- [x] Page loads without errors; full-screen desktop visible
- [x] Wallpaper renders with Tahoe-style gradient
- [x] Desktop fills the viewport and has no scrollbars

### Menu Bar
- [x] Menu Bar is fixed at the top with glass blur
- [x] Apple menu opens on hover/click and shows menu items
- [x] Active app name appears when a window is focused
- [x] Status icons (WiFi, Battery, Clock) render on the right
- [x] Clock updates every second

### Dock
- [x] Dock renders centered at the bottom
- [x] All registered apps appear as icons in the Dock
- [x] Clicking a Dock icon opens a new window
- [x] Running indicator (dot) appears under open apps
- [x] Active indicator ring appears around the focused app's icon
- [x] Clicking a running app focuses its existing window

### Window Manager
- [x] New windows open centered with slight cascade for same app
- [x] Windows render with title bar and traffic lights
- [x] Close button closes the window
- [x] Minimize button hides the window
- [x] Maximize button expands to fill viewport (minus menu bar)
- [x] Restore button returns window to previous size/position
- [x] Dragging the title bar moves the window
- [x] Dragging the bottom-right resize handle resizes the window
- [x] Clicking a window brings it to the front and focuses it
- [x] Multiple windows stack correctly by z-order

### Integration
- [x] TypeScript compiles without errors (`pnpm typecheck`)
- [x] Production build succeeds (`pnpm build`)
- [x] Unit tests pass (`pnpm test`)

## Phase 7: App Catalog Verification

### Core Apps
- [x] Finder launches and shows mocked folder hierarchy with sidebar, icon/list views, and selection
- [x] System Settings launches and shows settings categories with toggles/checkboxes updating UI state
- [x] Safari launches with mocked browser chrome (address bar, tabs, toolbar) and displays mocked pages
- [x] Terminal launches and accepts typed commands, echoing mocked command output
- [x] Calculator launches and performs basic arithmetic operations (+, −, ×, ÷, clear, equals)
- [x] Notes launches, creates, edits, and deletes notes in session memory

### Productivity Apps
- [x] Mail launches from the Dock with inbox, folders, compose, and reading pane
- [x] Messages launches from the Dock with conversation list and message sending
- [x] Calendar launches and shows a navigable month grid with events
- [x] Reminders launches and shows reminder lists with completion toggles
- [x] Contacts launches and shows contact groups, list, detail view, and add form
- [x] Notes launches and supports creating/editing/deleting notes

### Media & Creativity Apps
- [x] Photos launches and shows albums, photo grid, and image viewer
- [x] Music launches and shows library, playback controls, and track navigation
- [x] TV launches and shows categories, watchlist, and item detail
- [x] Podcasts launches and shows library, episodes, and playback controls
- [x] Books launches and shows collections, book grid, and reader view
- [x] Freeform launches and shows canvas, sticky notes, shapes, and toolbar actions

### Information & Utility Apps
- [x] Maps launches with a location list, search filter, and detail view
- [x] Weather launches and shows current conditions and forecast toggle (C/F)
- [x] Clock launches and shows world clocks, alarms, timers, and stopwatch
- [x] FaceTime launches with simulated call list, keypad, and in-call timer
- [x] News launches with topic tabs, article list, and article detail
- [x] Stocks launches with watchlist, stock detail, and search/filter
- [x] Home launches with rooms and accessory toggles for lights/locks/thermostats
- [x] Voice Memos launches with recording list, playback controls, and waveform
- [x] Passwords launches with credential list, categories, search, and reveal/hide password
- [x] App Store launches with storefront hero, category tabs, app grid, and detail modal

### Dock & Applications Folder
- [x] Every registered app appears in the Dock and can be opened by clicking its icon
- [x] Every registered app has a corresponding `.app` entry in Finder's Applications folder
- [x] Spotlight opens from the Dock and can be used to search registered apps
