// Lightweight global store + event bus + localStorage persistence.

const LS_KEY = 'tahoe_state_v1';
const listeners = new Map();   // event -> Set<fn>

export const bus = {
  on(evt, fn) {
    if (!listeners.has(evt)) listeners.set(evt, new Set());
    listeners.get(evt).add(fn);
    return () => listeners.get(evt)?.delete(fn);
  },
  emit(evt, payload) {
    listeners.get(evt)?.forEach(fn => { try { fn(payload); } catch (e) { console.error(e); } });
  },
};

// In-memory settings; persisted to localStorage.
const defaultState = {
  appearance: 'light',      // light | dark
  accent: '#0a84ff',
  wallpaper: 'tahoe',       // key into WALLPAPERS
  menubarOpaque: false,
  wifi: true, bluetooth: true, airdrop: true, focus: false,
  volume: 60, brightness: 100,
  dockApps: ['finder','safari','mail','messages','notes','calendar','music','photos','maps','weather','terminal','calculator','textedit','settings','appstore'],
};

let state = { ...defaultState };

export function getState() { return state; }
export function setState(patch) {
  state = { ...state, ...patch };
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
  bus.emit('state:change', state);
  applyAppearance();
}
export function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) state = { ...defaultState, ...JSON.parse(raw) };
  } catch {}
  applyAppearance();
  bus.emit('state:change', state);
  return state;
}

export function applyAppearance() {
  const body = document.body;
  body.classList.toggle('dark', state.appearance === 'dark');
  const wp = document.getElementById('wallpaper');
  if (wp) wp.style.filter = `brightness(${state.brightness}%)`;
  bus.emit('appearance', state);
}

// Toast helper
export function toast(msg, ms=2200) {
  const wrap = document.getElementById('toast');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast-item';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 320); }, ms);
}

// Wallpapers keyed by name -> CSS background value (Tahoe-like gradient skies)
export const WALLPAPERS = {
  tahoe:    'radial-gradient(120% 120% at 50% 10%, #5ec8ff 0%, #2a7fd6 35%, #0a4a8f 65%, #062a52 100%)',
  sunset:   'linear-gradient(180deg, #ff9a5a 0%, #ff5a7a 35%, #b03aa0 65%, #3a1a5a 100%)',
  sequoia:  'linear-gradient(180deg, #2a3a6a 0%, #5a4a8a 50%, #c08aaa 100%)',
  graphite: 'linear-gradient(180deg, #3a3a3e 0%, #1a1a1e 100%)',
  aurora:   'linear-gradient(180deg, #0a2a4a 0%, #1a5a8a 30%, #3ace8a 60%, #aaf0d0 100%)',
  monterey: 'linear-gradient(135deg, #ff6a9a 0%, #b05aff 50%, #2a6aff 100%)',
};
