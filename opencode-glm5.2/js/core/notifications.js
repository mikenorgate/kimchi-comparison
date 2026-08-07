// ===================================================================
// Notifications (toasts + notification center widgets)
// ===================================================================
import { $, el, fmtTime, fmtDate, on } from "./state.js";
import { iconSVG } from "../icons.js";
import { state } from "./state.js";

let open = false;
const queue = [];

export function toast(title, body, iconName = "finder") {
  const toasts = $("#toasts");
  if (!toasts) return;
  const t = el("div", { class: "toast", html: `<div class="t-icon">${iconSVG(iconName, 34)}</div><div><div class="t-title">${title}</div>${body ? `<div class="t-body">${body}</div>` : ""}</div>` });
  toasts.append(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 4000);
}

export function openNotificationCenter() {
  if (open) return closeNotificationCenter();
  open = true;
  render();
  const nc = $("#notification-center");
  nc.classList.remove("hidden");
  setTimeout(() => document.addEventListener("click", outsideClose, { once: true }), 0);
}

function outsideClose(e) {
  if (!e.target.closest("#notification-center")) closeNotificationCenter();
  else setTimeout(() => document.addEventListener("click", outsideClose, { once: true }), 0);
}

export function closeNotificationCenter() {
  open = false;
  $("#notification-center").classList.add("hidden");
}

function render() {
  const nc = $("#notification-center");
  nc.innerHTML = "";

  // clock widget
  const now = new Date();
  const clockW = el("div", { class: "nc-widget nc-clock" });
  clockW.innerHTML = `<div class="time">${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</div><div class="date">${fmtDate(now)}</div>`;
  nc.append(clockW);

  // calendar widget
  const calW = el("div", { class: "nc-widget", style: { display: "flex", gap: "12px", alignItems: "center" } });
  calW.innerHTML = `<div class="nc-cal-day"><div class="month">${now.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</div><div class="num">${now.getDate()}</div></div><div><div style="font-size:12px;opacity:0.6">No Events Today</div><div class="nc-cal-title" style="margin-top:2px">Enjoy your day!</div></div>`;
  nc.append(calW);

  // weather widget
  const wW = el("div", { class: "nc-widget" });
  wW.innerHTML = `<div class="nc-weather"><div style="font-size:40px">☀️</div><div><div class="temp">72°</div><div class="loc">Lake Tahoe</div><div class="cc-sub">Sunny · H:78 L:64</div></div></div>`;
  nc.append(wW);

  // reminders preview
  const rW = el("div", { class: "nc-widget" });
  const items = state.reminders.filter(r => !r.done).slice(0, 3);
  rW.innerHTML = `<div class="cc-label" style="margin-bottom:8px">Reminders</div>${items.length ? items.map(r => `<div style="display:flex;align-items:center;gap:8px;padding:3px 0;font-size:13px"><div class="cc-icon" style="width:18px;height:18px;background:rgba(255,159,10,0.3)">${iconSVG("check", 12)}</div>${r.text}</div>`).join("") : '<div class="cc-sub">No reminders</div>'}`;
  nc.append(rW);
}

on("change", () => { if (open) render(); });
