import { $, $$, closeContextMenu } from './utils.js';
import { getApp } from './appRegistry.js';
import { state, openApp } from './windowManager.js';

export function initMenubar() {
  updateClock();
  setInterval(updateClock, 1000);
  renderAppleMenu();
  setupMenuBehavior();
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-item')) $$('.menu-item.open').forEach(m => m.classList.remove('open'));
  });
}

function updateClock() {
  $('#clock').textContent = new Date().toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
}

function renderAppleMenu() {
  const submenu = $('#apple-submenu');
  const items = [
    { label: 'About This Mac', action: () => alert('macOS Tahoe Web\nVersion 1.0\nBuilt by Kimchi') },
    '-',
    { label: 'System Settings…', action: () => openApp('settings') },
    { label: 'App Store…', action: () => alert('App Store coming soon') },
    '-',
    { label: 'Recent Items', disabled: true },
    '-',
    { label: 'Force Quit…', action: () => alert('Force Quit is not implemented') },
    '-',
    { label: 'Sleep', action: () => document.body.style.opacity = 0.2 },
    { label: 'Restart…', action: () => location.reload() },
    { label: 'Shut Down…', action: () => document.body.innerHTML = '<div style="color:#fff;text-align:center;padding-top:40%">It is now safe to close this tab.</div>' },
    '-',
    { label: 'Lock Screen', action: () => alert('Screen locked (not really)') },
    { label: 'Log Out mike…', action: () => alert('Logged out (not really)') }
  ];
  buildSubmenu(submenu, items);
}

export function updateAppMenus() {
  const active = state.windows.find(w => w.focused);
  const app = active ? getApp(active.appId) : getApp('finder');
  $('#active-app-name').textContent = app?.name || 'Finder';

  const menus = app?.menus || defaultMenus();
  const container = $('#app-menus');
  container.innerHTML = '';
  menus.forEach(menu => {
    const el = document.createElement('div');
    el.className = 'menu-item';
    el.textContent = menu.label;
    const sub = document.createElement('div');
    sub.className = 'submenu';
    buildSubmenu(sub, menu.items);
    el.appendChild(sub);
    container.appendChild(el);
  });
  setupMenuBehavior();
}

function defaultMenus() {
  return [
    { label: 'File', items: [
      { label: 'New Finder Window', action: () => openApp('finder') },
      { label: 'New Folder', action: () => {} },
      '-',
      { label: 'Close', action: () => { const w = state.windows.find(x => x.focused); if (w) import('./windowManager.js').then(m => m.closeWindow(w.id)); } }
    ]},
    { label: 'Edit', items: [
      { label: 'Undo', disabled: true },
      { label: 'Cut', disabled: true },
      { label: 'Copy', disabled: true },
      { label: 'Paste', disabled: true }
    ]},
    { label: 'View', items: [
      { label: 'as Icons', action: () => {} },
      { label: 'as List', action: () => {} },
      { label: 'as Columns', action: () => {} }
    ]},
    { label: 'Go', items: [
      { label: 'Back', action: () => {} },
      { label: 'Forward', action: () => {} },
      { label: 'Enclosing Folder', action: () => {} }
    ]},
    { label: 'Window', items: [
      { label: 'Minimize', action: () => { const w = state.windows.find(x => x.focused); if (w) import('./windowManager.js').then(m => m.minimizeWindow(w.id)); } },
      { label: 'Zoom', action: () => { const w = state.windows.find(x => x.focused); if (w) import('./windowManager.js').then(m => m.toggleMaximize(w.id)); } },
      '-',
      { label: 'Bring All to Front', action: () => {} }
    ]},
    { label: 'Help', items: [
      { label: 'macOS Help', action: () => alert('Help is not available yet.') }
    ]}
  ];
}

function buildSubmenu(container, items) {
  items.forEach(item => {
    if (item === '-') {
      const sep = document.createElement('div');
      sep.className = 'submenu-separator';
      container.appendChild(sep);
    } else {
      const el = document.createElement('div');
      el.className = 'submenu-item' + (item.disabled ? ' disabled' : '');
      el.innerHTML = `<span>${item.label}</span>${item.shortcut ? `<span>${item.shortcut}</span>` : ''}`;
      const action = item.action || defaultMenuAction(item.label);
      if (!item.disabled && action) el.addEventListener('click', () => { action(); closeAllMenus(); });
      container.appendChild(el);
    }
  });
}

function defaultMenuAction(label) {
  const w = () => state.windows.find(x => x.focused);
  if (/^Close/.test(label)) return () => { const win = w(); if (win) import('./windowManager.js').then(m => m.closeWindow(win.id)); };
  if (/^Minimize/.test(label)) return () => { const win = w(); if (win) import('./windowManager.js').then(m => m.minimizeWindow(win.id)); };
  if (/^Zoom/.test(label)) return () => { const win = w(); if (win) import('./windowManager.js').then(m => m.toggleMaximize(win.id)); };
  return null;
}

function setupMenuBehavior() {
  $$('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = item.classList.contains('open');
      $$('.menu-item.open').forEach(m => m.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
    item.addEventListener('mouseenter', () => {
      if ($('.menu-item.open')) {
        $$('.menu-item.open').forEach(m => m.classList.remove('open'));
        item.classList.add('open');
      }
    });
  });
}

function closeAllMenus() {
  $$('.menu-item.open').forEach(m => m.classList.remove('open'));
  closeContextMenu();
}
