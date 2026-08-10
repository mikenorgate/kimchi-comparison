// Dock — Tahoe glass dock with magnification, running indicators, bounce.
import { bus, getState } from './store.js';
import { APP_ICONS } from './icons.js';
import { APPS, launchApp } from './appregistry.js';
import * as wm from './wm.js';

const dock = () => document.getElementById('dock');

export function initDock() {
  render();
  bus.on('window:open', render);
  bus.on('window:close', render);
  bus.on('window:minimize', render);
  bus.on('window:restore', render);
}

function render() {
  const s = getState();
  const d = dock();
  const apps = s.dockApps.map(id => APPS.find(a => a.id === id)).filter(Boolean);
  let html = '';
  apps.forEach(app => {
    const running = wm.listByApp(app.id).length > 0;
    html += `<div class="dock-item ${running ? 'running' : ''}" data-app="${app.id}" title="${app.name}">
      <div class="di-label">${app.name}</div>
      <div class="di-icon">${app.icon}</div>
    </div>`;
  });
  // separator + trash
  html += `<div class="dock-sep"></div>`;
  html += `<div class="dock-item" data-app="__trash__" title="Trash">
    <div class="di-label">Trash</div>
    <div class="di-icon">${APP_ICONS.trash}</div>
  </div>`;
  d.innerHTML = html;

  d.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.app;
      if (id === '__trash__') { bus.emit('trash:open'); return; }
      item.classList.add('bouncing');
      setTimeout(() => item.classList.remove('bouncing'), 500);
      launchApp(id);
    });
  });
}
