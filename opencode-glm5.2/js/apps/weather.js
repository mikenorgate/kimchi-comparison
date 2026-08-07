// ===================================================================
// Weather
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons, iconSVG } from "../icons.js";

const cities = [
  { name: "Lake Tahoe", temp: 72, cond: "Sunny", hi: 78, lo: 64, icon: "☀️", bg: "linear-gradient(180deg,#4a9eff,#1a6fd6)" },
  { name: "San Francisco", temp: 64, cond: "Partly Cloudy", hi: 68, lo: 56, icon: "⛅", bg: "linear-gradient(180deg,#6a8cae,#4a6c8e)" },
  { name: "New York", temp: 58, cond: "Rainy", hi: 62, lo: 50, icon: "🌧️", bg: "linear-gradient(180deg,#5a6470,#3a444e)" },
  { name: "London", temp: 52, cond: "Cloudy", hi: 55, lo: 47, icon: "☁️", bg: "linear-gradient(180deg,#7a8090,#5a6070)" },
  { name: "Tokyo", temp: 81, cond: "Clear", hi: 85, lo: 74, icon: "☀️", bg: "linear-gradient(180deg,#ff9f0a,#ff6b00)" },
  { name: "Paris", temp: 61, cond: "Mostly Sunny", hi: 66, lo: 54, icon: "🌤️", bg: "linear-gradient(180deg,#5ac8fa,#0a84ff)" },
];

const weather = {
  id: "weather",
  name: "Weather",
  icon: icons.weather,
  launch() {
    const existing = windowsForApp("weather").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "weather", app: "Weather", title: "Weather", width: 460, height: 580, contentClass: "dark-content", resizable: false });
    win._city = 0;
    renderWeather(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }, { label: "View", rows: cities.map((c, i) => ({ label: c.name, checked: i === win._city, action: () => { win._city = i; renderWeather(win); } })) }],
};

function renderWeather(win) {
  const c = cities[win._city];
  win.content.innerHTML = "";
  win.content.style.background = c.bg;
  const root = el("div", { style: { padding: "30px", color: "#fff", height: "100%", display: "flex", flexDirection: "column", gap: "20px", overflow: "auto" } });

  root.append(el("div", { style: { textAlign: "center" }, html: `
    <div style="font-size:28px;font-weight:500">${c.name}</div>
    <div style="font-size:80px;font-weight:200;line-height:1">${c.temp}°</div>
    <div style="font-size:18px;opacity:0.9">${c.cond}</div>
    <div style="font-size:15px;opacity:0.8">H:${c.hi}° L:${c.lo}°</div>
    <div style="font-size:50px;margin-top:10px">${c.icon}</div>` }));

  // hourly
  const hourly = el("div", { style: { background: "rgba(255,255,255,0.15)", borderRadius: "14px", padding: "14px", backdropFilter: "blur(10px)" } });
  hourly.append(el("div", { style: { fontSize: "12px", opacity: "0.7", marginBottom: "10px", textTransform: "uppercase" }, text: "Hourly Forecast" }));
  const hRow = el("div", { style: { display: "flex", gap: "18px", overflowX: "auto" } });
  const now = new Date().getHours();
  for (let h = 0; h < 8; h++) {
    const hour = (now + h) % 24;
    const t = c.temp + Math.round(Math.sin(h) * 4 - 2);
    hRow.append(el("div", { style: { textAlign: "center", minWidth: "48px" }, html: `<div style="font-size:12px;opacity:0.8">${h === 0 ? "Now" : ((hour % 12 || 12) + (hour >= 12 ? "PM" : "AM"))}</div><div style="font-size:24px;margin:4px 0">${h === 0 ? c.icon : "☀️"}</div><div style="font-size:14px;font-weight:600">${t}°</div>` }));
  }
  hourly.append(hRow);
  root.append(hourly);

  // 7-day
  const daily = el("div", { style: { background: "rgba(255,255,255,0.15)", borderRadius: "14px", padding: "14px", backdropFilter: "blur(10px)" } });
  daily.append(el("div", { style: { fontSize: "12px", opacity: "0.7", marginBottom: "10px", textTransform: "uppercase" }, text: "7-Day Forecast" }));
  const dayNames = ["Today", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayNames.forEach((d, i) => {
    const icon = ["☀️","⛅","🌧️","☁️","☀️","🌤️","☀️"][i];
    const hi = c.hi + Math.round(Math.sin(i) * 5);
    const lo = c.lo + Math.round(Math.cos(i) * 4);
    daily.append(el("div", { style: { display: "flex", alignItems: "center", padding: "6px 0", fontSize: "14px" }, html: `<span style="flex:1">${d}</span><span style="width:30px">${icon}</span><span style="width:36px;text-align:right;opacity:0.7">${lo}°</span><span style="width:60px;height:4px;background:linear-gradient(90deg,#5ac8fa,#ff9f0a);border-radius:2px;margin:0 8px"></span><span style="width:36px;text-align:right;font-weight:600">${hi}°</span>` }));
  });
  root.append(daily);

  win.content.append(root);
}

registerApp(weather);
export default weather;
