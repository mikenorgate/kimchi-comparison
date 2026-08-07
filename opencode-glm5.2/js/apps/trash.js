// ===================================================================
// Trash
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $, on, emit } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";
import { toast } from "../core/notifications.js";

let trashItems = [];

const trash = {
  id: "trash",
  name: "Trash",
  icon: icons.trash,
  launch() {
    const existing = windowsForApp("trash").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "trash", app: "Trash", title: "Trash", width: 600, height: 400, contentClass: "light-content" });
    renderTrash(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "Empty Trash…", action: () => emptyTrash(win) }, { label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }],
  addTrash(item) { trashItems.push(item); },
};

function renderTrash(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  const toolbar = el("div", { class: "toolbar-bar", html: `<div style="flex:1;font-size:13px;opacity:0.6">${trashItems.length} item${trashItems.length===1?"":"s"}</div><button class="btn" id="empty">Empty</button>` });
  toolbar.querySelector("#empty").addEventListener("click", () => emptyTrash(win));
  root.append(toolbar);

  const content = el("div", { class: "content", style: { padding: "16px" } });
  if (!trashItems.length) {
    content.append(el("div", { class: "empty-state", html: `${iconSVG("trash", 48)}<div>Trash is empty</div>` }));
  } else {
    const grid = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: "12px" } });
    trashItems.forEach((item, i) => {
      const ic = el("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px", borderRadius: "8px", cursor: "default" }, html: `<div>${item.type === "folder" ? iconSVG("folder", 52) : iconSVG("file", 52)}</div><div style="font-size:12px;text-align:center">${item.name}</div>` });
      grid.append(ic);
    });
    content.append(grid);
  }
  root.append(content);
  win.content.append(root);
}

function emptyTrash(win) {
  if (!trashItems.length) { toast("Trash", "Trash is already empty", "trash"); return; }
  trashItems = [];
  renderTrash(win);
  toast("Trash", "Trash has been emptied", "trash");
}

export function addTrash(item) { trashItems.push(item); }

registerApp(trash);
export default trash;
