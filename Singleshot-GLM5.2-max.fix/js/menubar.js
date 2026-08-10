// Menu bar + dropdown menu system — Tahoe transparent glass style.
import { bus, getState, setState } from './store.js';
import { glyph } from './icons.js';
import * as wm from './wm.js';
import { APPS, launchApp } from './appregistry.js';

const menuBar = () => document.getElementById('menu-bar');
const ddLayer = () => document.getElementById('menu-dropdown-layer');

let openMenuName = null;

// ---- Apple menu definition ----
function appleMenu() {
  return [
    { label: 'About This Mac', action: () => launchApp('settings') },
    { sep: true },
    { label: 'System Settings…', shortcut: '⌘,', action: () => launchApp('settings') },
    { label: 'App Store…', action: () => launchApp('appstore') },
    { sep: true },
    { label: 'Sleep', action: () => bus.emit('system:sleep') },
    { label: 'Restart…', action: () => bus.emit('system:restart') },
    { label: 'Shut Down…', action: () => bus.emit('system:shutdown') },
    { label: 'Lock Screen', shortcut: '⌃⌘Q', action: () => bus.emit('system:lock') },
    { label: 'Log Out…', shortcut: '⇧⌘Q', action: () => bus.emit('system:logout') },
  ];
}

// Common menus that apply to most apps (with app overrides possible).
function defaultAppMenus(app) {
  return [
    { name: app.name, bold: true, items: [
      { label: 'About ' + app.name, action: () => launchApp('settings') },
      { sep: true },
      { label: 'Hide ' + app.name, shortcut: '⌘H', action: () => { const w = wm.findAppWindow(app.id); if (w) wm.minimizeWindow(w.id); } },
      { label: 'Hide Others', shortcut: '⌥⌘H', action: () => {} },
      { sep: true },
      { label: 'Quit ' + app.name, shortcut: '⌘Q', action: () => { const w = wm.findAppWindow(app.id); if (w) wm.closeWindow(w.id); } },
    ]},
    { name: 'File', items: (app.fileMenu?.() || defaultFileMenu(app)) },
    { name: 'Edit', items: defaultEditMenu() },
    { name: 'View', items: defaultViewMenu() },
    { name: 'Window', items: [
      { label: 'Minimize', shortcut: '⌘M', action: () => { const w = wm.findAppWindow(app.id); if (w) wm.minimizeWindow(w.id); } },
      { label: 'Zoom', action: () => { const w = wm.findAppWindow(app.id); if (w) wm.toggleMaximize(w.id); } },
      { sep: true },
      { label: 'Bring All to Front', action: () => { const w = wm.findAppWindow(app.id); if (w) wm.focusWindow(w.id); } },
    ]},
    { name: 'Help', items: [
      { label: app.name + ' Help', action: () => {} },
    ]},
  ];
}

function defaultFileMenu(app) {
  return [
    { label: 'New Window', shortcut: '⌘N', action: () => launchApp(app.id), noCheck: true },
    { label: 'New', shortcut: '⌘N', action: () => bus.emit('app:file:new', app.id), noCheck: true },
    { label: 'Open…', shortcut: '⌘O', action: () => bus.emit('app:file:open', app.id), noCheck: true },
    { sep: true },
    { label: 'Close', shortcut: '⌘W', action: () => { const w = wm.findAppWindow(app.id); if (w) wm.closeWindow(w.id); }, noCheck: true },
    { label: 'Save', shortcut: '⌘S', action: () => bus.emit('app:file:save', app.id), noCheck: true },
    { sep: true },
    { label: 'Print…', shortcut: '⌘P', action: () => window.print(), noCheck: true },
  ];
}

function defaultEditMenu() {
  return [
    { label: 'Undo', shortcut: '⌘Z', action: () => document.execCommand('undo'), noCheck: true },
    { label: 'Redo', shortcut: '⇧⌘Z', action: () => document.execCommand('redo'), noCheck: true },
    { sep: true },
    { label: 'Cut', shortcut: '⌘X', action: () => document.execCommand('cut'), noCheck: true },
    { label: 'Copy', shortcut: '⌘C', action: () => document.execCommand('copy'), noCheck: true },
    { label: 'Paste', shortcut: '⌘V', action: () => document.execCommand('paste'), noCheck: true },
    { sep: true },
    { label: 'Select All', shortcut: '⌘A', action: () => document.execCommand('selectAll'), noCheck: true },
  ];
}

function defaultViewMenu() {
  const s = getState();
  return [
    { label: 'Toggle Dark Mode', checked: s.appearance === 'dark', action: () => setState({ appearance: s.appearance === 'dark' ? 'light' : 'dark' }) },
    { label: 'Toggle Menu Bar Background', checked: s.menubarOpaque, action: () => setState({ menubarOpaque: !s.menubarOpaque }) },
    { sep: true },
    { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }, noCheck: true },
  ];
}

// Get menus for the active app (falling back to defaults).
function currentMenus() {
  const win = wm.activeWindow();
  if (win && win.menus) return win.menus;
  if (win && win.app) return defaultAppMenus(win.app);
  // Finder is the "always running" app when nothing is focused.
  const finder = APPS.find(a => a.id === 'finder');
  return defaultAppMenus(finder);
}

// ---- Rendering ----
export function renderMenuBar() {
  const mb = menuBar();
  const menus = currentMenus();

  let html = `<div class="mb-item mb-app" data-menu="__apple__">${glyph('apple',16)}</div>`;
  for (const m of menus) {
    html += `<div class="mb-item" data-menu="${m.name}">${m.name}</div>`;
  }
  html += `<div class="mb-spacer"></div>`;
  html += `<div class="mb-right" id="mb-right"></div>`;
  mb.innerHTML = html;
  renderRightSide();

  // wire click + hover
  mb.querySelectorAll('.mb-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = item.dataset.menu;
      if (openMenuName === name) { closeMenu(); return; }
      openMenu(name);
    });
    item.addEventListener('mouseenter', () => {
      if (openMenuName) {
        const name = item.dataset.menu;
        if (name !== openMenuName) openMenu(name);
      }
    });
  });
}

function renderRightSide() {
  const s = getState();
  const right = document.getElementById('mb-right');
  if (!right) return;
  const now = new Date();
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`;
  const timeStr = now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});
  const batPct = Math.round((navigator.getBattery ? 100 : 100));  // visual
  right.innerHTML = `
    <div class="mb-item" data-cc="battery">${glyph('battery',17)}<span style="font-size:11px">${batPct}%</span></div>
    <div class="mb-item" data-cc="wifi" style="${s.wifi?'':'opacity:.4'}">${glyph('wifi',17)}</div>
    <div class="mb-item" data-cc="search">${glyph('search',17)}</div>
    <div class="mb-item" data-cc="control">${glyph('control',17)}</div>
    <div class="mb-item mb-clock">${dateStr}  ${timeStr}</div>
  `;
  right.querySelector('[data-cc="search"]').addEventListener('click', (e) => { e.stopPropagation(); bus.emit('spotlight:open'); });
  right.querySelector('[data-cc="control"]').addEventListener('click', (e) => { e.stopPropagation(); bus.emit('cc:toggle'); });
  right.querySelector('[data-cc="wifi"]').addEventListener('click', (e) => { e.stopPropagation(); setState({ wifi: !s.wifi }); });
  right.querySelector('[data-cc="battery"]').addEventListener('click', (e) => { e.stopPropagation(); bus.emit('cc:toggle'); });
}

// ---- Menu open/close ----
function openMenu(name) {
  closeMenu();
  openMenuName = name;
  const mb = menuBar();
  const items = mb.querySelectorAll('.mb-item');
  let trigger = null;
  items.forEach(i => { const on = i.dataset.menu === name; i.classList.toggle('active', on); if (on) trigger = i; });
  if (!trigger) return;

  let menuItems;
  if (name === '__apple__') menuItems = appleMenu();
  else {
    const menus = currentMenus();
    const m = menus.find(x => x.name === name);
    if (!m) return;
    menuItems = typeof m.items === 'function' ? m.items() : m.items;
  }
  if (!menuItems || menuItems.length === 0) return;

  const dd = document.createElement('div');
  dd.className = 'menu-dropdown';
  const rect = trigger.getBoundingClientRect();
  dd.style.left = Math.max(8, rect.left) + 'px';
  dd.style.top = (rect.bottom + 2) + 'px';
  dd.innerHTML = renderMenuItems(menuItems);
  ddLayer().appendChild(dd);

  // position: if overflow right, shift left
  requestAnimationFrame(() => {
    const dr = dd.getBoundingClientRect();
    if (dr.right > window.innerWidth - 6) dd.style.left = Math.max(6, window.innerWidth - dr.width - 6) + 'px';
  });

  dd.querySelectorAll('.menu-item').forEach((mi) => {
    const idx = +mi.dataset.idx;
    const it = menuItems[idx];
    if (!it || it.disabled) return;
    mi.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
      if (typeof it.action === 'function') it.action();
    });
  });

  // click outside closes
  setTimeout(() => {
    document.addEventListener('click', closeMenu, { once: true });
  }, 0);
}

function renderMenuItems(items) {
  let i = -1;
  return items.map((it) => {
    if (it.sep) return '<div class="menu-sep"></div>';
    i++;
    const cls = ['menu-item'];
    if (it.checked) cls.push('checked'); else cls.push('no-check');
    if (it.disabled) cls.push('disabled');
    return `<div class="${cls.join(' ')}" data-idx="${i}"><span class="mi-label">${it.label}</span>${it.shortcut ? `<span class="mi-shortcut">${it.shortcut}</span>`:''}</div>`;
  }).join('');
}

function closeMenu() {
  openMenuName = null;
  menuBar().querySelectorAll('.mb-item').forEach(i => i.classList.remove('active'));
  ddLayer().innerHTML = '';
}

// ---- Submenu support (hover reveals submenu) ----
// (kept simple: flat menus; submenu items just open a new dropdown)

export function initMenuBar() {
  bus.on('window:focus', () => renderMenuBar());
  bus.on('window:close', () => renderMenuBar());
  bus.on('window:open', () => renderMenuBar());
  bus.on('state:change', () => { renderMenuBar(); });
  bus.on('menubar:refresh', () => renderMenuBar());
  renderMenuBar();

  // re-render clock every 10s
  setInterval(() => { if (!openMenuName) renderRightSide(); }, 10000);

  // Esc closes menus
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}
