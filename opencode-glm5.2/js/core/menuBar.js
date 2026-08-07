// ===================================================================
// Menu Bar — Apple menu, active app menus, status icons, clock
// ===================================================================
import { $, el, fmtTime, fmtDate, emit, on, state, setState } from "./state.js";
import { activeWin } from "./windowManager.js";
import { getApp } from "../apps/registry.js";
import { icons, iconSVG } from "../icons.js";
import { openSpotlight } from "./spotlight.js";
import { openControlCenter } from "./controlCenter.js";
import { openNotificationCenter } from "./notifications.js";
import { toast } from "./notifications.js";

let openMenu = null;

export function initMenuBar() {
  const bar = $("#menu-bar");
  bar.innerHTML = "";

  const left = el("div", { class: "menu-left", style: { display: "flex", gap: "2px", alignItems: "center" } });
  const right = el("div", { class: "menu-bar-right" });

  bar.append(left, el("div", { class: "spacer" }), right);

  renderLeft(left);
  renderRight(right);

  // clock ticker
  setInterval(() => updateClock(), 1000);
  updateClock();

  // close menu on outside click
  document.addEventListener("click", (e) => {
    if (openMenu && !e.target.closest(".menu-dropdown") && !e.target.closest(".menu-item")) closeMenu();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  on("window:focus", () => renderLeft(left));
  on("window:close", () => renderLeft(left));
  on("change", () => renderRight(right));
}

function renderLeft(container) {
  container.innerHTML = "";
  // Apple menu
  const apple = el("div", { class: "menu-item apple", html: `<span class="apple-logo">${icons.apple}</span>` });
  apple.style.color = "#fff";
  const appleLogo = apple.querySelector(".apple-logo svg") || apple.querySelector(".apple-logo");
  applySvg(apple.querySelector(".apple-logo"), icons.apple, 14);
  apple.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu(apple, appleMenu());
  });
  container.append(apple);

  const aw = activeWin();
  const app = aw ? getApp(aw.appId) : getApp("finder");
  if (app) {
    const nameItem = el("div", { class: "menu-item app-name", text: app.name });
    nameItem.addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(nameItem, appMenu(app, aw)); });
    container.append(nameItem);

    const menus = (app.menus ? (typeof app.menus === "function" ? app.menus(aw) : app.menus) : []) || [];
    menus.forEach((m) => {
      const mi = el("div", { class: "menu-item", text: m.label });
      mi.addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(mi, menuToRows(m)); });
      container.append(mi);
    });
  }
}

function applySvg(node, svgStr, size) {
  node.innerHTML = svgStr.replace('<svg ', `<svg width="${size}" height="${size}" `);
}

function renderRight(container) {
  container.innerHTML = "";
  const push = (iconName, title, onClick) => {
    const item = el("div", { class: "menu-bar-icon", title });
    applySvg(item, icons[iconName] || iconName, 17);
    item.style.color = "#fff";
    if (onClick) item.addEventListener("click", (e) => { e.stopPropagation(); onClick(e); });
    container.append(item);
    return item;
  };

  if (state.airplane) { const a = push("airplane", "Airplane Mode"); a.style.color = "#ff9f0a"; }
  if (state.wifi) push("wifi", "Wi-Fi: On", () => openControlCenter());
  push("battery", `Battery: ${state.brightness > 30 ? "Charged" : "Low"}`);
  push("spotlightCC", "Spotlight", openSpotlight);
  push("control", "Control Center", (e) => { openControlCenter(); });
  // clock
  const clock = el("div", { class: "menu-bar-clock", text: "" });
  clock.addEventListener("click", (e) => { e.stopPropagation(); openNotificationCenter(); });
  container.append(clock);
  container._clock = clock;
}

function updateClock() {
  const clock = $(".menu-bar-clock");
  if (clock) {
    const d = new Date();
    const time = fmtTime(d);
    const date = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    clock.textContent = `${date}  ${time}`;
  }
}

function toggleMenu(anchor, rows) {
  if (openMenu && openMenu.anchor === anchor) { closeMenu(); return; }
  closeMenu();
  const rect = anchor.getBoundingClientRect();
  const dropdown = el("div", { class: "menu-dropdown" });
  renderRows(dropdown, rows);
  dropdown.style.left = rect.left + "px";
  dropdown.style.top = (rect.bottom) + "px";
  document.body.append(dropdown);
  // keep within viewport
  const dw = dropdown.offsetWidth;
  if (rect.left + dw > window.innerWidth) dropdown.style.left = (window.innerWidth - dw - 8) + "px";
  anchor.classList.add("open");
  openMenu = { anchor, dropdown };
}

function closeMenu() {
  if (!openMenu) return;
  openMenu.dropdown.remove();
  openMenu.anchor.classList.remove("open");
  openMenu = null;
}

function renderRows(container, rows) {
  rows.forEach((r) => {
    if (r.separator) { container.append(el("div", { class: "menu-row separator" })); return; }
    const row = el("div", { class: "menu-row" + (r.disabled ? " disabled" : "") });
    row.innerHTML = `<span>${r.label}${r.checked ? '<span class="check">&#10003;</span>' : ""}</span>${r.shortcut ? `<span class="shortcut">${r.shortcut}</span>` : ""}`;
    if (!r.disabled && r.action) {
      row.addEventListener("click", () => { r.action(); closeMenu(); });
    }
    container.append(row);
  });
}

function menuToRows(m) { return m.rows || []; }

// ---- Apple menu ----
function appleMenu() {
  return [
    { label: "About This Mac", action: () => import("../apps/about.js").then(m => m.default.launch()) },
    { separator: true },
    { label: "System Settings…", shortcut: "⌘,", action: () => getApp("settings")?.launch() },
    { label: "App Store…", action: () => getApp("appstore")?.launch() },
    { separator: true },
    { label: "Recent Items", disabled: true },
    { separator: true },
    { label: "Force Quit…", shortcut: "⌥⌘⎋", action: () => import("../apps/forcequit.js").then(m => m.default.launch()) },
    { separator: true },
    { label: "Sleep", action: () => sleep() },
    { label: "Restart…", action: () => restart() },
    { label: "Shut Down…", action: () => shutdown() },
    { label: "Lock Screen", shortcut: "⌃⌘Q", action: () => lockScreen() },
    { label: "Log Out Mike…", shortcut: "⇧⌘Q", action: () => lockScreen() },
  ];
}

function appMenu(app, win) {
  const rows = [
    { label: `About ${app.name}`, action: () => toast(`About ${app.name}`, app.name + " — Version 26.0 (Tahoe)", app.id) },
    { separator: true },
    { label: "Settings…", shortcut: "⌘,", disabled: true },
    { separator: true },
  ];
  return rows;
}

export function sleep() { lockScreen(true); }
export function restart() {
  if (!confirm("Restart?")) return;
  location.reload();
}
export function shutdown() {
  if (!confirm("Shut Down?")) return;
  document.body.innerHTML = '<div style="position:fixed;inset:0;background:#000;display:flex;align-items:center;justify-content:center;color:#888;font:14px sans-serif">It is now safe to turn off your computer.</div>';
}
export function lockScreen(sleepMode = false) {
  const ls = $("#login-screen");
  const desktop = $("#desktop");
  desktop.classList.add("hidden");
  ls.classList.remove("hidden");
  setTimeout(() => $("#login-input")?.focus(), 100);
}
