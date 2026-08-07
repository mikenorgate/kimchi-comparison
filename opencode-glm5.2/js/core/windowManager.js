// ===================================================================
// Window Manager — creation, focus, drag, resize, minimize, close
// ===================================================================
import { $, $$, el, clamp, uid, emit, on } from "./state.js";

const layer = () => $("#window-layer");

let zTop = 100;
let activeWindow = null;
const windows = new Map(); // id -> { el, app, state, listeners }
const minimizedOrder = [];

export function activeWin() { return activeWindow; }
export function openWindows() { return [...windows.values()]; }
export function windowsForApp(appId) {
  return [...windows.values()].filter((w) => w.app === appId);
}

export function focusWindow(id) {
  const w = windows.get(id);
  if (!w) return;
  if (w.minimized) restoreWindow(id);
  zTop += 1;
  w.el.style.zIndex = zTop;
  $$(".window").forEach((node) => node.classList.add("inactive"));
  w.el.classList.remove("inactive");
  activeWindow = w;
  emit("window:focus", w);
}

export function closeWindow(id) {
  const w = windows.get(id);
  if (!w) return;
  w.el.classList.add("closing");
  w.onClose?.();
  setTimeout(() => {
    w.el.remove();
    windows.delete(id);
    if (activeWindow === w) activeWindow = null;
    emit("window:close", w);
    // focus next
    const remaining = [...windows.values()].filter((x) => !x.minimized).sort((a,b) => b.z - a.z);
    if (remaining[0]) focusWindow(remaining[0].id);
  }, 180);
}

export function minimizeWindow(id) {
  const w = windows.get(id);
  if (!w || w.minimized) return;
  w.minimized = true;
  w.prevRect = { left: w.el.style.left, top: w.el.style.top, width: w.el.style.width, height: w.el.style.height };
  w.el.classList.add("minimizing");
  setTimeout(() => { w.el.style.display = "none"; w.el.classList.remove("minimizing"); }, 200);
  minimizedOrder.push(id);
  emit("window:minimize", w);
  const remaining = [...windows.values()].filter((x) => !x.minimized).sort((a,b)=>b.z-a.z);
  if (remaining[0]) focusWindow(remaining[0].id);
}

export function restoreWindow(id) {
  const w = windows.get(id);
  if (!w) return;
  w.minimized = false;
  w.el.style.display = "";
  w.el.classList.add("opening");
  setTimeout(() => w.el.classList.remove("opening"), 220);
  focusWindow(id);
  emit("window:restore", w);
}

export function toggleMaximize(id) {
  const w = windows.get(id);
  if (!w) return;
  if (w.maximized) {
    Object.assign(w.el.style, w.prevRect);
    w.el.classList.remove("fullscreen");
    w.maximized = false;
  } else {
    w.prevRect = { left: w.el.style.left, top: w.el.style.top, width: w.el.style.width, height: w.el.style.height };
    const mb = 28, dock = 92;
    w.el.style.left = "0px";
    w.el.style.top = mb + "px";
    w.el.style.width = window.innerWidth + "px";
    w.el.style.height = (window.innerHeight - mb - dock) + "px";
    w.el.classList.add("fullscreen");
    w.maximized = true;
  }
  emit("window:resize", w);
}

function makeDraggable(w) {
  const handle = w.el.querySelector(".titlebar");
  let dragging = false, sx, sy, ox, oy;
  handle.addEventListener("mousedown", (e) => {
    if (e.target.closest(".traffic-light") || e.target.closest(".toolbar")) return;
    if (w.maximized) return;
    dragging = true;
    sx = e.clientX; sy = e.clientY;
    const rect = w.el.getBoundingClientRect();
    ox = rect.left; oy = rect.top;
    w.el.style.transition = "none";
    document.body.style.userSelect = "none";
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const nx = clamp(ox + e.clientX - sx, -w.el.offsetWidth + 80, window.innerWidth - 80);
    const ny = clamp(oy + e.clientY - sy, 28, window.innerHeight - 60);
    w.el.style.left = nx + "px";
    w.el.style.top = ny + "px";
  });
  window.addEventListener("mouseup", () => {
    if (dragging) { dragging = false; w.el.style.transition = ""; document.body.style.userSelect = ""; }
  });
  // double-click titlebar to maximize
  handle.addEventListener("dblclick", (e) => {
    if (e.target.closest(".traffic-light")) return;
    toggleMaximize(w.id);
  });
}

function makeResizable(w) {
  $$(".resize-handle", w.el).forEach((h) => {
    const dir = h.dataset.dir;
    let resizing = false, sx, sy, rect, ow, oh, ol, ot;
    h.addEventListener("mousedown", (e) => {
      if (w.maximized) return;
      resizing = true;
      sx = e.clientX; sy = e.clientY;
      rect = w.el.getBoundingClientRect();
      ow = rect.width; oh = rect.height; ol = rect.left; ot = rect.top;
      w.el.style.transition = "none";
      document.body.style.userSelect = "none";
      e.preventDefault();
      e.stopPropagation();
    });
    window.addEventListener("mousemove", (e) => {
      if (!resizing) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      let nw = ow, nh = oh, nl = ol, nt = ot;
      if (dir.includes("e")) nw = clamp(ow + dx, 280, window.innerWidth - ol);
      if (dir.includes("s")) nh = clamp(oh + dy, 160, window.innerHeight - ot);
      if (dir.includes("w")) { nw = clamp(ow - dx, 280, ol + ow); nl = ol + (ow - nw); }
      if (dir.includes("n")) { nh = clamp(oh - dy, 160, ot + oh); nt = ot + (oh - nh); }
      w.el.style.width = nw + "px"; w.el.style.height = nh + "px";
      w.el.style.left = nl + "px"; w.el.style.top = nt + "px";
    });
    window.addEventListener("mouseup", () => {
      if (resizing) { resizing = false; w.el.style.transition = ""; document.body.style.userSelect = ""; emit("window:resize", w); }
    });
  });
}

export function createWindow(opts) {
  const {
    app, title = "Untitled", appId,
    width = 720, height = 480,
    x, y, contentClass = "",
    titlebar = true, resizable = true, centered = true,
    onClose,
  } = opts;

  const id = uid();
  const win = el("div", { class: `window ${contentClass}`, dataset: { id, app: appId || app }, html: "" });

  // position
  const offset = windows.size * 26 % 140;
  const wx = x ?? clamp((window.innerWidth - width) / 2 + offset, 0, window.innerWidth - width);
  const wy = y ?? clamp(36 + offset, 28, window.innerHeight - 200);
  win.style.left = wx + "px";
  win.style.top = wy + "px";
  win.style.width = width + "px";
  win.style.height = height + "px";
  win.style.zIndex = ++zTop;

  if (titlebar) {
    const tb = el("div", { class: "titlebar", html: `
      <div class="traffic-lights">
        <div class="traffic-light close" data-act="close"></div>
        <div class="traffic-light min" data-act="min"></div>
        <div class="traffic-light max" data-act="max"></div>
      </div>
      <div class="title">${title}</div>
      <div class="toolbar"></div>` });
    win.append(tb);
    tb.querySelector('[data-act="close"]').addEventListener("click", () => closeWindow(id));
    tb.querySelector('[data-act="min"]').addEventListener("click", () => minimizeWindow(id));
    tb.querySelector('[data-act="max"]').addEventListener("click", () => toggleMaximize(id));
  }

  const content = el("div", { class: "window-content" });
  win.append(content);

  if (resizable) {
    win.append(el("div", { class: "resize-handle right", dataset: { dir: "e" } }));
    win.append(el("div", { class: "resize-handle bottom", dataset: { dir: "s" } }));
    win.append(el("div", { class: "resize-handle corner", dataset: { dir: "se" } }));
  }

  layer().append(win);
  win.classList.add("opening");
  setTimeout(() => win.classList.remove("opening"), 220);

  const wrec = { id, app: appId || app, appId: appId || app, el: win, content, title, z: zTop, maximized: false, minimized: false, onClose };
  windows.set(id, wrec);

  makeDraggable(wrec);
  if (resizable) makeResizable(wrec);

  win.addEventListener("mousedown", () => {
    if (activeWindow !== wrec) focusWindow(id);
  });

  focusWindow(id);
  emit("window:create", wrec);
  return wrec;
}

export function setTitle(id, title) {
  const w = windows.get(id);
  if (!w) return;
  w.title = title;
  const t = w.el.querySelector(".title");
  if (t) t.textContent = title;
}

export function getToolbar(id) {
  const w = windows.get(id);
  return w ? w.el.querySelector(".titlebar .toolbar") : null;
}

export function closeAllForApp(appId) {
  windowsForApp(appId).forEach((w) => closeWindow(w.id));
}

on("change", () => {
  // refresh window chrome colors handled by CSS variables
});
