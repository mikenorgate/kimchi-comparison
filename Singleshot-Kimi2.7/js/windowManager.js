import { $, $$, clamp } from './utils.js';
import { getApp } from './appRegistry.js';

export const state = {
  windows: [],
  maxZ: 100,
  windowOffset: 0,
  activeWindowId: null
};

export function openApp(appId) {
  const app = getApp(appId);
  if (!app) return null;

  const existing = state.windows.find(w => w.appId === appId);
  if (existing) {
    if (existing.minimized) restoreWindow(existing.id);
    focusWindow(existing.id);
    return existing;
  }

  const win = app.createWindow(state);
  state.windows.push(win);
  state.windowOffset++;
  renderWindow(win, app);
  focusWindow(win.id);
  updateDockDots();
  return win;
}

export function focusWindow(id) {
  state.windows.forEach(w => { w.focused = w.id === id; if (w.id === id) w.z = ++state.maxZ; });
  state.activeWindowId = id;
  renderZOrder();
  updateTitlebarStates();
  updateActiveAppName();
}

export function closeWindow(id) {
  const idx = state.windows.findIndex(w => w.id === id);
  if (idx === -1) return;
  const w = state.windows[idx];
  const app = getApp(w.appId);
  app?.onClose?.(w);
  const el = $(`#win-${id}`);
  el?.remove();
  state.windows.splice(idx, 1);
  if (state.activeWindowId === id) {
    const top = state.windows.filter(w => !w.minimized).sort((a, b) => b.z - a.z)[0];
    state.activeWindowId = top?.id || null;
    if (top) focusWindow(top.id);
  }
  updateDockDots();
  updateActiveAppName();
}

export function minimizeWindow(id) {
  const w = state.windows.find(x => x.id === id);
  if (!w) return;
  w.minimized = true;
  w.focused = false;
  $(`#win-${id}`).classList.add('minimized');
  updateDockDots();
  const top = state.windows.filter(x => !x.minimized).sort((a, b) => b.z - a.z)[0];
  if (top) focusWindow(top.id);
  else { state.activeWindowId = null; updateActiveAppName(); }
}

export function restoreWindow(id) {
  const w = state.windows.find(x => x.id === id);
  if (!w || !w.minimized) return;
  w.minimized = false;
  $(`#win-${id}`).classList.remove('minimized');
  updateDockDots();
}

export function toggleMaximize(id) {
  const w = state.windows.find(x => x.id === id);
  if (!w) return;
  w.maximized = !w.maximized;
  $(`#win-${id}`).classList.toggle('maximized', w.maximized);
}

function renderWindow(w, app) {
  const layer = $('#window-layer');
  const el = document.createElement('div');
  el.id = `win-${w.id}`;
  el.className = 'window';
  el.style.left = w.x + 'px';
  el.style.top = w.y + 'px';
  el.style.width = w.width + 'px';
  el.style.height = w.height + 'px';
  el.innerHTML = `
    <div class="window-titlebar">
      <div class="window-buttons">
        <button class="window-btn close"></button>
        <button class="window-btn minimize"></button>
        <button class="window-btn maximize"></button>
      </div>
      <div class="window-title">${w.title}</div>
    </div>
    <div class="window-content" id="win-content-${w.id}"></div>
    ${app.canResize !== false ? '<div class="resize-handle"></div>' : ''}
  `;

  layer.appendChild(el);

  const content = $(`#win-content-${w.id}`);
  const rendered = app.render(w, content);
  if (rendered && content.firstChild !== rendered) content.appendChild(rendered);

  setupDragging(el, w, app);
  setupResizing(el, w, app);
  setupTitlebar(el, w, app);

  el.addEventListener('mousedown', () => focusWindow(w.id));
}

function setupDragging(el, w, _app) {
  const titlebar = $('.window-titlebar', el);
  let dragging = false, startX, startY, origX, origY;

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.window-btn')) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    origX = w.x; origY = w.y;
    el.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    w.x = clamp(origX + e.clientX - startX, 0, window.innerWidth - 80);
    w.y = clamp(origY + e.clientY - startY, 28, window.innerHeight - 80);
    el.style.left = w.x + 'px';
    el.style.top = w.y + 'px';
    if (w.maximized) { w.maximized = false; el.classList.remove('maximized'); }
  });

  window.addEventListener('mouseup', () => { dragging = false; el.style.transition = ''; });
}

function setupResizing(el, w, app) {
  if (app.canResize === false) return;
  const handle = $('.resize-handle', el);
  if (!handle) return;
  let resizing = false, startX, startY, origW, origH;

  handle.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    resizing = true;
    startX = e.clientX; startY = e.clientY;
    origW = w.width; origH = w.height;
    el.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!resizing) return;
    w.width = clamp(origW + e.clientX - startX, app.minWidth || 240, window.innerWidth - w.x - 20);
    w.height = clamp(origH + e.clientY - startY, app.minHeight || 160, window.innerHeight - w.y - 20);
    el.style.width = w.width + 'px';
    el.style.height = w.height + 'px';
  });

  window.addEventListener('mouseup', () => { resizing = false; el.style.transition = ''; });
}

function setupTitlebar(el, w, _app) {
  $('.window-btn.close', el).addEventListener('click', () => closeWindow(w.id));
  $('.window-btn.minimize', el).addEventListener('click', () => minimizeWindow(w.id));
  $('.window-btn.maximize', el).addEventListener('click', () => toggleMaximize(w.id));
  $('.window-titlebar', el).addEventListener('dblclick', () => toggleMaximize(w.id));
}

function renderZOrder() {
  state.windows.forEach(w => {
    const el = $(`#win-${w.id}`);
    if (el) el.style.zIndex = w.z;
  });
}

function updateTitlebarStates() {
  state.windows.forEach(w => {
    const el = $(`#win-${w.id}`);
    if (el) el.classList.toggle('inactive', !w.focused);
  });
}

function updateActiveAppName() {
  const active = state.windows.find(w => w.focused);
  const app = active ? getApp(active.appId) : getApp('finder');
  $('#active-app-name').textContent = app?.name || 'Finder';
}

export function updateDockDots() {
  $$('.dock-app').forEach(d => {
    const id = d.dataset.app;
    const running = state.windows.some(w => w.appId === id && !w.minimized);
    d.classList.toggle('running', running);
  });
}

window.addEventListener('open-app', (e) => openApp(e.detail));
