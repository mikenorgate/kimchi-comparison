// ===================================================================
// App registry — apps register themselves here
// ===================================================================
const registry = new Map();

export function registerApp(app) {
  registry.set(app.id, app);
}

export function getApp(id) { return registry.get(id); }
export function allApps() { return [...registry.values()]; }

export const dockApps = [
  "finder", "launchpad", "safari", "mail", "messages", "maps", "photos",
  "notes", "reminders", "calendar", "music", "podcast", "appstore",
  "terminal", "textedit", "calculator", "clock", "weather", "settings", "trash",
];
