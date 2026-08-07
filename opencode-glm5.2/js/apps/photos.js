// ===================================================================
// Photos
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";

const gradients = [
  ["#ff6b6b","#ffe66d"], ["#4ecdc4","#556270"], ["#c780ff","#5e5ce6"],
  ["#0a84ff","#5ac8fa"], ["#30d158","#a7e8a7"], ["#ff9f0a","#ff6b00"],
  ["#ff375f","#bf5af2"], ["#5ac8fa","#0a84ff"], ["#a8e063","#56ab2f"],
  ["#f857a6","#ff5858"], ["#00c6ff","#0072ff"], ["#fc4a1a","#f7b733"],
  ["#4776e6","#8e54e9"], ["#ee9ca7","#ffdde1"], ["#614385","#516395"],
  ["#02aab0","#00cdac"], ["#ff512f","#dd2476"], ["#1a2980","#26d0ce"],
  ["#ec008c","#fc6767"], ["#606c88","#3f4c6b"], ["#16222a","#3a6073"],
  ["#000428","#004e92"], ["#43cea2","#185a9d"], ["#ba5370","#f4e2d8"],
];

const photosApp = {
  id: "photos",
  name: "Photos",
  icon: icons.photos,
  launch() {
    const existing = windowsForApp("photos").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "photos", app: "Photos", title: "Photos", width: 820, height: 560, contentClass: "light-content" });
    renderPhotos(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }],
};

function renderPhotos(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  const sidebar = el("div", { class: "sidebar", style: { width: "180px" }, html: `
    <div class="sidebar-section">Photos</div>
    <div class="sidebar-item active">Library</div>
    <div class="sidebar-item">Recents</div>
    <div class="sidebar-item">Favorites</div>
    <div class="sidebar-section">Albums</div>
    <div class="sidebar-item">Vacation</div>
    <div class="sidebar-item">Family</div>
    <div class="sidebar-item">Nature</div>
    <div class="sidebar-item">Screenshots</div>` });

  const main = el("div", { style: { flex: "1", display: "flex", flexDirection: "column" } });
  main.append(el("div", { style: { padding: "16px 20px", fontSize: "18px", fontWeight: "700" }, text: "Library" }));
  const grid = el("div", { class: "content", style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "4px", padding: "0 8px 12px" } });
  gradients.forEach((g, i) => {
    const tile = el("div", { style: { aspectRatio: "1", background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, borderRadius: "4px", cursor: "pointer", position: "relative", overflow: "hidden" } });
    tile.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:flex-end;padding:6px"><span style="font-size:10px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.5)">IMG_${1000+i}</span></div>`;
    tile.addEventListener("click", () => openPhoto(win, i));
    grid.append(tile);
  });
  main.append(grid);
  win.content.append(root);
  root.append(sidebar, main);
}

function openPhoto(win, idx) {
  const overlay = el("div", { class: "sheet-overlay", style: { background: "rgba(0,0,0,0.85)" } });
  const g = gradients[idx];
  const photo = el("div", { style: { width: "min(80vw, 700px)", height: "min(70vh, 500px)", background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, borderRadius: "12px", display: "flex", alignItems: "flex-end", padding: "16px", color: "#fff", fontSize: "14px" }, text: `IMG_${1000+idx} · Lake Tahoe · ${new Date(2025, idx % 12, (idx % 28) + 1).toLocaleDateString()}` });
  const close = el("button", { class: "btn icon", html: ui.close, style: { position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.5)", color: "#fff" } });
  close.addEventListener("click", () => overlay.remove());
  overlay.append(photo, close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  win.content.append(overlay);
}

registerApp(photosApp);
export default photosApp;
