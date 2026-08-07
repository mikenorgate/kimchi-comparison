// ===================================================================
// TV
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el } from "../core/state.js";
import { icons, iconSVG } from "../icons.js";

const shows = [
  { title: "Tahoe Dreams", cat: "Drama", color: "#0a84ff" },
  { title: "Crystal Lake", cat: "Mystery", color: "#5e5ce6" },
  { title: "Mountain High", cat: "Comedy", color: "#ff9f0a" },
  { title: "Code Breakers", cat: "Documentary", color: "#30d158" },
  { title: "Night Shift", cat: "Thriller", color: "#1d1d1f" },
  { title: "Sunset Avenue", cat: "Drama", color: "#ff375f" },
];

const tv = {
  id: "tv",
  name: "TV",
  icon: icons.tv,
  launch() {
    const existing = windowsForApp("tv").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "tv", app: "TV", title: "TV", width: 820, height: 540, contentClass: "dark-content" });
    render(win);
  },
};

function render(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app", style: { overflow: "auto" } });
  const hero = shows[0];
  root.append(el("div", { style: { background: `linear-gradient(135deg, ${hero.color}, #000)`, padding: "40px", color: "#fff" }, html: `<div style="font-size:13px;opacity:0.8;text-transform:uppercase">New Series</div><div style="font-size:32px;font-weight:700;margin-top:8px">${hero.title}</div><div style="opacity:0.8;margin-top:4px">${hero.cat}</div><button class="btn primary" style="margin-top:16px">▶ Play</button><button class="btn" style="margin-left:8px">+ Watchlist</button>` }));
  root.append(el("div", { style: { padding: "24px", fontSize: "20px", fontWeight: "700" }, text: "Up Next" }));
  const grid = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", padding: "0 24px 24px" } });
  shows.forEach((s) => {
    grid.append(el("div", { style: { cursor: "default" }, html: `<div style="aspect-ratio:16/9;border-radius:10px;background:linear-gradient(135deg, ${s.color}, #000);display:flex;align-items:flex-end;padding:10px;color:#fff;font-weight:600">${s.title}</div><div style="font-size:12px;opacity:0.6;margin-top:6px">${s.cat}</div>` }));
  });
  root.append(grid);
  win.content.append(root);
}

registerApp(tv);
export default tv;
