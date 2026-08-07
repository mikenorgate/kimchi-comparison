// ===================================================================
// System Settings
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $, state, setState, emit, on, wallpapers } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";
import { toast } from "../core/notifications.js";

const settings = {
  id: "settings",
  name: "System Settings",
  icon: icons.settings,
  launch(section) {
    const existing = windowsForApp("settings").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); if (section) existing[0]._section = section, renderSettings(existing[0]); return; }
    const win = createWindow({ appId: "settings", app: "System Settings", title: "System Settings", width: 820, height: 560, contentClass: "light-content" });
    win._section = section || "appearance";
    renderSettings(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }],
};

const sections = [
  { id: "appearance", name: "Appearance", icon: "sun" },
  { id: "wallpaper", name: "Wallpaper", icon: "photos" },
  { id: "display", name: "Displays", icon: "sun" },
  { id: "sound", name: "Sound", icon: "volume" },
  { id: "wifi", name: "Wi-Fi", icon: "wifi" },
  { id: "bluetooth", name: "Bluetooth", icon: "bluetooth" },
  { id: "network", name: "Network", icon: "airplane" },
  { id: "general", name: "General", icon: "settings" },
  { id: "battery", name: "Battery", icon: "battery" },
  { id: "focus", name: "Focus", icon: "moon" },
  { id: "notifications", name: "Notifications", icon: "messages" },
  { id: "users", name: "Users & Groups", icon: "home" },
];

function renderSettings(win) {
  win.content.innerHTML = "";
  const sidebar = el("div", { class: "sidebar", style: { width: "220px" } });
  sections.forEach((s) => {
    const item = el("div", { class: "sidebar-item" + (s.id === win._section ? " active" : ""), html: `<span class="si-icon">${iconSVG(s.icon, 16)}</span>${s.name}` });
    item.addEventListener("click", () => { win._section = s.id; renderSettings(win); });
    sidebar.append(item);
  });

  const main = el("div", { style: { flex: "1", overflow: "auto", padding: "30px" } });
  const sec = sections.find((s) => s.id === win._section);
  main.append(el("div", { style: { fontSize: "22px", fontWeight: "700", marginBottom: "20px" }, text: sec.name }));

  if (win._section === "appearance") {
    const opts = [{ id: "dark", name: "Dark", icon: "moon" }, { id: "light", name: "Light", icon: "sun" }];
    const row = el("div", { style: { display: "flex", gap: "16px", marginBottom: "24px" } });
    opts.forEach((o) => {
      const card = el("div", { style: { cursor: "default", textAlign: "center" } });
      const preview = el("div", { style: { width: "120px", height: "80px", borderRadius: "10px", background: o.id === "dark" ? "linear-gradient(135deg,#1c1c1e,#3a3a3c)" : "linear-gradient(135deg,#f5f5f7,#e5e5ea)", border: state.theme === o.id ? "3px solid var(--accent)" : "1px solid #d1d1d6" } });
      const label = el("div", { style: { marginTop: "8px", fontSize: "13px" }, text: o.name });
      card.append(preview, label);
      card.addEventListener("click", () => { setState({ theme: o.id }); emit("themechange"); renderSettings(win); });
      row.append(card);
    });
    main.append(row);
    main.append(settingRow("Accent color", colorPicker("accent", (c) => { setState({ accent: c }); document.documentElement.style.setProperty("--accent", c); })));
  } else if (win._section === "wallpaper") {
    const grid = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "14px" } });
    Object.entries(wallpapers).forEach(([name, val]) => {
      const card = el("div", { style: { cursor: "default", textAlign: "center" } });
      const thumb = el("div", { style: { width: "100%", height: "100px", borderRadius: "10px", background: val, border: state.wallpaper === name ? "3px solid var(--accent)" : "1px solid #d1d1d6" } });
      const label = el("div", { style: { marginTop: "6px", fontSize: "12px", textTransform: "capitalize" }, text: name });
      card.append(thumb, label);
      card.addEventListener("click", () => { setState({ wallpaper: name }); emit("themechange"); renderSettings(win); });
      grid.append(card);
    });
    main.append(grid);
  } else if (win._section === "wifi") {
    main.append(toggleRow("Wi-Fi", state.wifi, () => { setState({ wifi: !state.wifi }); renderSettings(win); }));
    if (state.wifi) {
      main.append(el("div", { style: { marginTop: "20px" } }));
      ["Home Network", "Coffee Shop", "Neighbor's WiFi", "Airport Free WiFi"].forEach((n, i) => {
        main.append(el("div", { class: "list-item", html: `${iconSVG("wifi", 16)}<span style="flex:1">${n}</span>${i === 0 ? '<span style="font-size:11px;color:var(--accent)">Connected</span>' : '<span style="opacity:0.4">🔒</span>'}` }));
      });
    }
  } else if (win._section === "bluetooth") {
    main.append(toggleRow("Bluetooth", state.bluetooth, () => { setState({ bluetooth: !state.bluetooth }); renderSettings(win); }));
    if (state.bluetooth) {
      main.append(el("div", { style: { marginTop: "20px" } }));
      ["AirPods Pro", "Magic Keyboard", "Magic Mouse", "AirPods Max"].forEach((n) => {
        main.append(el("div", { class: "list-item", html: `${iconSVG("bluetooth", 16)}<span style="flex:1">${n}</span><span style="font-size:11px;opacity:0.5">${Math.random() > 0.5 ? "Connected" : "Not Connected"}</span>` }));
      });
    }
  } else if (win._section === "sound") {
    main.append(el("div", { class: "list-item", html: `${iconSVG("volume", 16)}<span style="flex:1">Output Volume</span>` }));
    const slider = el("input", { type: "range", class: "cc-slider vol", min: "0", max: "100", value: state.volume, style: { width: "100%" } });
    slider.addEventListener("input", () => setState({ volume: +slider.value }));
    main.append(slider);
  } else if (win._section === "display") {
    main.append(el("div", { class: "list-item", html: `${iconSVG("sun", 16)}<span style="flex:1">Brightness</span>` }));
    const slider = el("input", { type: "range", class: "cc-slider bright", min: "10", max: "100", value: state.brightness, style: { width: "100%" } });
    slider.addEventListener("input", () => { setState({ brightness: +slider.value }); applyBrightness(); });
    main.append(slider);
  } else if (win._section === "general") {
    main.append(settingRow("About", el("div", { html: `<div style="line-height:1.8;font-size:13px">
      <strong>macOS Tahoe</strong><br>Version 26.0<br>Chip: Apple M3<br>Memory: 16 GB<br>Startup disk: Macintosh HD<br>Serial: TAH0E2026</div>` })));
  } else if (win._section === "battery") {
    const pct = Math.round(state.brightness * 0.8 + 20);
    main.append(el("div", { style: { fontSize: "48px", fontWeight: "300" }, text: `${pct}%` }));
    main.append(el("div", { style: { opacity: "0.6", marginBottom: "20px" }, text: pct > 20 ? "Battery is charged" : "Low Battery" }));
    main.append(settingRow("Low Power Mode", toggleSwitch(state.dnd, () => {})));
  } else if (win._section === "focus") {
    main.append(toggleRow("Do Not Disturb", state.dnd, () => { setState({ dnd: !state.dnd }); renderSettings(win); }));
  } else if (win._section === "notifications") {
    main.append(el("div", { class: "cc-sub", text: "Notification settings per app. Allowing notifications for all apps." }));
  } else if (win._section === "users") {
    main.append(el("div", { style: { display: "flex", alignItems: "center", gap: "16px" }, html: `<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#0a84ff,#5e5ce6);display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;font-weight:600">M</div><div><div style="font-size:18px;font-weight:600">Mike</div><div style="opacity:0.6;font-size:13px">Administrator</div></div>` }));
  } else {
    main.append(el("div", { class: "cc-sub", text: "Settings for " + sec.name }));
  }

  win.content.append(el("div", { class: "split" }, [sidebar, main]));
}

function applyBrightness() {
  const wp = $("#wallpaper");
  if (wp) wp.style.filter = `brightness(${0.6 + state.brightness / 250})`;
}

function settingRow(label, control) {
  return el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }, html: `<span style="font-size:14px">${label}</span>` }, [control]);
}
function toggleRow(label, on, onClick) {
  return el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }, html: `<span style="font-size:14px">${label}</span>` }, [toggleSwitch(on, onClick)]);
}
function toggleSwitch(on, onClick) {
  const s = el("div", { style: { width: "42px", height: "26px", borderRadius: "13px", background: on ? "var(--ok)" : "#ccc", position: "relative", cursor: "pointer", transition: "background 0.15s" } });
  const knob = el("div", { style: { width: "22px", height: "22px", borderRadius: "50%", background: "#fff", position: "absolute", top: "2px", left: on ? "18px" : "2px", transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" } });
  s.append(knob);
  s.addEventListener("click", () => { onClick(); });
  return s;
}
function colorPicker(key, onChange) {
  const colors = ["#0a84ff", "#ff453a", "#ff9f0a", "#30d158", "#bf5af2", "#ff375f", "#5ac8fa", "#8e8e93"];
  const wrap = el("div", { style: { display: "flex", gap: "8px" } });
  colors.forEach((c) => {
    const dot = el("div", { style: { width: "24px", height: "24px", borderRadius: "50%", background: c, border: state[key] === c ? "3px solid #fff" : "none", boxShadow: state[key] === c ? `0 0 0 2px ${c}` : "none", cursor: "pointer" } });
    dot.addEventListener("click", () => { onChange(c); });
    wrap.append(dot);
  });
  return wrap;
}

on("themechange", () => { applyBrightness(); });

registerApp(settings);
export default settings;
