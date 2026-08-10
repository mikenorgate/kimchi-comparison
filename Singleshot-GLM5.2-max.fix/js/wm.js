// Window manager: create/move/resize/min/maximize/close/focus/z-order.
import { bus } from './store.js';

const layer = () => document.getElementById('window-layer');
let zTop = 100;
let openWindows = [];        // {id, el, app, title, ...}
let nextId = 1;

export function getOpen() { return openWindows; }

export function focusWindow(id) {
  const w = openWindows.find(w => w.id === id);
  if (!w) return;
  openWindows.forEach(x => x.el.classList.toggle('active', x.id === id));
  // move to end of array = top z
  openWindows = openWindows.filter(x => x.id !== id);
  openWindows.push(w);
  w.el.style.zIndex = ++zTop;
  bus.emit('window:focus', w);
}

export function listByApp(appId) {
  return openWindows.filter(w => w.app === appId);
}

// Find existing open window for a single-instance app; return or null.
export function findAppWindow(appId) {
  return openWindows.find(w => w.app === appId) || null;
}

export function createWindow({ app, title, width=720, height=480, x, y, single=false, content=null, menus=null, onClose=null }) {
  if (single) {
    const ex = findAppWindow(app.id);
    if (ex) { focusWindow(ex.id); return ex; }
  }
  const id = nextId++;
  const el = document.createElement('div');
  el.className = 'window opening';
  el.dataset.id = id;
  el.dataset.app = app.id;

  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(width, vw - 40);
  const h = Math.min(height, vh - 90);
  const px = x != null ? x : Math.max(20, (vw - w) / 2 + (openWindows.length % 6) * 26 - 60);
  const py = y != null ? y : Math.max(40, (vh - h) / 2 + (openWindows.length % 6) * 22 - 50);
  el.style.left = px + 'px';
  el.style.top = py + 'px';
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  el.style.zIndex = ++zTop;

  el.innerHTML = `
    <div class="titlebar">
      <div class="traffic">
        <div class="tl tl-close" data-act="close"><div class="tl-inner"></div><span class="tl-glyph">✕</span></div>
        <div class="tl tl-min" data-act="min"><div class="tl-inner"></div><span class="tl-glyph">–</span></div>
        <div class="tl tl-max" data-act="max"><div class="tl-inner"></div><span class="tl-glyph">+</span></div>
      </div>
      <div class="win-title">${title || app.name}</div>
    </div>
    <div class="win-content"></div>
    <div class="win-rsz n"></div><div class="win-rsz s"></div>
    <div class="win-rsz w"></div><div class="win-rsz e"></div>
    <div class="win-rsz ne"></div><div class="win-rsz nw"></div>
    <div class="win-rsz se"></div><div class="win-rsz sw"></div>
  `;

  const rec = { id, el, app, title, menus, onClose, prevRect: null };
  const contentEl = el.querySelector('.win-content');
  if (content && typeof content === 'string') contentEl.innerHTML = content;
  else if (content instanceof HTMLElement) contentEl.appendChild(content);
  else if (typeof content === 'function') content(contentEl);

  layer().appendChild(el);
  openWindows.push(rec);
  focusWindow(id);
  setTimeout(() => el.classList.remove('opening'), 200);

  // ---- interactions ----
  // Traffic lights
  el.querySelector('.titlebar').addEventListener('mousedown', (e) => {
    if (e.target.closest('.traffic')) return;
    focusWindow(id);
    startDrag(e, el);
  });
  el.querySelector('.tl-close').addEventListener('click', () => closeWindow(id));
  el.querySelector('.tl-min').addEventListener('click', () => minimizeWindow(id));
  el.querySelector('.tl-max').addEventListener('click', (e) => {
    if (e.detail === 2 || e.altKey) maximizeWindow(id);
    else toggleMaximize(id);
  });
  el.querySelector('.win-title').addEventListener('dblclick', () => toggleMaximize(id));
  el.addEventListener('mousedown', () => focusWindow(id), true);

  // Double-click titlebar to zoom
  // Resize handles
  el.querySelectorAll('.win-rsz').forEach(h => {
    h.addEventListener('mousedown', (e) => { e.stopPropagation(); startResize(e, el, h.className.split(' ').pop()); });
  });

  bus.emit('window:open', rec);
  return rec;
}

function startDrag(e, el) {
  e.preventDefault();
  const sx = e.clientX, sy = e.clientY;
  const ox = parseFloat(el.style.left), oy = parseFloat(el.style.top);
  const onMove = (ev) => {
    let nx = ox + (ev.clientX - sx);
    let ny = oy + (ev.clientY - sy);
    ny = Math.max(28, ny);                       // keep below menu bar
    nx = Math.max(-el.offsetWidth + 80, Math.min(nx, window.innerWidth - 80));
    el.style.left = nx + 'px';
    el.style.top = ny + 'px';
  };
  const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function startResize(e, el, dir) {
  e.preventDefault();
  const sx = e.clientX, sy = e.clientY;
  const ow = el.offsetWidth, oh = el.offsetHeight;
  const ox = parseFloat(el.style.left), oy = parseFloat(el.style.top);
  const minW = 340, minH = 200;
  const onMove = (ev) => {
    let nw = ow, nh = oh, nx = ox, ny = oy;
    const dx = ev.clientX - sx, dy = ev.clientY - sy;
    if (dir.includes('e')) nw = Math.max(minW, ow + dx);
    if (dir.includes('s')) nh = Math.max(minH, oh + dy);
    if (dir.includes('w')) { nw = Math.max(minW, ow - dx); nx = ox + (ow - nw); }
    if (dir.includes('n')) { nh = Math.max(minH, oh - dy); ny = oy + (oh - nh); }
    el.style.width = nw + 'px'; el.style.height = nh + 'px';
    el.style.left = nx + 'px'; el.style.top = ny + 'px';
  };
  const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

export function minimizeWindow(id) {
  const w = openWindows.find(w => w.id === id);
  if (!w) return;
  w.el.classList.add('minimizing');
  w.minimized = true;
  setTimeout(() => { w.el.style.display = 'none'; w.el.classList.remove('minimizing'); }, 400);
  bus.emit('window:minimize', w);
}

export function restoreWindow(id) {
  const w = openWindows.find(w => w.id === id);
  if (!w) return;
  w.minimized = false;
  w.el.style.display = '';
  focusWindow(id);
  bus.emit('window:restore', w);
}

export function toggleMaximize(id) {
  const w = openWindows.find(w => w.id === id);
  if (!w) return;
  if (w.prevRect) {
    Object.assign(w.el.style, w.prevRect);
    w.prevRect = null;
  } else {
    w.prevRect = { left: w.el.style.left, top: w.el.style.top, width: w.el.style.width, height: w.el.style.height };
    w.el.style.left = '0px';
    w.el.style.top = '28px';
    w.el.style.width = window.innerWidth + 'px';
    w.el.style.height = (window.innerHeight - 86) + 'px';
  }
  focusWindow(id);
}

export function maximizeWindow(id) { toggleMaximize(id); }

export function closeWindow(id) {
  const idx = openWindows.findIndex(w => w.id === id);
  if (idx < 0) return;
  const w = openWindows[idx];
  if (typeof w.onClose === 'function') { try { w.onClose(); } catch {} }
  w.el.style.transition = 'opacity .15s, transform .15s';
  w.el.style.opacity = '0';
  w.el.style.transform = 'scale(.96)';
  setTimeout(() => { w.el.remove(); }, 150);
  openWindows.splice(idx, 1);
  bus.emit('window:close', w);
  // focus topmost remaining
  const top = openWindows[openWindows.length - 1];
  if (top) focusWindow(top.id);
}

export function setTitle(id, title) {
  const w = openWindows.find(w => w.id === id);
  if (!w) return;
  w.title = title;
  w.el.querySelector('.win-title').textContent = title;
}

export function setMenus(id, menus) {
  const w = openWindows.find(w => w.id === id);
  if (w) { w.menus = menus; bus.emit('window:focus', w); }
}

export function activeWindow() {
  return openWindows[openWindows.length - 1] || null;
}
