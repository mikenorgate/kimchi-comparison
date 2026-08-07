// ===================================================================
// Global state store + tiny event bus + persistence
// ===================================================================
const LS_KEY = "tahoe-state-v1";

const defaultState = {
  theme: "dark",            // dark | light
  accent: "#0a84ff",
  wallpaper: "tahoe",
  volume: 60,
  brightness: 90,
  wifi: true,
  bluetooth: true,
  airdrop: true,
  airplane: false,
  doNotDisturb: false,
  dnd: false,
  stageManager: false,
  username: "Mike",
  fs: null,                 // virtual filesystem (set by filesystem.js)
  notes: [],
  reminders: [],
  recents: [],
};

const listeners = new Map();

export const state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    return { ...defaultState, ...(saved || {}) };
  } catch {
    return { ...defaultState };
  }
}

export function saveState() {
  try {
    const { fs, ...rest } = state;
    localStorage.setItem(LS_KEY, JSON.stringify(rest));
  } catch {}
}

export function setState(patch) {
  Object.assign(state, patch);
  saveState();
  emit("change", patch);
}

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => listeners.get(event)?.delete(fn);
}

export function emit(event, payload) {
  listeners.get(event)?.forEach((fn) => {
    try { fn(payload); } catch (e) { console.error(e); }
  });
}

// ---- DOM helpers ----
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(c));
  }
  return node;
}

export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function uid() { return Math.random().toString(36).slice(2, 10); }
export function fmtTime(d = new Date()) {
  let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}
export function fmtDate(d = new Date()) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
export function fmtDateLong(d = new Date()) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

// wallpapers (CSS gradients to avoid external assets)
export const wallpapers = {
  tahoe: "linear-gradient(135deg, #1a2a6c 0%, #2a4ab8 30%, #4f6fc0 60%, #7e9aee 100%)",
  sequoia: "linear-gradient(160deg, #6a3093 0%, #a044ff 50%, #4f9cff 100%)",
  sonoma: "radial-gradient(circle at 30% 30%, #ff8a00, #e52e71 50%, #2a2a72 100%)",
  ventura: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  graphite: "linear-gradient(135deg, #3a3a3c 0%, #1c1c1e 100%)",
  aurora: "linear-gradient(135deg, #00c6ff 0%, #0072ff 35%, #6e48aa 70%, #9b4dff 100%)",
  sunset: "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)",
};

export function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const wp = $("#wallpaper");
  if (wp) wp.style.background = wallpapers[state.wallpaper] || wallpapers.tahoe;
  const lb = $(".login-blur");
  if (lb) lb.style.background = wallpapers[state.wallpaper] || wallpapers.tahoe;
}
