/* core.js — DOM helpers, persisted system settings, notifications, context menu, modals */
'use strict';

// ---------- DOM builder ----------
function el(tag, attrs, ...children) {
  const n = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else n.setAttribute(k, v);
  }
  for (const c of children.flat(9)) {
    if (c == null || c === false) continue;
    n.append(c.nodeType ? c : document.createTextNode(c));
  }
  return n;
}
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad2 = n => String(n).padStart(2, '0');
function fmtKB(kb) {
  if (kb >= 1048576) return (kb / 1048576).toFixed(1) + ' GB';
  if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB';
  return Math.max(1, Math.round(kb)) + ' KB';
}
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function fmtDateMenuBar(d = new Date()) {
  // "Fri Aug  7  9:41 AM"
  let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()].slice(0,3)}\u00A0${String(d.getDate()).padStart(2,'\u00A0')}\u00A0\u00A0${h}:${pad2(d.getMinutes())} ${ap}`;
}
function timeAgo(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return 'now';
  if (s < 3600) return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
}

// ---------- Sys: persisted settings + pub/sub ----------
const Sys = {
  KEY: 'tahoe-sys',
  data: null,
  subs: {},
  load() {
    try { this.data = JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch { this.data = {}; }
    const d = this.data;
    if (d.wallpaper == null) d.wallpaper = 0;
    if (d.appearance == null) d.appearance = 'light';
    if (d.accent == null) d.accent = '#0a84ff';
    if (d.brightness == null) d.brightness = 1;
    if (d.volume == null) d.volume = 0.6;
    if (d.muted == null) d.muted = false;
    if (d.wifi == null) d.wifi = { on: true, network: 'Tahoe Home 5G' };
    if (d.bt == null) d.bt = { on: true, devices: { 'Magic Keyboard': true, 'AirPods Pro': false, 'Magic Trackpad': true } };
    if (d.dnd == null) d.dnd = false;
    if (d.user == null) d.user = 'Mike';
    if (d.dockPins == null) d.dockPins = ['finder','safari','notes','mail','messages','calendar','reminders','photos','music','appstore','terminal','settings'];
    this.save();
  },
  save() { localStorage.setItem(this.KEY, JSON.stringify(this.data)); },
  get(k, def) { const v = this.data[k]; return v === undefined ? def : v; },
  set(k, v) { this.data[k] = v; this.save(); this.emit(k, v); this.emit('*', k); },
  on(k, cb) { (this.subs[k] ||= []).push(cb); },
  emit(k, v) { (this.subs[k] || []).forEach(cb => cb(v)); },
};

// Simple global event bus
const Bus = {
  subs: {},
  on(ev, cb) { (this.subs[ev] ||= []).push(cb); },
  emit(ev, ...a) { (this.subs[ev] || []).forEach(cb => cb(...a)); },
};

// ---------- Appearance / wallpapers ----------
const WALLPAPERS = [
  { name: 'Tahoe Blue', css: 'radial-gradient(120% 90% at 20% 0%, #6ec6ff 0%, transparent 55%), radial-gradient(100% 80% at 85% 15%, #b48cff 0%, transparent 55%), radial-gradient(120% 110% at 50% 100%, #2347c9 0%, #101a52 55%, #0a1032 100%)' },
  { name: 'Tahoe Day', css: 'linear-gradient(180deg, #7ec8ff 0%, #a8dcff 35%, #ffe9c2 65%, #ffb27a 100%)' },
  { name: 'Tahoe Night', css: 'radial-gradient(100% 100% at 50% 0%, #2b3a67 0%, #141a33 55%, #070a18 100%)' },
  { name: 'Solar Dunes', css: 'linear-gradient(160deg, #ffb26b 0%, #ff7e5f 40%, #c94b76 75%, #4b2a6e 100%)' },
  { name: 'Meadow', css: 'linear-gradient(170deg, #a8e063 0%, #56ab2f 55%, #1d5c34 100%)' },
  { name: 'Graphite', css: 'linear-gradient(160deg, #4a4a4f 0%, #232328 55%, #0d0d10 100%)' },
  { name: 'Aurora', css: 'radial-gradient(80% 60% at 30% 30%, #00ffa3 0%, transparent 55%), radial-gradient(70% 60% at 75% 60%, #8a5cff 0%, transparent 55%), linear-gradient(160deg, #071b2e 0%, #0a1032 100%)' },
  { name: 'Sequoia', css: 'radial-gradient(90% 70% at 70% 90%, #ff9d00 0%, transparent 60%), radial-gradient(100% 90% at 20% 10%, #4f00b5 0%, transparent 60%), linear-gradient(180deg, #240b47 0%, #12052b 100%)' },
];
function applyAppearance() {
  document.body.classList.toggle('dark', Sys.get('appearance') === 'dark');
  document.documentElement.style.setProperty('--accent', Sys.get('accent'));
}
function applyWallpaper() {
  const w = WALLPAPERS[Sys.get('wallpaper', 0)] || WALLPAPERS[0];
  document.body.style.setProperty('--wall', w.css);
  const lock = document.getElementById('lockscr');
  if (lock) lock.style.background = w.css;
}
function applyBrightness() {
  document.getElementById('brightness').style.background = `rgba(0,0,0,${(1 - Sys.get('brightness', 1)) * 0.55})`;
}

// ---------- Notifications ----------
const Notif = {
  list: JSON.parse(localStorage.getItem('tahoe-notifs') || '[]'),
  save() { localStorage.setItem('tahoe-notifs', JSON.stringify(this.list.slice(-40))); },
  push(appName, title, body, iconName) {
    const n = { id: uid(), app: appName, title, body, icon: iconName, ts: Date.now() };
    this.list.push(n); this.save();
    Bus.emit('notif', n);
    if (Sys.get('dnd')) return n;
    const b = el('div', { class: 'banner' },
      el('div', { class: 'banner-icon' }, iconName ? iconEl(iconName, 34) : null),
      el('div', { class: 'banner-txt' },
        el('div', { class: 'banner-title', text: title }),
        el('div', { class: 'banner-body', text: body })));
    b.onclick = () => { dismiss(); Bus.emit('notif-click', n); };
    document.getElementById('banners').append(b);
    const t = setTimeout(dismiss, 5200);
    function dismiss() { clearTimeout(t); b.classList.add('out'); setTimeout(() => b.remove(), 350); }
    return n;
  },
  clear() { this.list = []; this.save(); Bus.emit('notif-clear'); },
};

// ---------- Context menu ----------
let ctxEl = null;
function ctxMenu(x, y, items) {
  hideCtx();
  const m = el('div', { class: 'ctx-menu' });
  for (const it of items) {
    if (!it) continue;
    if (it.separator) { m.append(el('div', { class: 'sep' })); continue; }
    const row = el('div', { class: 'mi' + (it.disabled ? ' dis' : '') + (it.danger ? ' danger' : '') },
      it.checked ? el('span', { class: 'mi-check', text: '✓' }) : el('span', { class: 'mi-check' }),
      el('span', { class: 'mi-label', text: it.label }));
    if (!it.disabled && it.action) row.onclick = () => { hideCtx(); it.action(); };
    m.append(row);
  }
  document.getElementById('ctx').append(m);
  document.getElementById('ctx').hidden = false;
  const r = m.getBoundingClientRect();
  m.style.left = clamp(x, 8, innerWidth - r.width - 8) + 'px';
  m.style.top = clamp(y, 34, innerHeight - r.height - 8) + 'px';
  ctxEl = m;
}
function hideCtx() { const c = document.getElementById('ctx'); if (c) { c.hidden = true; c.innerHTML = ''; } ctxEl = null; }

// ---------- Modal dialogs ----------
function modal(opts) {
  // opts: {title, icon, body(el|html string), buttons:[{label,primary,danger,action(cb)->bool keep?}], width, noPad}
  const layer = document.getElementById('modal-layer');
  const card = el('div', { class: 'modal-card', style: opts.width ? { width: opts.width + 'px' } : null });
  const close = () => { layer.classList.remove('show'); setTimeout(() => card.remove(), 180); document.removeEventListener('keydown', onKey, true); };
  if (opts.title || opts.icon) card.append(el('div', { class: 'modal-head' },
    opts.icon ? el('div', { class: 'modal-icon' }, iconEl(opts.icon, 44)) : null,
    el('div', { class: 'modal-title', text: opts.title || '' })));
  const body = el('div', { class: 'modal-body' + (opts.noPad ? ' no-pad' : '') });
  if (typeof opts.body === 'string') body.innerHTML = opts.body; else if (opts.body) body.append(opts.body);
  card.append(body);
  if (opts.buttons && opts.buttons.length) {
    const row = el('div', { class: 'modal-btns' });
    for (const b of opts.buttons) {
      row.append(el('button', {
        class: 'btn' + (b.primary ? ' primary' : '') + (b.danger ? ' danger' : ''),
        text: b.label,
        onclick: () => { const keep = b.action ? b.action() : false; if (!keep) close(); },
      }));
    }
    card.append(row);
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  document.addEventListener('keydown', onKey, true);
  layer.append(card); layer.classList.add('show');
  return { close, card };
}

// ---------- App dialogs used by Apple menu ----------
function aboutThisMac() {
  modal({
    title: '', noPad: true, width: 620,
    body: el('div', { class: 'atm' },
      el('div', { class: 'atm-left' }, el('div', { class: 'atm-art' })),
      el('div', { class: 'atm-right' },
        el('div', { class: 'atm-name', text: 'MacBook Pro' }),
        el('div', { class: 'atm-sub', text: '14-inch, Nov 2025' }),
        el('div', { class: 'atm-row' }, el('span', { class: 'atm-k', text: 'Chip' }), el('span', { text: 'Apple M4 Pro' })),
        el('div', { class: 'atm-row' }, el('span', { class: 'atm-k', text: 'Memory' }), el('span', { text: '24 GB' })),
        el('div', { class: 'atm-row' }, el('span', { class: 'atm-k', text: 'Startup disk' }), el('span', { text: 'Macintosh HD' })),
        el('div', { class: 'atm-row' }, el('span', { class: 'atm-k', text: 'macOS' }), el('span', { text: 'Tahoe 26.1' })),
        el('button', { class: 'btn', text: 'More Info…', onclick: () => { WM.open('settings', { pane: 'general' }); } }))),
    buttons: [{ label: 'OK', primary: true }],
  });
}

function powerScreen(kind) { // sleep | restart | shutdown
  const done = () => { o.remove(); document.removeEventListener('keydown', key, true); };
  const key = (e) => { if (kind === 'sleep') done(); e.stopPropagation(); };
  const o = el('div', { class: 'power-screen', onclick: () => { if (kind === 'sleep') { done(); } else if (kind === 'shutdown') { location.reload(); } } },
    kind === 'restart' ? el('div', { class: 'boot-logo small' }) :
    kind === 'shutdown' ? el('div', { class: 'power-hint', text: 'Click anywhere to power on' }) : null);
  document.body.append(o);
  requestAnimationFrame(() => o.classList.add('show'));
  document.addEventListener('keydown', key, true);
  if (kind === 'restart') setTimeout(() => location.reload(), 1400);
}

// Webaudio helpers
let AC = null;
function audioCtx() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } return AC; }
function beep(freq = 880, dur = 0.15, type = 'sine', gainV = 0.15) {
  const ac = audioCtx(); if (!ac) return;
  const osc = ac.createOscillator(), g = ac.createGain();
  osc.type = type; osc.frequency.value = freq;
  g.gain.setValueAtTime(Sys.get('muted') ? 0 : gainV * Sys.get('volume', 0.6), ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(); osc.stop(ac.currentTime + dur);
}
function chime() { beep(523, 0.4, 'sine', 0.12); setTimeout(() => beep(784, 0.5, 'sine', 0.12), 180); }

// app icons helper is in icons.js (iconEl)
// WM is defined in wm.js; referenced here only inside event handlers (later binding).
Sys.load();
