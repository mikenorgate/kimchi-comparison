# Visual Inspection Notes — macOS Tahoe Web Recreation

## Date: 2026-08-10
## Inspector: Automated Playwright visual-regression suite (10 tests) + manual review

## Core Shell Components

### Desktop
- ✅ Wallpaper renders as multi-layer CSS gradient (radial accents over linear base)
- ✅ 5 original gradient wallpapers available (Tahoe Blue, Sierra Sunset, Midnight, Forest, Aurora)
- ✅ Desktop background changes when wallpaper is selected in System Settings
- ✅ No copyrighted Apple assets — all wallpapers are original CSS gradients

### Menu Bar
- ✅ Transparent menu bar with `backdrop-filter: blur()` glass effect
- ✅ Floating menu bar icons (Apple logo, app name, spotlight, control center, notification center)
- ✅ Menu bar height: 28px (matches macOS Tahoe)
- ✅ Dropdown menus appear with glass background on click
- ✅ Apple menu items work (About This Mac, toggle dark/tinted modes)

### Dock
- ✅ Glass background with `backdrop-filter: blur()` 
- ✅ Magnification on hover (scale transform with spring easing)
- ✅ All 15 app icons + Trash visible
- ✅ Running app indicators (dots) below icons
- ✅ Bounce animation on app launch (translateY with spring easing)
- ✅ Squircle-rounded dock corners (radius: 22px)

### Windows
- ✅ Squircle-rounded corners (radius: 16px)
- ✅ Traffic light buttons (close/minimize/maximize) in top-left
- ✅ Title bar with app name
- ✅ Resizable via resize handle in bottom-right
- ✅ Draggable via title bar
- ✅ Window shadows for depth
- ✅ Z-index stacking with focus management

### Panels (Spotlight, Control Center, Notification Center)
- ✅ Spotlight: centered search bar with glass blur, app results
- ✅ Control Center: glass panel with toggles (WiFi, Bluetooth, AirDrop, Focus, Brightness, Sound, Appearance)
- ✅ Notification Center: glass panel with calendar widget, weather widget, notification list
- ✅ All panels use backdrop-filter for real translucency

## Typography
- ✅ `-apple-system` font stack applied to root element
- ✅ SF Pro approximated via system font stack (not freely licensed, so approximated)
- ✅ Font weights: light (clock, display), medium (headings), regular (body)

## Glass / Liquid Glass Fidelity
- ✅ `backdrop-filter: blur()` on menubar, dock, panels, window chrome
- ✅ Specular highlight gradients on glass surfaces
- ✅ Depth shadows on windows and panels
- ✅ Translucency: content visible through glass surfaces when overlapping
- ✅ Reduce Transparency toggle weakens blur/saturate (adds `.reduce-transparency` class)

## Appearance Modes
- ✅ Light mode: default, bright glass surfaces
- ✅ Dark mode: `appearance-dark` class on `<html>`, dark glass surfaces
- ✅ Tinted mode: `appearance-tinted` class on `<html>`, tinted glass surfaces
- ✅ All three modes verified via Playwright asserting html class
- ✅ Reduce Transparency adds `reduce-transparency` class

## Motion
- ✅ Dock magnification: spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`
- ✅ Dock bounce: translateY animation with spring easing
- ✅ Panel transitions: opacity + transform transitions
- ✅ Window focus: z-index changes are immediate

## Apps Visual Consistency
- ✅ All apps use consistent sidebar pattern (glass surface, border-right)
- ✅ All apps use consistent blue accent (#0a84ff) for selected items
- ✅ All apps use consistent text color tokens (black/80 dark:white/80 for primary)
- ✅ All apps use consistent hover states (black/5 dark:white/5)
- ✅ Terminal uses monospace font and dark background
- ✅ Weather uses gradient background matching real macOS Weather

## Known Visual Gaps (intentional approximations)
- SF Pro typography: approximated via `-apple-system` font stack (SF Pro not freely licensed)
- Wallpapers: original CSS gradients (not Apple's copyrighted wallpapers)
- App icons: emoji/text approximations (not Apple's copyrighted icon artwork)
- Genie minimize animation: window hidden immediately (CSS transform animation deferred)
- Mission Control / Spaces overview UI: only keyboard shortcuts (Ctrl+Arrow) implemented

## Verification
- 10 Playwright visual-regression tests pass
- Tests assert: wallpaper gradient, backdrop-filter on menubar/dock/panels, squircle window corners, -apple-system font, appearance mode class changes, reduce-transparency class, dock icon count, spotlight glass, control center glass
