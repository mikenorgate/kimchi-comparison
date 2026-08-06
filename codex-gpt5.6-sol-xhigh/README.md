# macOS Tahoe Web Desktop

A dependency-free, interactive macOS Tahoe–style desktop built with HTML, CSS, and JavaScript.

## Run

Open `index.html` directly, or serve the folder locally:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Highlights

- Liquid Glass desktop, menu bar, windows, widgets, Dock, and app icons
- Draggable, resizable, minimizable, maximizable, and focus-aware windows
- Finder, Safari, Messages, Mail, Maps, Photos, Phone, Music, Notes, Calendar, Terminal, Weather, Calculator, Clock, App Store, TextEdit, Preview, FaceTime, Settings, Applications, and Trash
- Spotlight (`⌘ Space`), Control Center, Notification Center, contextual menus, lock screen, and keyboard shortcuts
- Stateful Notes stored in local browser storage
- Responsive layout with no external dependencies or network requirements

This is a browser simulation. OS-level actions such as shutdown, phone calls, and filesystem access are represented safely inside the interface.
