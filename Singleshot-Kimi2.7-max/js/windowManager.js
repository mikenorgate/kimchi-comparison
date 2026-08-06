import { setActiveApp } from './menuBar.js';

const windowsContainer = document.getElementById('windows');
let zIndex = 100;
let activeWindowId = null;
const windows = new Map();
const positions = new Map();

function bringToFront(id) {
  const win = windows.get(id);
  if (!win) return;
  zIndex += 1;
  win.style.zIndex = zIndex;
  document.querySelectorAll('.window.active').forEach(w => w.classList.remove('active'));
  win.classList.add('active');
  activeWindowId = id;
  updateMenuAppName(id);
}

function updateMenuAppName(id) {
  const data = positions.get(id);
  if (data) setActiveApp(data.appId, data.title);
}

export function openWindow(appId, title, contentHtml, options = {}) {
  const id = `${appId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const width = options.width || 700;
  const height = options.height || 450;
  const existingCount = document.querySelectorAll(`.window[data-app="${appId}"]`).length;
  const offset = existingCount * 28;
  const maxLeft = Math.max(20, window.innerWidth - width - 40);
  const maxTop = Math.max(40, window.innerHeight - height - 100);
  const left = Math.min(60 + offset, maxLeft);
  const top = Math.min(60 + offset, maxTop);

  const win = document.createElement('div');
  win.className = 'window';
  win.dataset.id = id;
  win.dataset.app = appId;
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;

  win.innerHTML = `
    <div class="titlebar">
      <div class="buttons">
        <div class="btn close" data-action="close"></div>
        <div class="btn minimize" data-action="minimize"></div>
        <div class="btn maximize" data-action="maximize"></div>
      </div>
      <div class="title">${title}</div>
    </div>
    <div class="window-content">${contentHtml}</div>
    <div class="window-resize"></div>
  `;

  windowsContainer.appendChild(win);
  windows.set(id, win);
  positions.set(id, { title, appId, left, top, width, height, minimized: false, maximized: false });
  bringToFront(id);

  setupWindowInteractions(win, id);

  // Run app init if provided
  if (options.onMount) {
    requestAnimationFrame(() => options.onMount(win, id));
  }

  return { id, element: win };
}

export function closeWindow(id) {
  const win = windows.get(id);
  if (!win) return;
  win.dispatchEvent(new CustomEvent('windowclose', { bubbles: false }));
  win.remove();
  windows.delete(id);
  positions.delete(id);
  if (activeWindowId === id) {
    let topWin = null;
    let topZ = 0;
    windows.forEach((w, wid) => {
      const z = parseInt(w.style.zIndex || 0);
      if (z > topZ) { topZ = z; topWin = wid; }
    });
    if (topWin) bringToFront(topWin);
    else { activeWindowId = null; setActiveApp('finder', 'Finder'); }
  }
}

export function minimizeWindow(id) {
  const win = windows.get(id);
  if (!win) return;
  const data = positions.get(id);
  data.minimized = !data.minimized;
  win.classList.toggle('minimized', data.minimized);
  if (!data.minimized) bringToFront(id);
}

export function maximizeWindow(id) {
  const win = windows.get(id);
  if (!win) return;
  const data = positions.get(id);
  data.maximized = !data.maximized;
  win.classList.toggle('maximized', data.maximized);
  if (data.maximized) {
    data.prevLeft = win.style.left;
    data.prevTop = win.style.top;
    data.prevWidth = win.style.width;
    data.prevHeight = win.style.height;
  } else {
    win.style.left = data.prevLeft || '60px';
    win.style.top = data.prevTop || '60px';
    win.style.width = data.prevWidth || '700px';
    win.style.height = data.prevHeight || '450px';
  }
}

function setupWindowInteractions(win, id) {
  const titlebar = win.querySelector('.titlebar');
  const resizeHandle = win.querySelector('.window-resize');

  win.addEventListener('mousedown', () => bringToFront(id));

  titlebar.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === 'close') closeWindow(id);
      else if (action === 'minimize') minimizeWindow(id);
      else if (action === 'maximize') maximizeWindow(id);
    });
  });

  let dragging = false, dragOffX = 0, dragOffY = 0;
  titlebar.addEventListener('mousedown', e => {
    if (e.target.classList.contains('btn')) return;
    const data = positions.get(id);
    if (data.maximized) return;
    dragging = true;
    dragOffX = e.clientX - win.offsetLeft;
    dragOffY = e.clientY - win.offsetTop;
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const data = positions.get(id);
    let nx = e.clientX - dragOffX;
    let ny = e.clientY - dragOffY;
    ny = Math.max(28, ny);
    win.style.left = `${nx}px`;
    win.style.top = `${ny}px`;
    data.left = nx;
    data.top = ny;
  });

  window.addEventListener('mouseup', () => dragging = false);

  let resizing = false, startX = 0, startY = 0, startW = 0, startH = 0;
  resizeHandle.addEventListener('mousedown', e => {
    const data = positions.get(id);
    if (data.maximized) return;
    resizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startW = win.offsetWidth;
    startH = win.offsetHeight;
    e.stopPropagation();
  });

  window.addEventListener('mousemove', e => {
    if (!resizing) return;
    const nw = Math.max(240, startW + e.clientX - startX);
    const nh = Math.max(160, startH + e.clientY - startY);
    win.style.width = `${nw}px`;
    win.style.height = `${nh}px`;
    const data = positions.get(id);
    data.width = nw;
    data.height = nh;
  });

  window.addEventListener('mouseup', () => resizing = false);
}

export function getWindows() { return windows; }
export function focusWindow(id) { bringToFront(id); }
