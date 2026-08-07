// ===================================================================
// Clock — world clock, stopwatch, timer
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";

const worldCities = [
  { name: "Cupertino", offset: 0 }, { name: "New York", offset: 3 },
  { name: "London", offset: 8 }, { name: "Paris", offset: 9 },
  { name: "Tokyo", offset: 17 }, { name: "Sydney", offset: 18 },
];

const clock = {
  id: "clock",
  name: "Clock",
  icon: icons.clock,
  launch() {
    const existing = windowsForApp("clock").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "clock", app: "Clock", title: "Clock", width: 560, height: 480, contentClass: "dark-content" });
    win._tab = "world";
    renderClock(win);
  },
  menus: (win) => [{ label: "View", rows: [
    { label: "World Clock", checked: win._tab === "world", action: () => { win._tab = "world"; renderClock(win); } },
    { label: "Stopwatch", checked: win._tab === "stopwatch", action: () => { win._tab = "stopwatch"; renderClock(win); } },
    { label: "Timer", checked: win._tab === "timer", action: () => { win._tab = "timer"; renderClock(win); } },
  ]}],
};

function renderClock(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  const tabs = [{ id: "world", name: "World Clock" }, { id: "stopwatch", name: "Stopwatch" }, { id: "timer", name: "Timer" }];
  const tabBar = el("div", { style: { display: "flex", gap: "4px", padding: "10px 16px", borderBottom: "0.5px solid rgba(255,255,255,0.1)" } });
  tabs.forEach((t) => {
    const b = el("button", { class: "btn", style: { background: win._tab === t.id ? "var(--accent)" : "rgba(255,255,255,0.1)" }, text: t.name });
    b.addEventListener("click", () => { win._tab = t.id; renderClock(win); });
    tabBar.append(b);
  });
  root.append(tabBar);
  const body = el("div", { class: "content", style: { padding: "24px" } });
  if (win._tab === "world") {
    worldCities.forEach((c) => {
      const now = new Date(new Date().getTime() + c.offset * 3600000);
      body.append(el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "0.5px solid rgba(255,255,255,0.1)" }, html: `<div><div style="font-size:12px;opacity:0.6">${c.offset >= new Date().getTimezoneOffset()/-60 ? "Today" : "Tomorrow"}</div><div style="font-size:18px;font-weight:600">${c.name}</div></div><div style="font-size:42px;font-weight:200">${now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"UTC"})}</div>` }));
    });
    win._tick = setInterval(() => { if (win._tab === "world") renderClock(win); }, 30000);
  } else if (win._tab === "stopwatch") {
    clearInterval(win._tick);
    let elapsed = win._swElapsed || 0;
    let running = win._swRunning || false;
    const display = el("div", { style: { fontSize: "64px", fontWeight: "200", textAlign: "center", fontFamily: "'SF Mono',monospace", margin: "20px 0" } });
    const fmt = (ms) => { const m = Math.floor(ms/60000); const s = Math.floor((ms%60000)/1000); const cs = Math.floor((ms%1000)/10); return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(cs).padStart(2,"0")}`; };
    display.textContent = fmt(elapsed);
    body.append(display);
    const controls = el("div", { style: { display: "flex", gap: "12px", justifyContent: "center" } });
    const startBtn = el("button", { class: "btn primary", style: { padding: "8px 24px", borderRadius: "20px" }, text: running ? "Stop" : "Start" });
    const resetBtn = el("button", { class: "btn", style: { padding: "8px 24px", borderRadius: "20px" }, text: "Reset" });
    startBtn.addEventListener("click", () => {
      running = !running; win._swRunning = running; startBtn.textContent = running ? "Stop" : "Start";
      if (running) { win._swStart = Date.now() - elapsed; win._swTimer = setInterval(() => { elapsed = Date.now() - win._swStart; display.textContent = fmt(elapsed); win._swElapsed = elapsed; }, 31); }
      else clearInterval(win._swTimer);
    });
    resetBtn.addEventListener("click", () => { clearInterval(win._swTimer); elapsed = 0; win._swElapsed = 0; display.textContent = fmt(0); });
    controls.append(startBtn, resetBtn);
    body.append(controls);
  } else if (win._tab === "timer") {
    clearInterval(win._tick);
    body.append(el("div", { style: { textAlign: "center", fontSize: "14px", opacity: "0.7", marginBottom: "20px" }, text: "Countdown Timer" }));
    let secs = win._timerSecs || 60;
    let running = win._timerRunning || false;
    const display = el("div", { style: { fontSize: "64px", fontWeight: "200", textAlign: "center", fontFamily: "'SF Mono',monospace" } });
    const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
    display.textContent = fmt(secs);
    body.append(display);
    const presets = el("div", { style: { display: "flex", gap: "8px", justifyContent: "center", margin: "20px 0" } });
    [60, 300, 600, 900].forEach((p) => presets.append(el("button", { class: "btn", text: fmt(p), onclick: () => { secs = p; win._timerSecs = p; display.textContent = fmt(p); } })));
    body.append(presets);
    const controls = el("div", { style: { display: "flex", gap: "12px", justifyContent: "center" } });
    const startBtn = el("button", { class: "btn primary", style: { padding: "8px 24px", borderRadius: "20px" }, text: running ? "Pause" : "Start" });
    startBtn.addEventListener("click", () => {
      running = !running; win._timerRunning = running; startBtn.textContent = running ? "Pause" : "Start";
      if (running) { win._timerInterval = setInterval(() => { secs--; win._timerSecs = secs; display.textContent = fmt(secs); if (secs <= 0) { clearInterval(win._timerInterval); running = false; startBtn.textContent = "Start"; import("../core/notifications.js").then(m=>m.toast("Timer","Time's up!","clock")); } }, 1000); }
      else clearInterval(win._timerInterval);
    });
    controls.append(startBtn);
    body.append(controls);
  }
  root.append(body);
  win.content.append(root);
}

registerApp(clock);
export default clock;
