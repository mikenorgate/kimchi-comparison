// macOS Tahoe — main bootstrap.
// Wires desktop, wallpaper, desktop icons, menu bar, dock, control center, spotlight.
import { loadState, getState, applyAppearance, bus, WALLPAPERS, toast } from './store.js';
import { loadVFS } from './vfs.js';
import { initMenuBar } from './menubar.js';
import { initDock } from './dock.js';
import { initControlCenter } from './controlcenter.js';
import { initSpotlight } from './spotlight.js';
import { launchApp } from './appregistry.js';
import { glyph } from './icons.js';

function applyWallpaper() {
  const s = getState();
  const wp = document.getElementById('wallpaper');
  wp.style.background = WALLPAPERS[s.wallpaper] || WALLPAPERS.tahoe;
  wp.style.filter = `brightness(${s.brightness}%)`;
  document.body.classList.toggle('menubar-opaque', s.menubarOpaque);
}

function renderDesktopIcons() {
  const wrap = document.getElementById('desktop-icons');
  wrap.innerHTML = `
    <div class="desk-icon" data-app="macintosh">
      <div class="glyph">${glyph('desktop',54)}</div>
      <div class="lbl">Macintosh HD</div>
    </div>
    <div class="desk-icon" data-path="/Desktop">
      <div class="glyph">${glyph('folder',54)}</div>
      <div class="lbl">Desktop</div>
    </div>
  `;
  wrap.querySelectorAll('.desk-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      wrap.querySelectorAll('.desk-icon').forEach(i => i.classList.remove('sel'));
      icon.classList.add('sel');
    });
    icon.addEventListener('dblclick', () => {
      if (icon.dataset.app) { launchApp('finder'); return; }
      if (icon.dataset.path) launchApp('finder');
    });
  });
}

function bootSequence() {
  const boot = document.getElementById('boot-screen');
  const fill = boot.querySelector('.boot-bar-fill');
  const desktop = document.getElementById('desktop');
  let p = 0;
  const iv = setInterval(() => {
    p += 12 + Math.random() * 18;
    fill.style.width = Math.min(100, p) + '%';
    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        boot.style.transition = 'opacity .5s ease';
        boot.style.opacity = '0';
        setTimeout(() => { boot.style.display = 'none'; desktop.classList.remove('hidden'); onReady(); }, 500);
      }, 300);
    }
  }, 180);
}

function onReady() {
  applyWallpaper();
  renderDesktopIcons();
  initMenuBar();
  initDock();
  initControlCenter();
  initSpotlight();
  wireSystemEvents();
  // Open Finder welcome window after a beat
  setTimeout(() => launchApp('finder'), 600);
}

function wireSystemEvents() {
  // state changes affect wallpaper + appearance
  bus.on('state:change', () => { applyWallpaper(); });
  bus.on('wallpaper:change', (key) => {
    const wp = document.getElementById('wallpaper');
    wp.style.background = WALLPAPERS[key] || WALLPAPERS.tahoe;
  });
  // system menu actions
  bus.on('system:sleep', () => { showOverlay('💤 Sleep', 'Click to wake'); });
  bus.on('system:restart', () => { showOverlay('Restarting…', 'Your Mac is restarting', () => location.reload()); });
  bus.on('system:shutdown', () => { showOverlay('Shutting Down…', 'Your Mac is shutting down'); });
  bus.on('system:lock', () => { showOverlay('🔒 Locked', 'Click to unlock'); });
  bus.on('system:logout', () => { showOverlay('Logging out…', 'Goodbye', () => location.reload()); });
  // trash
  bus.on('trash:open', () => { toast('Trash is empty'); });
  // launch requests from apps
  bus.on('launch', (id) => launchApp(id));
  // escape clears desktop icon selection
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.desk-icon.sel').forEach(i => i.classList.remove('sel'));
    }
  });
}

function showOverlay(title, sub, onClick) {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:#000;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;gap:12px;cursor:default';
  ov.innerHTML = `<div style="font-size:22px">${title}</div><div style="font-size:14px;opacity:.7">${sub}</div>`;
  document.body.appendChild(ov);
  if (onClick) {
    ov.addEventListener('click', () => { ov.remove(); onClick(); });
  } else {
    ov.addEventListener('click', () => { ov.remove(); });
  }
}

// ---- Init ----
loadState();
loadVFS();
applyAppearance();
bootSequence();
