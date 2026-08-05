import { $ } from './utils.js';
import { allApps } from './appRegistry.js';
import { openApp, state, minimizeWindow, focusWindow, restoreWindow } from './windowManager.js';

export function initDock() {
  const container = $('#dock-apps');

  // Launchpad tile
  const lp = document.createElement('div');
  lp.className = 'dock-app';
  lp.title = 'Launchpad';
  lp.innerHTML = `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' rx='14' fill='%23000'/%3E%3Ccircle cx='19' cy='20' r='4' fill='%23fff'/%3E%3Ccircle cx='32' cy='20' r='4' fill='%23fff'/%3E%3Ccircle cx='45' cy='20' r='4' fill='%23fff'/%3E%3Ccircle cx='19' cy='33' r='4' fill='%23fff'/%3E%3Ccircle cx='32' cy='33' r='4' fill='%23fff'/%3E%3Ccircle cx='45' cy='33' r='4' fill='%23fff'/%3E%3Ccircle cx='19' cy='46' r='4' fill='%23fff'/%3E%3Ccircle cx='32' cy='46' r='4' fill='%23fff'/%3E%3Ccircle cx='45' cy='46' r='4' fill='%23fff'/%3E%3C/svg%3E" alt="Launchpad" /><div class="tooltip">Launchpad</div>`;
  lp.addEventListener('click', () => import('./desktop.js').then(m => m.toggleLaunchpad()));
  container.appendChild(lp);

  const dockApps = allApps().filter(a => a.showInDock !== false);

  dockApps.forEach(app => {
    const el = document.createElement('div');
    el.className = 'dock-app';
    el.dataset.app = app.id;
    el.innerHTML = `<img src="${app.icon || defaultIcon(app)}" alt="${app.name}" /><div class="dot"></div><div class="tooltip">${app.name}</div>`;
    el.addEventListener('click', () => {
      const existing = state.windows.find(w => w.appId === app.id);
      if (!existing) { openApp(app.id); return; }
      if (existing.minimized) restoreWindow(existing.id);
      else if (existing.focused) minimizeWindow(existing.id);
      focusWindow(existing.id);
    });
    container.appendChild(el);
  });
}

function defaultIcon(app) {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 64, 64);
  grad.addColorStop(0, app.iconGradient?.[0] || '#e0e0e0');
  grad.addColorStop(1, app.iconGradient?.[1] || '#a0a0a0');
  ctx.fillStyle = grad;
  if (ctx.roundRect) ctx.roundRect(8, 8, 48, 48, 12);
  else { ctx.beginPath(); ctx.moveTo(8, 20); ctx.lineTo(8, 52); ctx.arcTo(8, 60, 16, 60, 8); ctx.lineTo(56, 60); ctx.arcTo(64, 60, 64, 52, 8); ctx.lineTo(64, 20); ctx.arcTo(64, 12, 56, 12, 8); ctx.lineTo(16, 12); ctx.arcTo(8, 12, 8, 20, 8); ctx.closePath(); }
  ctx.fill();
  ctx.fillStyle = app.iconColor || '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (app.emoji) {
    ctx.font = '36px sans-serif';
    ctx.fillText(app.emoji, 32, 34);
  } else {
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(app.name.slice(0, 1), 32, 34);
  }
  return canvas.toDataURL();
}
