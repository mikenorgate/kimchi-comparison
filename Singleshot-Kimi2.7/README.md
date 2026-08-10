# macOS Tahoe Web App

A browser-based recreation of the macOS Tahoe desktop built with vanilla HTML, CSS, and JavaScript.

## Run locally

Open `index.html` directly in any modern browser, or serve the folder with a static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Features

- **Desktop shell**: wallpaper, translucent Menu Bar, Dock, desktop context menu
- **Window manager**: drag, resize, minimize, maximize, close, focus / z-index management
- **Working apps**
  - Finder with folder navigation
  - Safari with address bar and iframe browsing
  - Terminal with `help`, `ls`, `cd`, `pwd`, `cat`, `clear`, `echo`, `whoami`, `date`
  - Calculator with keyboard support
  - Notes with LocalStorage persistence
  - System Settings (appearance, wallpaper, dock position/auto-hide)
- **Shell apps with sample data**: Photos, Music, Mail, Messages

## Notes

- Data is stored only in the browser's `localStorage`.
- External images are loaded from Unsplash and Picsum.
- Some sites block iframe embedding; Safari shows the browser's default error page for those URLs.
