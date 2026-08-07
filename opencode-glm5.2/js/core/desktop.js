// ===================================================================
// Desktop — wallpaper, desktop icons, context menu
// ===================================================================
import { $, $$, el, state, on, emit } from "./state.js";
import { fs } from "./filesystem.js";
import { iconSVG, icons } from "../icons.js";
import { getApp } from "../apps/registry.js";

export function initDesktop() {
  renderDesktopIcons();
  initContextMenu();
  on("change", renderDesktopIcons);
}

function renderDesktopIcons() {
  const container = $("#desktop-icons");
  container.innerHTML = "";
  const desktop = fs.list("Desktop");
  // always show a "Macintosh HD" style icon + Trash on desktop? keep minimal: show desktop folder items
  const items = [
    { name: "Macintosh HD", icon: "finder", action: () => getApp("finder")?.launch() },
    ...desktop.map((n) => ({ name: n.name, icon: n.type === "folder" ? "folder" : "file", node: n })),
  ];
  items.forEach((it) => {
    const di = el("div", { class: "desktop-icon", html: `<div class="icon-img">${iconSVG(it.icon, 48)}</div><div class="icon-label">${it.name}</div>` });
    di.addEventListener("dblclick", () => {
      if (it.node) import("../apps/finder.js").then((m) => m.default.openFile(it.node));
      else if (it.action) it.action();
    });
    di.addEventListener("click", () => {
      $$(".desktop-icon").forEach((d) => d.classList.remove("selected"));
      di.classList.add("selected");
    });
    container.append(di);
  });
}

function initContextMenu() {
  const menu = $("#context-menu");
  document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".window") || e.target.closest(".menu-bar") || e.target.closest(".dock")) return;
    e.preventDefault();
    showMenu(e.clientX, e.clientY, [
      { label: "New Folder", action: () => { const n = fs.create("Desktop", "New Folder"); import("../apps/finder.js").then(m=>m.default.refresh()); renderDesktopIcons(); } },
      { label: "Get Info", disabled: true },
      { separator: true },
      { label: "Change Wallpaper…", action: () => getApp("settings")?.launch("wallpaper") },
      { label: state.theme === "dark" ? "Use Light Appearance" : "Use Dark Appearance", action: () => { state.theme = state.theme === "dark" ? "light" : "dark"; emit("themechange"); renderDesktopIcons(); } },
      { separator: true },
      { label: "Use Stacks", disabled: true },
      { label: "Sort By", disabled: true },
      { label: "Clean Up", disabled: true },
      { separator: true },
      { label: "Show Launchpad", action: () => import("./launchpad.js").then(m => m.openLaunchpad()) },
      { label: "Show View Options", disabled: true },
    ]);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#context-menu")) menu.classList.add("hidden");
  });
}

export function showMenu(x, y, rows) {
  const menu = $("#context-menu");
  menu.innerHTML = "";
  menu.classList.remove("hidden");
  rows.forEach((r) => {
    if (r.separator) { menu.append(el("div", { class: "menu-row separator" })); return; }
    const row = el("div", { class: "menu-row" + (r.disabled ? " disabled" : ""), html: `<span>${r.label}</span>` });
    if (!r.disabled && r.action) row.addEventListener("click", () => { r.action(); menu.classList.add("hidden"); });
    menu.append(row);
  });
  const rect = menu.getBoundingClientRect();
  menu.style.left = Math.min(x, window.innerWidth - rect.width - 8) + "px";
  menu.style.top = Math.min(y, window.innerHeight - rect.height - 8) + "px";
}
