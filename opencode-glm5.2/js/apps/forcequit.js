// ===================================================================
// Force Quit Applications
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow } from "../core/windowManager.js";
import { el, $, $$ } from "../core/state.js";
import { icons, iconSVG } from "../icons.js";
import { openWindows, closeWindow, focusWindow } from "../core/windowManager.js";
import { getApp } from "./registry.js";

const forceQuit = {
  id: "forcequit",
  name: "Force Quit",
  icon: icons.apple,
  hidden: true,
  launch() {
    const win = createWindow({ appId: "forcequit", app: "Force Quit", title: "Force Quit Applications", width: 380, height: 380, resizable: false, contentClass: "light-content" });
    render(win);
  },
};

function render(win) {
  win.content.innerHTML = "";
  const root = el("div", { style: { padding: "16px", height: "100%", display: "flex", flexDirection: "column", gap: "12px" } });
  root.append(el("div", { style: { fontSize: "13px", color: "#1d1d1f" }, text: "Select an app to force quit:" }));
  const list = el("div", { style: { flex: "1", overflow: "auto", border: "1px solid #d1d1d6", borderRadius: "8px", padding: "4px" } });
  const wins = openWindows();
  const seen = new Set();
  wins.forEach((w) => {
    if (seen.has(w.appId)) return;
    seen.add(w.appId);
    const app = getApp(w.appId);
    const row = el("div", { class: "list-item", style: { borderRadius: "6px" }, html: `${iconSVG(app?.id === "finder" ? "finder" : (app?.id || "file"), 20)}<span style="flex:1">${app?.name || w.app}</span>` });
    row.addEventListener("click", () => { $$(".list-item", list).forEach((r) => r.classList.remove("active")); row.classList.add("active"); win._sel = w.appId; });
    list.append(row);
  });
  if (!wins.length) list.append(el("div", { class: "empty-state", text: "No running apps" }));
  root.append(list);
  const btns = el("div", { style: { display: "flex", justifyContent: "flex-end", gap: "8px" } });
  const cancel = el("button", { class: "btn", text: "Cancel" });
  cancel.addEventListener("click", () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)));
  const force = el("button", { class: "btn", text: "Force Quit" });
  force.addEventListener("click", () => {
    if (!win._sel) return;
    openWindows().filter((w) => w.appId === win._sel).forEach((w) => closeWindow(w.id));
    import("../core/windowManager.js").then(m=>m.closeWindow(win.id));
  });
  btns.append(cancel, force);
  root.append(btns);
  win.content.append(root);
}

registerApp(forceQuit);
export default forceQuit;
