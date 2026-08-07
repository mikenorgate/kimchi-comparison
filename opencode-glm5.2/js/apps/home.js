// ===================================================================
// Home (Home app for smart accessories)
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el } from "../core/state.js";
import { icons, iconSVG } from "../icons.js";

const accessories = [
  { name: "Living Room Light", room: "Living Room", on: true, icon: "sun" },
  { name: "Bedroom Light", room: "Bedroom", on: false, icon: "sun" },
  { name: "Thermostat", room: "Hallway", on: true, icon: "settings" },
  { name: "Front Door", room: "Outside", on: false, icon: "home" },
  { name: "Speaker", room: "Kitchen", on: true, icon: "music" },
  { name: "Camera", room: "Garage", on: false, icon: "facetime" },
];

const home = {
  id: "home",
  name: "Home",
  icon: icons.home,
  launch() {
    const existing = windowsForApp("home").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "home", app: "Home", title: "Home", width: 760, height: 520, contentClass: "light-content" });
    win._acc = accessories.map(a => ({ ...a }));
    render(win);
  },
};

function render(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app", style: { overflow: "auto" } });
  root.append(el("div", { style: { padding: "24px", fontSize: "24px", fontWeight: "700" }, text: "My Home" }));
  const grid = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", padding: "0 24px 24px" } });
  win._acc.forEach((a, i) => {
    const card = el("div", { style: { background: a.on ? "var(--accent)" : "rgba(0,0,0,0.05)", color: a.on ? "#fff" : "#1d1d1f", borderRadius: "14px", padding: "16px", cursor: "default" } });
    card.innerHTML = `<div style="font-size:24px;margin-bottom:8px">${a.on ? "💡" : "⚪"}</div><div style="font-weight:600;font-size:13px">${a.name}</div><div style="font-size:11px;opacity:0.7">${a.room}</div><div style="font-size:11px;margin-top:6px">${a.on ? "On" : "Off"}</div>`;
    card.addEventListener("click", () => { a.on = !a.on; render(win); });
    grid.append(card);
  });
  root.append(grid);
  win.content.append(root);
}

registerApp(home);
export default home;
