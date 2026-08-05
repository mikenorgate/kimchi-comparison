export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

export function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export function formatDate(d = new Date()) {
  const options = { weekday: 'short', hour: 'numeric', minute: '2-digit' };
  return d.toLocaleString('en-US', options);
}

export function save(key, value) {
  try { localStorage.setItem(`tahoe:${key}`, JSON.stringify(value)); } catch {}
}

export function load(key, fallback = null) {
  try { const v = localStorage.getItem(`tahoe:${key}`); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

export function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function showContextMenu(items, x, y) {
  const menu = $('#context-menu');
  menu.innerHTML = '';
  menu.style.display = 'block';
  for (const item of items) {
    if (item === '-') {
      const sep = document.createElement('div');
      sep.className = 'context-menu-separator';
      menu.appendChild(sep);
    } else {
      const el = document.createElement('div');
      el.className = 'context-menu-item' + (item.disabled ? ' disabled' : '');
      el.textContent = item.label;
      if (!item.disabled) el.addEventListener('click', () => { item.action(); closeContextMenu(); });
      menu.appendChild(el);
    }
  }
  const rect = menu.getBoundingClientRect();
  menu.style.left = Math.min(x, window.innerWidth - rect.width - 8) + 'px';
  menu.style.top = Math.min(y, window.innerHeight - rect.height - 8) + 'px';
}

export function closeContextMenu() {
  const menu = $('#context-menu');
  menu.style.display = 'none';
  menu.innerHTML = '';
}

export function notify(title, body, timeout = 4000) {
  const el = document.createElement('div');
  el.className = 'notification';
  el.innerHTML = `<h4>${title}</h4><p>${body}</p>`;
  $('#desktop').appendChild(el);
  setTimeout(() => el.remove(), timeout);
}

export function makeIcon(name) {
  const div = document.createElement('div');
  div.style.cssText = 'width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;background:linear-gradient(135deg,#e0e0e0,#c0c0c0);color:#333;';
  div.textContent = name.slice(0, 1).toUpperCase();
  return div;
}
