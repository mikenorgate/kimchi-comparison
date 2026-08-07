// ===================================================================
// Maps
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";

const places = [
  { name: "Emerald Bay State Park", lat: 38.95, lng: -120.15, cat: "Nature" },
  { name: "Heavenly Mountain Resort", lat: 38.93, lng: -119.94, cat: "Skiing" },
  { name: "Sand Harbor", lat: 39.20, lng: -119.94, cat: "Beach" },
  { name: "Kings Beach", lat: 39.24, lng: -120.03, cat: "Beach" },
  { name: "South Lake Tahoe", lat: 38.94, lng: -119.98, cat: "City" },
  { name: "Tahoe City", lat: 39.17, lng: -120.14, cat: "City" },
];

const mapsApp = {
  id: "maps",
  name: "Maps",
  icon: icons.maps,
  launch() {
    const existing = windowsForApp("maps").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "maps", app: "Maps", title: "Maps", width: 820, height: 560, contentClass: "light-content" });
    win._selected = null;
    renderMaps(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }],
};

function renderMaps(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  const sidebar = el("div", { class: "sidebar", style: { width: "240px" } });
  sidebar.append(el("div", { style: { padding: "10px" }, html: `<input class="field" placeholder="Search Maps" style="width:100%" />` }));
  const results = el("div", { class: "content" });
  places.forEach((p) => {
    const item = el("div", { class: "list-item", html: `${iconSVG("location", 16)}<div style="flex:1"><div style="font-size:13px;font-weight:500">${p.name}</div><div style="font-size:11px;opacity:0.6">${p.cat}</div></div>` });
    item.addEventListener("click", () => { win._selected = p; renderMaps(win); });
    sidebar.append(item);
  });

  // map canvas (procedural)
  const mapWrap = el("div", { style: { flex: "1", position: "relative", overflow: "hidden", background: "#dae8d8" } });
  const canvas = el("canvas", { width: 1200, height: 800, style: { width: "100%", height: "100%", display: "block" } });
  drawMap(canvas);
  mapWrap.append(canvas);
  // pin
  if (win._selected) {
    const pin = el("div", { style: { position: "absolute", left: `${40 + (win._selected.lng + 120.2) * 1400}%`, top: `${30 + (39.3 - win._selected.lat) * 700}%`, transform: "translate(-50%,-100%)", fontSize: "28px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))", pointerEvents: "none" }, text: "📍" });
    mapWrap.append(pin);
    mapWrap.append(el("div", { style: { position: "absolute", left: "12px", bottom: "12px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderRadius: "10px", padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }, html: `<div style="font-weight:600">${win._selected.name}</div><div style="font-size:12px;opacity:0.6">${win._selected.cat} · Lake Tahoe</div>` }));
  }
  // controls
  mapWrap.append(el("div", { style: { position: "absolute", top: "12px", right: "12px", display: "flex", flexDirection: "column", gap: "4px" }, html: `<button class="btn icon" style="background:#fff;color:#1d1d1f">+</button><button class="btn icon" style="background:#fff;color:#1d1d1f">−</button>` }));

  root.append(sidebar, mapWrap);
  win.content.append(root);
}

function drawMap(canvas) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  // water
  ctx.fillStyle = "#9ec7e8";
  ctx.fillRect(0, 0, w, h);
  // lake shape (Lake Tahoe-ish)
  ctx.fillStyle = "#3a8fd6";
  ctx.beginPath();
  const cx = w * 0.55, cy = h * 0.5;
  ctx.ellipse(cx, cy, w * 0.32, h * 0.34, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // land
  ctx.fillStyle = "#c8e6c0";
  ctx.beginPath();
  ctx.ellipse(w * 0.2, h * 0.3, w * 0.18, h * 0.22, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.85, h * 0.7, w * 0.2, h * 0.25, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.9, h * 0.2, w * 0.12, h * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  // roads
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.6); ctx.bezierCurveTo(w * 0.3, h * 0.4, w * 0.6, h * 0.8, w, h * 0.5);
  ctx.moveTo(w * 0.5, 0); ctx.bezierCurveTo(w * 0.4, h * 0.3, w * 0.7, h * 0.6, w * 0.6, h);
  ctx.stroke();
  // road labels
  ctx.fillStyle = "#888"; ctx.font = "12px sans-serif";
  ctx.fillText("US-50", w * 0.7, h * 0.45);
  ctx.fillText("CA-89", w * 0.35, h * 0.35);
  ctx.fillText("Lake Tahoe", cx - 40, cy + 5);
  // grid texture
  ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
}

registerApp(mapsApp);
export default mapsApp;
