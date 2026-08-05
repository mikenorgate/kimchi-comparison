/* ============ macOS Tahoe web — core OS ============ */
'use strict';

const OS = {
  windows: [],
  zCounter: 100,
  focusedWin: null,
  apps: {},          // registered app definitions, keyed by id
  running: {},       // appId -> [windows]
  settings: {
    dark: false,
    accent: '#0a84ff',
    wallpaper: 'wp-tahoe',
    wifi: true,
    bluetooth: true,
    airdrop: true,
    focus: false,
    brightness: 100,
    volume: 65,
  },
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

/* ---------------- Settings persistence ---------------- */
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('tahoe-settings'));
    if (s) Object.assign(OS.settings, s);
  } catch (e) {}
  applySettings();
}
function saveSettings() {
  localStorage.setItem('tahoe-settings', JSON.stringify(OS.settings));
}
function applySettings() {
  document.body.classList.toggle('dark', OS.settings.dark);
  document.documentElement.style.setProperty('--accent', OS.settings.accent);
  const wp = $('#wallpaper');
  wp.className = '';
  if (OS.settings.wallpaper !== 'wp-tahoe') wp.classList.add(OS.settings.wallpaper);
  wp.style.filter = `brightness(${0.35 + 0.65 * (OS.settings.brightness / 100)})`;
  saveSettings();
}
function setSetting(key, value) {
  OS.settings[key] = value;
  applySettings();
  // live-refresh any open Settings windows
  (OS.running['settings'] || []).forEach(w => w.refresh && w.refresh());
}

/* ---------------- App registry ---------------- */
function registerApp(def) {
  OS.apps[def.id] = def;
}

function launchApp(id, launchArgs) {
  const app = OS.apps[id];
  if (!app) return;
  hideLaunchpad();
  // single-instance apps focus existing window
  const wins = OS.running[id] || [];
  if (wins.length && !app.multiWindow && !launchArgs) {
    const w = wins[0];
    if (w.minimized) restoreWindow(w);
    focusWindow(w);
    return w;
  }
  bounceDockIcon(id);
  return createWindow(app, launchArgs);
}

/* ---------------- Window manager ---------------- */
function createWindow(app, launchArgs) {
  const winEl = el('div', 'window');
  const offset = (OS.windows.length % 8) * 26;
  const w = Math.min(app.width || 720, innerWidth - 80);
  const h = Math.min(app.height || 480, innerHeight - 140);
  winEl.style.width = w + 'px';
  winEl.style.height = h + 'px';
  winEl.style.left = Math.max(10, (innerWidth - w) / 2 + offset - 60) + 'px';
  winEl.style.top = Math.max(40, (innerHeight - h) / 2.4 + offset) + 'px';

  const tb = el('div', 'titlebar');
  const lights = el('div', 'traffic-lights');
  const mkLight = (cls, sym, title) => {
    const b = el('div', 'tl ' + cls);
    b.title = title;
    b.appendChild(el('span', '', sym));
    lights.appendChild(b);
    return b;
  };
  const btnClose = mkLight('tl-close', '×', 'Close');
  const btnMin = mkLight('tl-min', '−', 'Minimize');
  const btnZoom = mkLight('tl-zoom', '+', 'Zoom');
  tb.appendChild(lights);
  const titleEl = el('div', 'title', app.name);
  tb.appendChild(titleEl);
  winEl.appendChild(tb);

  const content = el('div', 'window-content');
  winEl.appendChild(content);

  // resize handles
  ['n','s','e','w','ne','nw','se','sw'].forEach(dir => {
    const hEl = el('div', 'rz rz-' + dir);
    hEl.dataset.dir = dir;
    winEl.appendChild(hEl);
  });

  $('#windows-layer').appendChild(winEl);

  const win = {
    el: winEl, app, appId: app.id,
    titleEl, content,
    minimized: false, maximized: false,
    prevRect: null,
    setTitle(t) { titleEl.textContent = t; },
    close() { closeWindow(win); },
  };

  OS.windows.push(win);
  (OS.running[app.id] = OS.running[app.id] || []).push(win);
  updateDock();

  btnClose.addEventListener('click', e => { e.stopPropagation(); closeWindow(win); });
  btnMin.addEventListener('click', e => { e.stopPropagation(); minimizeWindow(win); });
  btnZoom.addEventListener('click', e => { e.stopPropagation(); zoomWindow(win); });
  tb.addEventListener('dblclick', e => { if (!e.target.closest('.tl')) zoomWindow(win); });

  winEl.addEventListener('mousedown', () => focusWindow(win));
  makeDraggable(win, tb);
  makeResizable(win);

  // mount app UI
  try {
    app.mount(win, launchArgs);
  } catch (err) {
    content.innerHTML = '<div style="padding:30px;opacity:0.6">Failed to open ' + app.name + ': ' + err.message + '</div>';
    console.error(err);
  }

  focusWindow(win);
  return win;
}

function focusWindow(win) {
  if (!win || win.minimized) return;
  OS.focusedWin = win;
  OS.windows.forEach(w => w.el.classList.toggle('focused', w === win));
  win.el.style.zIndex = ++OS.zCounter;
  setMenusForApp(win.app);
}

function closeWindow(win) {
  win.app.unmount && win.app.unmount(win);
  win.el.classList.add('closing');
  setTimeout(() => win.el.remove(), 170);
  OS.windows = OS.windows.filter(w => w !== win);
  OS.running[win.appId] = (OS.running[win.appId] || []).filter(w => w !== win);
  if (!OS.running[win.appId].length) delete OS.running[win.appId];
  if (OS.focusedWin === win) {
    OS.focusedWin = null;
    const top = OS.windows.filter(w => !w.minimized).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
    if (top) focusWindow(top);
    else setMenusForApp(OS.apps.finder);
  }
  updateDock();
}

function minimizeWindow(win) {
  win.el.classList.add('minimizing');
  setTimeout(() => {
    win.el.style.display = 'none';
    win.el.classList.remove('minimizing');
  }, 290);
  win.minimized = true;
  if (OS.focusedWin === win) {
    OS.focusedWin = null;
    const top = OS.windows.filter(w => !w.minimized && w !== win).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
    if (top) focusWindow(top);
  }
  updateDock();
}

function restoreWindow(win) {
  win.minimized = false;
  win.el.style.display = 'flex';
  focusWindow(win);
  updateDock();
}

function zoomWindow(win) {
  if (!win.maximized) {
    win.prevRect = {
      left: win.el.style.left, top: win.el.style.top,
      width: win.el.style.width, height: win.el.style.height,
    };
    win.el.style.left = '6px';
    win.el.style.top = '34px';
    win.el.style.width = (innerWidth - 12) + 'px';
    win.el.style.height = (innerHeight - 40 - 78) + 'px';
    win.maximized = true;
  } else {
    Object.assign(win.el.style, win.prevRect);
    win.maximized = false;
  }
}

function makeDraggable(win, handle) {
  handle.addEventListener('mousedown', e => {
    if (e.target.closest('.tl')) return;
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startL = win.el.offsetLeft, startT = win.el.offsetTop;
    const move = ev => {
      win.el.style.left = (startL + ev.clientX - startX) + 'px';
      win.el.style.top = Math.max(28, startT + ev.clientY - startY) + 'px';
      win.maximized = false;
    };
    const up = () => {
      removeEventListener('mousemove', move);
      removeEventListener('mouseup', up);
    };
    addEventListener('mousemove', move);
    addEventListener('mouseup', up);
  });
}

function makeResizable(win) {
  $$('.rz', win.el).forEach(h => {
    h.addEventListener('mousedown', e => {
      e.preventDefault();
      e.stopPropagation();
      const dir = h.dataset.dir;
      const startX = e.clientX, startY = e.clientY;
      const r = { l: win.el.offsetLeft, t: win.el.offsetTop, w: win.el.offsetWidth, h: win.el.offsetHeight };
      const move = ev => {
        const dx = ev.clientX - startX, dy = ev.clientY - startY;
        let { l, t, w: ww, h: hh } = r;
        if (dir.includes('e')) ww = r.w + dx;
        if (dir.includes('s')) hh = r.h + dy;
        if (dir.includes('w')) { ww = r.w - dx; l = r.l + dx; }
        if (dir.includes('n')) { hh = r.h - dy; t = r.t + dy; }
        if (ww >= 320) { win.el.style.width = ww + 'px'; win.el.style.left = l + 'px'; }
        if (hh >= 200) { win.el.style.height = hh + 'px'; win.el.style.top = Math.max(28, t) + 'px'; }
      };
      const up = () => {
        removeEventListener('mousemove', move);
        removeEventListener('mouseup', up);
      };
      addEventListener('mousemove', move);
      addEventListener('mouseup', up);
    });
  });
}

/* ---------------- Menu bar ---------------- */
let openMenuBtn = null;

function menuData(app) {
  const base = {
    apple: [
      { label: 'About This Mac', action: () => launchApp('about') },
      { sep: true },
      { label: 'System Settings…', action: () => launchApp('settings') },
      { label: 'App Store…', action: () => notify('App Store', 'The App Store is not available in the web demo.', 'ic-settings', '🛍️') },
      { sep: true },
      { label: 'Recent Items', disabled: true },
      { sep: true },
      { label: 'Force Quit…', shortcut: '⌥⌘⎋', action: () => { if (OS.focusedWin) closeWindow(OS.focusedWin); } },
      { sep: true },
      { label: 'Sleep', action: sleep },
      { label: 'Restart…', action: () => { if (confirm('Are you sure you want to restart your computer?')) location.reload(); } },
      { label: 'Shut Down…', action: () => { if (confirm('Are you sure you want to shut down your computer?')) shutDown(); } },
      { sep: true },
      { label: 'Lock Screen', shortcut: '⌃⌘Q', action: lockScreen },
      { label: 'Log Out Mike…', shortcut: '⇧⌘Q', action: lockScreen },
    ],
    appname: [
      { label: 'About ' + app.name, action: () => notify(app.name, app.about || (app.name + ' — part of macOS Tahoe web.'), 'ic-' + app.id, app.glyph) },
      { sep: true },
      { label: 'Settings…', shortcut: '⌘,', action: () => launchApp('settings') },
      { sep: true },
      { label: 'Hide ' + app.name, shortcut: '⌘H', action: () => { (OS.running[app.id] || []).forEach(minimizeWindow); } },
      { label: 'Hide Others', shortcut: '⌥⌘H', action: () => { OS.windows.filter(w => w.appId !== app.id).forEach(minimizeWindow); } },
      { label: 'Show All', action: () => { OS.windows.filter(w => w.minimized).forEach(restoreWindow); } },
      { sep: true },
      { label: 'Quit ' + app.name, shortcut: '⌘Q', action: () => { [...(OS.running[app.id] || [])].forEach(closeWindow); } },
    ],
  };
  const std = {
    File: [
      { label: 'New Window', shortcut: '⌘N', action: () => createWindow(app) },
      { label: 'Close Window', shortcut: '⌘W', action: () => { if (OS.focusedWin) closeWindow(OS.focusedWin); } },
    ],
    Edit: [
      { label: 'Undo', shortcut: '⌘Z', action: () => document.execCommand('undo') },
      { label: 'Redo', shortcut: '⇧⌘Z', action: () => document.execCommand('redo') },
      { sep: true },
      { label: 'Cut', shortcut: '⌘X', action: () => document.execCommand('cut') },
      { label: 'Copy', shortcut: '⌘C', action: () => document.execCommand('copy') },
      { label: 'Paste', shortcut: '⌘V', action: () => document.execCommand('paste') },
      { label: 'Select All', shortcut: '⌘A', action: () => document.execCommand('selectAll') },
    ],
    View: [
      { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: () => { if (OS.focusedWin) zoomWindow(OS.focusedWin); } },
    ],
    Window: [
      { label: 'Minimize', shortcut: '⌘M', action: () => { if (OS.focusedWin) minimizeWindow(OS.focusedWin); } },
      { label: 'Zoom', action: () => { if (OS.focusedWin) zoomWindow(OS.focusedWin); } },
      { sep: true },
      { label: 'Bring All to Front', action: () => { (OS.running[app.id] || []).forEach(w => { if (!w.minimized) w.el.style.zIndex = ++OS.zCounter; }); } },
    ],
    Help: [
      { label: app.name + ' Help', action: () => notify('Help', 'This is a web recreation of macOS Tahoe. Everything you see is HTML, CSS and JavaScript.', 'ic-settings', '❓') },
    ],
  };
  const menus = { ...base };
  const appMenus = app.menus ? app.menus() : {};
  const order = ['File', 'Edit', 'View', ...Object.keys(appMenus).filter(k => !['File','Edit','View','Window','Help'].includes(k)), 'Window', 'Help'];
  order.forEach(name => {
    menus[name] = appMenus[name] || std[name];
  });
  menus._order = order;
  return menus;
}

function setMenusForApp(app) {
  $('.menu-item.app-name').textContent = app.name;
  const holder = $('#app-menus');
  holder.innerHTML = '';
  const menus = menuData(app);
  menus._order.forEach(name => {
    const mi = el('div', 'menu-item', name);
    mi.dataset.menu = name;
    holder.appendChild(mi);
  });
  $('#menubar').dataset.appId = app.id;
}

function closeDropdowns() {
  $('#dropdown-layer').innerHTML = '';
  $$('.menu-item.open').forEach(m => m.classList.remove('open'));
  openMenuBtn = null;
}

function showDropdown(btn) {
  closeDropdowns();
  const appId = $('#menubar').dataset.appId || 'finder';
  const app = OS.apps[appId] || OS.apps.finder;
  const menus = menuData(app);
  const items = menus[btn.dataset.menu];
  if (!items) return;
  btn.classList.add('open');
  openMenuBtn = btn;
  const dd = buildMenuEl(items);
  const rect = btn.getBoundingClientRect();
  dd.style.left = Math.min(rect.left, innerWidth - 260) + 'px';
  dd.style.top = (rect.bottom + 4) + 'px';
  $('#dropdown-layer').appendChild(dd);
}

function buildMenuEl(items) {
  const dd = el('div', 'dropdown');
  items.forEach(item => {
    if (item.sep) { dd.appendChild(el('div', 'dd-sep')); return; }
    const row = el('div', 'dd-item' + (item.disabled ? ' disabled' : '') + (item.checked ? ' checked' : ''));
    row.appendChild(el('span', '', item.label));
    if (item.shortcut) row.appendChild(el('span', 'dd-shortcut', item.shortcut));
    if (!item.disabled && item.action) {
      row.addEventListener('click', () => { closeDropdowns(); hideContextMenu(); item.action(); });
    }
    dd.appendChild(row);
  });
  return dd;
}

/* ---------------- Context menu ---------------- */
function showContextMenu(x, y, items) {
  const cm = $('#context-menu');
  cm.innerHTML = '';
  items.forEach(item => {
    if (item.sep) { cm.appendChild(el('div', 'dd-sep')); return; }
    const row = el('div', 'dd-item' + (item.disabled ? ' disabled' : ''));
    row.appendChild(el('span', '', item.label));
    if (!item.disabled && item.action) row.addEventListener('click', () => { hideContextMenu(); item.action(); });
    cm.appendChild(row);
  });
  cm.classList.remove('hidden');
  const w = cm.offsetWidth, h = cm.offsetHeight;
  cm.style.left = Math.min(x, innerWidth - w - 8) + 'px';
  cm.style.top = Math.min(y, innerHeight - h - 8) + 'px';
}
function hideContextMenu() { $('#context-menu').classList.add('hidden'); }

/* ---------------- Dock ---------------- */
const DOCK_APPS = ['finder', 'launchpad', 'safari', 'messages', 'mail', 'maps', 'photos', 'calendar', 'notes', 'music', 'calculator', 'terminal', 'textedit', 'settings'];

function buildDock() {
  const dock = $('#dock');
  dock.innerHTML = '';
  DOCK_APPS.forEach(id => dock.appendChild(dockItem(id)));
  dock.appendChild(el('div', 'dock-sep'));
  dock.appendChild(dockItem('trash'));
  updateDock();

  // magnification
  dock.addEventListener('mousemove', e => {
    $$('.dock-item', dock).forEach(item => {
      const r = item.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      item.classList.toggle('magnify-2', d < 34);
      item.classList.toggle('magnify-1', d >= 34 && d < 78);
    });
  });
  dock.addEventListener('mouseleave', () => {
    $$('.dock-item', dock).forEach(item => item.classList.remove('magnify-1', 'magnify-2'));
  });
}

function dockItem(id) {
  const app = OS.apps[id];
  const item = el('div', 'dock-item');
  item.dataset.app = id;
  const icon = el('div', 'dock-icon');
  icon.appendChild(appIconEl(id));
  item.appendChild(icon);
  item.appendChild(el('div', 'dock-label', app ? app.name : id));
  item.appendChild(el('div', 'dock-dot'));
  item.addEventListener('click', () => {
    if (id === 'launchpad') { toggleLaunchpad(); return; }
    const wins = OS.running[id] || [];
    const minimized = wins.filter(w => w.minimized);
    if (minimized.length && wins.length === minimized.length) restoreWindow(minimized[0]);
    else launchApp(id);
  });
  item.addEventListener('contextmenu', e => {
    e.preventDefault();
    const wins = OS.running[id] || [];
    const items = [
      ...wins.map(w => ({ label: (w.minimized ? '◇ ' : '● ') + w.titleEl.textContent, action: () => { restoreWindow(w); } })),
      ...(wins.length ? [{ sep: true }] : []),
      { label: wins.length ? 'Quit' : 'Open', action: () => wins.length ? [...wins].forEach(closeWindow) : launchApp(id) },
    ];
    showContextMenu(e.clientX, e.clientY, items);
  });
  return item;
}

function appIconEl(id) {
  const app = OS.apps[id];
  return el('div', 'app-icon ic-' + id, app ? app.glyph : '❔');
}

function updateDock() {
  $$('.dock-item').forEach(item => {
    item.classList.toggle('running', !!(OS.running[item.dataset.app] || []).length);
  });
}

function bounceDockIcon(id) {
  const item = $(`.dock-item[data-app="${id}"]`);
  if (!item) return;
  item.classList.add('bounce');
  setTimeout(() => item.classList.remove('bounce'), 1100);
}

/* ---------------- Launchpad ---------------- */
function toggleLaunchpad() {
  const lp = $('#launchpad');
  if (lp.classList.contains('hidden')) {
    lp.classList.remove('hidden');
    renderLaunchpad('');
    const inp = $('#launchpad-search');
    inp.value = '';
    inp.focus();
  } else hideLaunchpad();
}
function hideLaunchpad() { $('#launchpad').classList.add('hidden'); }
function renderLaunchpad(filter) {
  const grid = $('#launchpad-grid');
  grid.innerHTML = '';
  Object.values(OS.apps)
    .filter(a => !a.hidden && a.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(a => {
      const item = el('div', 'lp-app');
      const ic = el('div', 'lp-icon');
      ic.appendChild(appIconEl(a.id));
      item.appendChild(ic);
      item.appendChild(el('div', 'lp-name', a.name));
      item.addEventListener('click', () => { hideLaunchpad(); launchApp(a.id); });
      grid.appendChild(item);
    });
}

/* ---------------- Control Center ---------------- */
function buildControlCenter() {
  const cc = $('#control-center');
  cc.innerHTML = '';
  const s = OS.settings;
  const toggleTile = (key, icon, title, subOn, subOff) => {
    const t = el('div', 'cc-tile');
    const row = el('div', 'cc-toggle-row');
    const orb = el('div', 'cc-orb' + (s[key] ? ' on' : ''), icon);
    const col = el('div', 'col');
    col.appendChild(el('div', 'cc-title', title));
    col.appendChild(el('div', 'cc-sub', s[key] ? subOn : subOff));
    row.appendChild(orb); row.appendChild(col);
    t.appendChild(row);
    t.addEventListener('click', () => { setSetting(key, !s[key]); buildControlCenter(); });
    return t;
  };
  cc.appendChild(toggleTile('wifi', '📶', 'Wi-Fi', 'Home Network', 'Off'));
  cc.appendChild(toggleTile('bluetooth', '🔷', 'Bluetooth', 'On', 'Off'));
  cc.appendChild(toggleTile('airdrop', '📡', 'AirDrop', 'Contacts Only', 'Off'));
  cc.appendChild(toggleTile('focus', '🌙', 'Focus', 'Do Not Disturb', 'Off'));

  const dm = el('div', 'cc-tile wide');
  const dmRow = el('div', 'cc-toggle-row');
  const dmOrb = el('div', 'cc-orb' + (s.dark ? ' on' : ''), s.dark ? '🌘' : '☀️');
  const dmCol = el('div', 'col');
  dmCol.appendChild(el('div', 'cc-title', 'Appearance'));
  dmCol.appendChild(el('div', 'cc-sub', s.dark ? 'Dark' : 'Light'));
  dmRow.appendChild(dmOrb); dmRow.appendChild(dmCol);
  dm.appendChild(dmRow);
  dm.addEventListener('click', () => { setSetting('dark', !s.dark); buildControlCenter(); });
  cc.appendChild(dm);

  const sliderTile = (key, label) => {
    const t = el('div', 'cc-tile wide');
    t.appendChild(el('div', 'cc-label', label));
    const sl = el('input', 'cc-slider');
    sl.type = 'range'; sl.min = key === 'brightness' ? 20 : 0; sl.max = 100; sl.value = s[key];
    sl.addEventListener('input', () => setSetting(key, +sl.value));
    t.appendChild(sl);
    return t;
  };
  cc.appendChild(sliderTile('brightness', 'Display'));
  cc.appendChild(sliderTile('volume', 'Sound'));
}
function toggleControlCenter() {
  const cc = $('#control-center');
  if (cc.classList.contains('hidden')) { buildControlCenter(); cc.classList.remove('hidden'); }
  else cc.classList.add('hidden');
}

/* ---------------- Spotlight ---------------- */
let spotIndex = 0;
function toggleSpotlight() {
  const sp = $('#spotlight');
  if (sp.classList.contains('hidden')) {
    sp.classList.remove('hidden');
    const inp = $('#spotlight-input');
    inp.value = '';
    renderSpotlight('');
    inp.focus();
  } else hideSpotlight();
}
function hideSpotlight() { $('#spotlight').classList.add('hidden'); }

function spotlightResults(q) {
  q = q.trim().toLowerCase();
  const res = [];
  Object.values(OS.apps).filter(a => !a.hidden).forEach(a => {
    if (!q || a.name.toLowerCase().includes(q)) res.push({ icon: a.id, title: a.name, sub: 'Application', action: () => launchApp(a.id) });
  });
  if (q) {
    // simple calculator in spotlight
    if (/^[\d\s+\-*/().%]+$/.test(q)) {
      try {
        const v = Function('"use strict";return (' + q.replace(/%/g, '/100') + ')')();
        if (typeof v === 'number' && isFinite(v)) res.unshift({ icon: 'calculator', title: q + ' = ' + (+v.toFixed(8)), sub: 'Calculator', action: () => launchApp('calculator') });
      } catch (e) {}
    }
    res.push({ icon: 'safari', title: 'Search the web for “' + q + '”', sub: 'Safari', action: () => launchApp('safari', { url: 'https://www.bing.com/search?q=' + encodeURIComponent(q) }) });
  }
  return res.slice(0, 9);
}

function renderSpotlight(q) {
  const box = $('#spotlight-results');
  box.innerHTML = '';
  spotIndex = 0;
  spotlightResults(q).forEach((r, i) => {
    const row = el('div', 'spot-result' + (i === 0 ? ' active' : ''));
    const ic = el('div', 'sr-icon');
    ic.appendChild(appIconEl(r.icon));
    row.appendChild(ic);
    const col = el('div', 'col');
    col.appendChild(el('div', 'sr-title', r.title));
    col.appendChild(el('div', 'sr-sub', r.sub));
    row.appendChild(col);
    row.addEventListener('click', () => { hideSpotlight(); r.action(); });
    row.addEventListener('mousemove', () => {
      $$('.spot-result').forEach(x => x.classList.remove('active'));
      row.classList.add('active');
      spotIndex = i;
    });
    box.appendChild(row);
  });
}

/* ---------------- Notifications ---------------- */
function notify(title, body, iconClass, glyph) {
  const n = el('div', 'notification');
  const ic = el('div', 'nt-icon');
  ic.appendChild(el('div', 'app-icon ' + (iconClass || 'ic-settings'), glyph || '💬'));
  n.appendChild(ic);
  const col = el('div', 'col');
  col.appendChild(el('div', 'nt-title', title));
  col.appendChild(el('div', 'nt-body', body));
  n.appendChild(col);
  $('#notifications').appendChild(n);
  n.addEventListener('click', () => n.remove());
  setTimeout(() => {
    n.style.transition = 'opacity 0.4s, transform 0.4s';
    n.style.opacity = '0';
    n.style.transform = 'translateX(40px)';
    setTimeout(() => n.remove(), 420);
  }, 5000);
}

/* ---------------- Sleep / Lock / Shutdown ---------------- */
function sleep() {
  const ov = $('#sleep-overlay');
  ov.classList.remove('hidden');
  requestAnimationFrame(() => ov.classList.add('awakeable'));
  const wake = () => {
    ov.classList.remove('awakeable');
    setTimeout(() => ov.classList.add('hidden'), 850);
    ov.removeEventListener('click', wake);
    removeEventListener('keydown', wake);
  };
  setTimeout(() => {
    ov.addEventListener('click', wake);
    addEventListener('keydown', wake, { once: true });
  }, 900);
}

function lockScreen() {
  const ls = $('#lock-screen');
  ls.classList.remove('hidden');
  updateLockClock();
}
function updateLockClock() {
  const now = new Date();
  $('.lock-time').textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  $('.lock-date').textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function shutDown() {
  const ov = $('#sleep-overlay');
  ov.classList.remove('hidden');
  requestAnimationFrame(() => ov.classList.add('awakeable'));
  setTimeout(() => {
    ov.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#666;font-size:14px">Your Mac is shut down. Click anywhere to boot.</div>';
    ov.addEventListener('click', () => location.reload(), { once: true });
  }, 1000);
}

/* ---------------- Clock ---------------- */
function tickClock() {
  const now = new Date();
  $('#status-clock').textContent =
    now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + '  ' +
    now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (!$('#lock-screen').classList.contains('hidden')) updateLockClock();
}

/* ---------------- Desktop icons ---------------- */
const desktopFiles = [
  { name: 'Macintosh HD', glyph: '💽', open: () => launchApp('finder', { path: '/' }) },
  { name: 'Projects', glyph: '📁', open: () => launchApp('finder', { path: '/Users/mike/Projects' }) },
  { name: 'ReadMe.txt', glyph: '📄', open: () => launchApp('textedit', { file: '/Users/mike/Desktop/ReadMe.txt' }) },
];

function buildDesktopIcons() {
  const holder = $('#desktop-icons');
  holder.innerHTML = '';
  desktopFiles.forEach(f => {
    const ic = el('div', 'desktop-icon');
    ic.appendChild(el('div', 'di-glyph', f.glyph));
    ic.appendChild(el('div', 'di-label', f.name));
    ic.addEventListener('click', e => {
      e.stopPropagation();
      $$('.desktop-icon').forEach(x => x.classList.remove('selected'));
      ic.classList.add('selected');
    });
    ic.addEventListener('dblclick', f.open);
    holder.appendChild(ic);
  });
}

/* ---------------- Global events ---------------- */
function initGlobalEvents() {
  // menubar clicks
  $('#menubar-left').addEventListener('mousedown', e => {
    const mi = e.target.closest('.menu-item');
    if (!mi) return;
    e.preventDefault();
    if (openMenuBtn === mi) closeDropdowns();
    else showDropdown(mi);
  });
  $('#menubar-left').addEventListener('mouseover', e => {
    const mi = e.target.closest('.menu-item');
    if (mi && openMenuBtn && openMenuBtn !== mi) showDropdown(mi);
  });

  $('#status-cc').addEventListener('click', toggleControlCenter);
  $('#status-spotlight').addEventListener('click', toggleSpotlight);
  $('#status-wifi').addEventListener('click', e => {
    showContextMenu(e.clientX, 30, [
      { label: 'Wi-Fi: ' + (OS.settings.wifi ? 'On' : 'Off'), disabled: true },
      { sep: true },
      { label: (OS.settings.wifi ? 'Turn Wi-Fi Off' : 'Turn Wi-Fi On'), action: () => setSetting('wifi', !OS.settings.wifi) },
      { label: 'Home Network ✓', action: () => {} },
      { sep: true },
      { label: 'Network Settings…', action: () => launchApp('settings') },
    ]);
  });
  $('#status-battery').addEventListener('click', e => {
    showContextMenu(e.clientX, 30, [
      { label: 'Battery: 100%', disabled: true },
      { label: 'Power Source: Web Browser', disabled: true },
      { sep: true },
      { label: 'Battery Settings…', action: () => launchApp('settings') },
    ]);
  });

  // dismiss layers
  addEventListener('mousedown', e => {
    if (!e.target.closest('.dropdown') && !e.target.closest('.menu-item')) closeDropdowns();
    if (!e.target.closest('#context-menu')) hideContextMenu();
    if (!e.target.closest('#control-center') && !e.target.closest('#status-cc')) $('#control-center').classList.add('hidden');
    if (!e.target.closest('.desktop-icon')) $$('.desktop-icon').forEach(x => x.classList.remove('selected'));
  });

  // spotlight interactions
  $('#spotlight').addEventListener('mousedown', e => { if (e.target.id === 'spotlight') hideSpotlight(); });
  $('#spotlight-input').addEventListener('input', e => renderSpotlight(e.target.value));
  $('#spotlight-input').addEventListener('keydown', e => {
    const rows = $$('.spot-result');
    if (e.key === 'Escape') hideSpotlight();
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      spotIndex = (spotIndex + (e.key === 'ArrowDown' ? 1 : rows.length - 1)) % Math.max(rows.length, 1);
      rows.forEach((r, i) => r.classList.toggle('active', i === spotIndex));
      rows[spotIndex] && rows[spotIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      const q = $('#spotlight-input').value;
      const r = spotlightResults(q)[spotIndex];
      if (r) { hideSpotlight(); r.action(); }
    }
  });

  // launchpad
  $('#launchpad').addEventListener('mousedown', e => { if (e.target.id === 'launchpad') hideLaunchpad(); });
  $('#launchpad-search').addEventListener('input', e => renderLaunchpad(e.target.value));

  // lock screen
  $('.lock-unlock').addEventListener('click', () => $('#lock-screen').classList.add('hidden'));

  // desktop right-click
  $('#desktop').addEventListener('contextmenu', e => {
    if (e.target.closest('.window') || e.target.closest('#dock') || e.target.closest('#menubar') || e.target.closest('.dock-item')) return;
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, [
      { label: 'New Folder', action: () => { desktopFiles.push({ name: 'untitled folder', glyph: '📁', open: () => launchApp('finder') }); buildDesktopIcons(); } },
      { sep: true },
      { label: 'Change Wallpaper…', action: () => launchApp('settings', { pane: 'wallpaper' }) },
      { label: 'Edit Widgets…', disabled: true },
      { sep: true },
      { label: 'Use Stacks', disabled: true },
      { label: 'Show View Options', action: () => launchApp('settings') },
    ]);
  });

  // keyboard shortcuts
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.code === 'Space') { e.preventDefault(); toggleSpotlight(); return; }
    if (e.key === 'Escape') { hideSpotlight(); hideLaunchpad(); closeDropdowns(); hideContextMenu(); return; }
    if (!(e.metaKey || e.ctrlKey)) return;
    const w = OS.focusedWin;
    if (e.key === 'w' && w) { e.preventDefault(); closeWindow(w); }
    else if (e.key === 'm' && w) { e.preventDefault(); minimizeWindow(w); }
    else if (e.key === 'q' && w) { e.preventDefault(); [...(OS.running[w.appId] || [])].forEach(closeWindow); }
  });

  setInterval(tickClock, 1000);
  tickClock();
}
