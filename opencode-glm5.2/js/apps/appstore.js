// ===================================================================
// App Store
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";
import { toast } from "../core/notifications.js";

const featured = [
  { name: "Pixelmator Pro", dev: "Pixelmator Team", cat: "Photo & Video", price: "$49.99", icon: "photos", color: "#bf5af2" },
  { name: "Things 3", dev: "Cultured Code", cat: "Productivity", price: "$49.99", icon: "reminders", color: "#0a84ff" },
  { name: "Bear Notes", dev: "Shiny Frog", cat: "Productivity", price: "Free", icon: "notes", color: "#1d1d1f" },
  { name: "CleanMyMac X", dev: "MacPaw", cat: "Utilities", price: "$39.95", icon: "settings", color: "#30d158" },
  { name: "DaVinci Resolve", dev: "Blackmagic", cat: "Video", price: "Free", icon: "tv", color: "#ff9f0a" },
  { name: "Logic Pro", dev: "Apple", cat: "Music", price: "$199.99", icon: "music", color: "#ff375f" },
];

const appstore = {
  id: "appstore",
  name: "App Store",
  icon: icons.appstore,
  launch() {
    const existing = windowsForApp("appstore").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "appstore", app: "App Store", title: "App Store", width: 820, height: 560, contentClass: "light-content" });
    win._tab = "discover";
    render(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }],
};

function render(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  const sidebar = el("div", { class: "sidebar", style: { width: "180px" } });
  [{ id: "discover", name: "Discover", icon: "home" }, { id: "arcade", name: "Arcade", icon: "appstore" }, { id: "create", name: "Create", icon: "photos" }, { id: "work", name: "Work", icon: "notes" }, { id: "play", name: "Play", icon: "music" }, { id: "dev", name: "Develop", icon: "terminal" }, { id: "updates", name: "Updates", icon: "settings" }].forEach((s) => {
    sidebar.append(el("div", { class: "sidebar-item" + (s.id === win._tab ? " active" : ""), html: `${iconSVG(s.icon, 16)}${s.name}`, onclick: () => { win._tab = s.id; render(win); } }));
  });

  const main = el("div", { class: "content", style: { padding: "24px" } });
  main.append(el("div", { style: { fontSize: "28px", fontWeight: "700", marginBottom: "6px" }, text: "Discover" }));
  main.append(el("div", { style: { fontSize: "14px", opacity: "0.6", marginBottom: "24px" }, text: "Apps we love right now" }));

  // big feature card
  const feature = featured[0];
  const card = el("div", { style: { background: `linear-gradient(135deg, ${feature.color}, #000)`, borderRadius: "16px", padding: "24px", color: "#fff", marginBottom: "24px" }, html: `<div style="font-size:13px;opacity:0.8;text-transform:uppercase">App of the Day</div><div style="font-size:28px;font-weight:700;margin-top:8px">${feature.name}</div><div style="opacity:0.8;margin-top:4px">${feature.dev}</div><button class="btn primary" style="margin-top:16px">${feature.price === "Free" ? "GET" : feature.price}</button>` });
  card.querySelector("button").addEventListener("click", () => toast("App Store", `Installing ${feature.name}…`, "appstore"));
  main.append(card);

  main.append(el("div", { style: { fontSize: "18px", fontWeight: "700", margin: "16px 0 12px" }, text: "Essential Apps" }));
  const grid = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" } });
  featured.forEach((app) => {
    const item = el("div", { style: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.03)" } });
    item.innerHTML = `<div style="width:48px;height:48px;border-radius:10px;background:${app.color};display:flex;align-items:center;justify-content:center">${iconSVG(app.icon, 28)}</div><div style="flex:1"><div style="font-weight:600;font-size:14px">${app.name}</div><div style="font-size:12px;opacity:0.6">${app.cat}</div></div><button class="btn" style="background:rgba(0,0,0,0.08)">${app.price === "Free" ? "GET" : app.price}</button>`;
    item.querySelector("button").addEventListener("click", () => toast("App Store", `Installing ${app.name}…`, "appstore"));
    grid.append(item);
  });
  main.append(grid);

  root.append(sidebar, main);
  win.content.append(root);
}

registerApp(appstore);
export default appstore;
