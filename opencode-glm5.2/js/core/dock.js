// ===================================================================
// Dock
// ===================================================================
import { $, el } from "./state.js";
import { dockApps, getApp } from "../apps/registry.js";
import { iconSVG, icons } from "../icons.js";
import { openWindows, windowsForApp, focusWindow, restoreWindow } from "./windowManager.js";
import { openLaunchpad } from "./launchpad.js";
import { on } from "./state.js";

let minimized = []; // {winId, appId, title, icon}

export function initDock() {
  render();
  on("window:create", render);
  on("window:close", render);
  on("window:minimize", () => { render(); });
  on("window:restore", () => { render(); });
}

export function addMinimizedWindow(w) {
  minimized.push(w);
  render();
}
export function removeMinimizedWindow(id) {
  minimized = minimized.filter((m) => m.id !== id);
  render();
}

export function render() {
  const dock = $("#dock");
  dock.innerHTML = "";

  const showSep = (after) => {
    if (after) dock.append(el("div", { class: "dock-separator" }));
  };

  let sep = false;
  for (const id of dockApps) {
    if (id === "launchpad") {
      const item = makeDockItem("launchpad", "Launchpad", icons.launchpad, () => openLaunchpad(), false);
      dock.append(item);
      dock.append(el("div", { class: "dock-separator" }));
      continue;
    }
    if (id === "trash") {
      dock.append(el("div", { class: "dock-separator" }));
      const item = makeDockItem("trash", "Trash", icons.trash, () => getApp("trash")?.launch(), false);
      dock.append(item);
      continue;
    }
    const app = getApp(id);
    if (!app) continue;
    const running = windowsForApp(id).length > 0;
    const item = makeDockItem(id, app.name, app.icon, () => launch(app, id), running);
    dock.append(item);
  }

  // minimized windows
  if (minimized.length) {
    dock.append(el("div", { class: "dock-separator" }));
    minimized.forEach((w) => {
      const m = el("div", { class: "dock-item running", html: `<div class="dock-min-window" style="background:linear-gradient(135deg,#3a5a8a,#1a2a4a)"><div class="mini-title">${w.title}</div></div><div class="dock-tooltip">${w.title}</div>` });
      m.addEventListener("click", () => restoreWindow(w.id));
      dock.append(m);
    });
  }
}

function makeDockItem(id, name, iconSvg, onClick, running) {
  const item = el("div", { class: "dock-item" + (running ? " running" : ""), html: `<div class="dock-icon">${iconSvg}</div><div class="dock-running-dot"></div><div class="dock-tooltip">${name}</div>` });
  item.addEventListener("click", () => {
    item.classList.add("bouncing");
    setTimeout(() => item.classList.remove("bouncing"), 500);
    onClick();
  });
  return item;
}

function launch(app, id) {
  const wins = windowsForApp(id);
  if (wins.length) {
    // focus the most recent
    const visible = wins.filter((w) => !w.minimized);
    if (visible.length) focusWindow(visible[visible.length - 1].id);
    else focusWindow(wins[wins.length - 1].id);
  } else {
    app.launch?.();
  }
}
