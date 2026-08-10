// App registry — central catalog. Each app registers its metadata + launcher.
import { APP_ICONS } from './icons.js';
import * as wm from './wm.js';
import { bus } from './store.js';

// Each app: { id, name, icon, launch(opts) -> window, menus?, fileMenu?() }
// Apps are lazily imported on first launch to keep boot fast.
const DEFS = [
  { id:'finder',     name:'Finder',     icon:APP_ICONS.finder,     mod:'./apps/finder.js' },
  { id:'safari',     name:'Safari',     icon:APP_ICONS.safari,     mod:'./apps/safari.js' },
  { id:'mail',       name:'Mail',       icon:APP_ICONS.mail,       mod:'./apps/mail.js' },
  { id:'messages',   name:'Messages',   icon:APP_ICONS.messages,   mod:'./apps/messages.js' },
  { id:'notes',      name:'Notes',      icon:APP_ICONS.notes,      mod:'./apps/notes.js' },
  { id:'calendar',   name:'Calendar',   icon:APP_ICONS.calendar,   mod:'./apps/calendar.js' },
  { id:'music',      name:'Music',      icon:APP_ICONS.music,      mod:'./apps/music.js' },
  { id:'photos',     name:'Photos',     icon:APP_ICONS.photos,     mod:'./apps/photos.js' },
  { id:'maps',       name:'Maps',       icon:APP_ICONS.maps,       mod:'./apps/maps.js' },
  { id:'weather',    name:'Weather',    icon:APP_ICONS.weather,    mod:'./apps/weather.js' },
  { id:'terminal',   name:'Terminal',   icon:APP_ICONS.terminal,   mod:'./apps/terminal.js' },
  { id:'calculator', name:'Calculator', icon:APP_ICONS.calculator, mod:'./apps/calculator.js' },
  { id:'textedit',   name:'TextEdit',   icon:APP_ICONS.textedit,   mod:'./apps/textedit.js' },
  { id:'settings',   name:'System Settings', icon:APP_ICONS.settings, mod:'./apps/settings.js' },
  { id:'appstore',   name:'App Store',  icon:APP_ICONS.appstore,   mod:'./apps/appstore.js' },
  { id:'clock',      name:'Clock',      icon:APP_ICONS.clock,      mod:'./apps/clock.js' },
];

const cache = new Map();   // id -> loaded module

export const APPS = DEFS.map(d => ({ id:d.id, name:d.name, icon:d.icon }));

async function load(id) {
  if (cache.has(id)) return cache.get(id);
  const def = DEFS.find(d => d.id === id);
  if (!def) return null;
  const mod = await import(def.mod);
  cache.set(id, mod);
  return mod;
}

// Launch an app: load module, call its mount() into a window.
export async function launchApp(id, opts = {}) {
  const def = DEFS.find(d => d.id === id);
  if (!def) { console.warn('Unknown app', id); return null; }
  const mod = await load(id);
  if (!mod || typeof mod.mount !== 'function') { console.warn('App has no mount()', id); return null; }
  const app = { id: def.id, name: def.name, icon: def.icon, fileMenu: mod.fileMenu };
  // single-instance apps: focus existing
  const single = mod.singleInstance !== false;  // default single
  if (single) {
    const ex = wm.findAppWindow(def.id);
    if (ex) { if (ex.minimized) wm.restoreWindow(ex.id); else wm.focusWindow(ex.id); return ex; }
  }
  const cfg = (mod.windowConfig || { width:760, height:500 });
  const rec = wm.createWindow({
    app,
    title: def.name,
    width: cfg.width, height: cfg.height,
    x: opts.x, y: opts.y,
    single,
    content: async (el) => {
      try { await mod.mount(el, app, { bus, wm }); } catch (e) { console.error('mount failed', id, e); el.innerHTML = `<div style="padding:20px;color:#ff5a5a">Failed to launch ${def.name}: ${e.message}</div>`; }
    },
    menus: mod.menus ? mod.menus(app) : null,
    onClose: mod.onUnmount || null,
  });
  // expose menus live (so app can update them)
  if (mod.menus) rec.menus = mod.menus(app);
  return rec;
}

export function activeAppMenus() {
  const win = wm.activeWindow();
  if (!win) return null;
  return win.menus || null;
}
