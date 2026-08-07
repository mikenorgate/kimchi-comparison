// ===================================================================
// Finder
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, closeWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { fs } from "../core/filesystem.js";
import { el, $, $$, state } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";
import { toast } from "../core/notifications.js";

const finder = {
  id: "finder",
  name: "Finder",
  icon: icons.finder,
  launch(opts = {}) {
    const existing = windowsForApp("finder").filter((w) => !w.minimized);
    if (existing.length && !opts.path) { focusWindow(existing[0].id); return; }
    let path = opts.path || "Documents";
    const win = createWindow({
      appId: "finder", app: "Finder", title: path,
      width: 820, height: 520, contentClass: "light-content",
    });
    renderFinder(win, path);
  },
  refresh() { windowsForApp("finder").forEach((w) => { const p = w.finderPath; if (p) renderFinder(w, p); }); },
  openFile(node) {
    if (node.type === "folder") { finder.launch({ path: node.name }); return; }
    if (node.ext === "txt" || node.ext === "md" || node.ext === "text") {
      import("./textedit.js").then((m) => m.default.openFile(node));
    } else {
      import("./preview.js").then((m) => m.default.openFile(node));
    }
  },
  menus: (win) => [
    { label: "File", rows: [
      { label: "New Finder Window", shortcut: "⌘N", action: () => finder.launch() },
      { label: "New Folder", shortcut: "⇧⌘N", action: () => createItem(win, "folder") },
      { label: "New File", shortcut: "⌘N", action: () => createItem(win, "file") },
      { separator: true },
      { label: "Open", shortcut: "⌘O", action: () => openSelected(win) },
      { label: "Close Window", shortcut: "⌘W", action: () => closeWindow(win.id) },
    ]},
    { label: "Edit", rows: [
      { label: "Undo", shortcut: "⌘Z", disabled: true },
      { label: "Redo", shortcut: "⇧⌘Z", disabled: true },
      { separator: true },
      { label: "Cut", shortcut: "⌘X", disabled: true },
      { label: "Copy", shortcut: "⌘C", disabled: true },
      { label: "Paste", shortcut: "⌘V", disabled: true },
      { separator: true },
      { label: "Rename", action: () => renameSelected(win) },
      { label: "Move to Trash", action: () => deleteSelected(win) },
    ]},
    { label: "View", rows: [
      { label: "as Icons", checked: win?.view === "icon", action: () => setView(win, "icon") },
      { label: "as List", checked: win?.view === "list", action: () => setView(win, "list") },
      { separator: true },
      { label: "Show Sidebar", checked: true, action: () => toggleSidebar(win) },
    ]},
    { label: "Go", rows: [
      { label: "Back", shortcut: "⌘[", action: () => goBack(win) },
      { label: "Forward", shortcut: "⌘]", action: () => goForward(win) },
      { separator: true },
      { label: "Documents", action: () => navigate(win, "Documents") },
      { label: "Desktop", action: () => navigate(win, "Desktop") },
      { label: "Downloads", action: () => navigate(win, "Downloads") },
      { label: "Pictures", action: () => navigate(win, "Pictures") },
      { label: "Home", action: () => navigate(win, "/") },
    ]},
    { label: "Window", rows: [
      { label: "Minimize", shortcut: "⌘M", action: () => import("../core/windowManager.js").then(m => m.minimizeWindow(win.id)) },
      { label: "Zoom", action: () => import("../core/windowManager.js").then(m => m.toggleMaximize(win.id)) },
    ]},
    { label: "Help", rows: [{ label: "Finder Help", disabled: true }] },
  ],
};

function renderFinder(win, path) {
  win.finderPath = path;
  win.view = win.view || "icon";
  win.history = win.history || [path];
  win.historyIdx = win.historyIdx ?? 0;
  win.content.innerHTML = "";

  const sidebar = el("div", { class: "sidebar" });
  const sections = [
    { title: "Favorites", items: [
      { name: "AirDrop", icon: "airplane", path: null },
      { name: "Recents", icon: "clock", path: "/" },
      { name: "Applications", icon: "appstore", path: "Applications" },
      { name: "Desktop", icon: "folder", path: "Desktop" },
      { name: "Documents", icon: "folder", path: "Documents" },
      { name: "Downloads", icon: "folder", path: "Downloads" },
      { name: "Pictures", icon: "photos", path: "Pictures" },
      { name: "Movies", icon: "tv", path: "Movies" },
      { name: "Music", icon: "music", path: "Music" },
    ]},
    { title: "Locations", items: [
      { name: "Mike", icon: "home", path: "/" },
      { name: "Macintosh HD", icon: "finder", path: "/" },
      { name: "Network", icon: "wifi", path: null },
    ]},
    { title: "Tags", items: [
      { name: "Red", icon: "trash", path: null, color: "#ff453a" },
      { name: "Blue", icon: "trash", path: null, color: "#0a84ff" },
    ]},
  ];
  sections.forEach((sec) => {
    sidebar.append(el("div", { class: "sidebar-section", text: sec.title }));
    sec.items.forEach((it) => {
      const si = el("div", { class: "sidebar-item" + (it.path === path ? " active" : ""), html: `<span class="si-icon" style="${it.color ? `color:${it.color}` : ''}">${iconSVG(it.icon, 16)}</span>${it.name}` });
      if (it.path !== null) si.addEventListener("click", () => navigate(win, it.path));
      sidebar.append(si);
    });
  });

  const main = el("div", { style: { flex: "1", display: "flex", flexDirection: "column", minWidth: "0" } });
  const toolbar = el("div", { class: "toolbar-bar" });
  toolbar.innerHTML = `
    <button class="btn icon" data-act="back">${ui.chevronLeft}</button>
    <button class="btn icon" data-act="forward">${ui.chevronRight}</button>
    <div style="flex:1;text-align:center;font-weight:600;font-size:14px">${path === "/" ? "Mike" : path.split("/").pop()}</div>
    <button class="btn icon" data-act="newfolder">${ui.plus}</button>
    <button class="btn icon" data-act="view">${win.view === "icon" ? ui.list : ui.grid}</button>
    <button class="btn icon" data-act="share">${ui.share}</button>`;
  toolbar.querySelector('[data-act="back"]').addEventListener("click", () => goBack(win));
  toolbar.querySelector('[data-act="forward"]').addEventListener("click", () => goForward(win));
  toolbar.querySelector('[data-act="newfolder"]').addEventListener("click", () => createItem(win, "folder"));
  toolbar.querySelector('[data-act="view"]').addEventListener("click", () => setView(win, win.view === "icon" ? "list" : "icon"));
  main.append(toolbar);

  const content = el("div", { class: "content", style: { padding: "16px" } });
  const items = fs.list(path);
  if (!items.length) {
    content.append(el("div", { class: "empty-state", html: `${iconSVG("folder", 48)}<div>This folder is empty</div>` }));
  } else if (win.view === "icon") {
    const grid = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: "12px" } });
    items.forEach((node) => {
      const ic = el("div", { class: "finder-icon", style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 6px", borderRadius: "10px", cursor: "default" }, html: `<div>${node.type === "folder" ? iconSVG("folder", 52) : iconSVG("file", 52)}</div><div style="font-size:12px;text-align:center;word-break:break-word;max-width:90px;color:inherit">${node.name}</div>` });
      ic.addEventListener("dblclick", () => finder.openFile(node));
      ic.addEventListener("click", (e) => { select(win, ic, node); });
      grid.append(ic);
    });
    content.append(grid);
  } else {
    const list = el("div");
    list.append(el("div", { style: { display: "flex", padding: "4px 12px", fontSize: "11px", opacity: "0.5", fontWeight: "700", borderBottom: "0.5px solid var(--glass-border-soft)" }, html: `<span style="flex:1">Name</span><span style="width:120px">Date Modified</span><span style="width:80px">Kind</span>` }));
    items.forEach((node) => {
      const row = el("div", { class: "list-item", html: `<span style="display:flex;align-items:center;gap:8px;flex:1">${iconSVG(node.type === "folder" ? "folder" : "file", 18)}${node.name}</span><span style="width:120px;opacity:0.6;font-size:12px">Today</span><span style="width:80px;opacity:0.6;font-size:12px">${node.type === "folder" ? "Folder" : "Document"}</span>` });
      row.addEventListener("dblclick", () => finder.openFile(node));
      row.addEventListener("click", () => select(win, row, node));
      list.append(row);
    });
    content.append(list);
  }

  main.append(content);
  const split = el("div", { class: "split" });
  split.append(sidebar, main);
  win.content.append(split);

  // path bar at bottom
  const pathbar = el("div", { style: { padding: "4px 12px", fontSize: "11px", opacity: "0.6", borderTop: "0.5px solid var(--glass-border-soft)" }, text: `Mike > ${path === "/" ? "" : path}` });
  main.append(pathbar);

  win.selected = null;
  win.content.addEventListener("contextmenu", (e) => {
    if (win.selected) {
      e.preventDefault();
      import("../core/desktop.js").then((m) => m.showMenu(e.clientX, e.clientY, [
        { label: "Open", action: () => openSelected(win) },
        { label: "Rename", action: () => renameSelected(win) },
        { separator: true },
        { label: "Move to Trash", action: () => deleteSelected(win) },
      ]));
    }
  });
}

function select(win, elNode, node) {
  $$(".finder-icon, .list-item", win.content).forEach((n) => n.style.background = "");
  elNode.style.background = "rgba(10,132,255,0.2)";
  win.selected = node;
  win.selectedEl = elNode;
}

function navigate(win, path) {
  win.history = win.history.slice(0, win.historyIdx + 1);
  win.history.push(path);
  win.historyIdx = win.history.length - 1;
  renderFinder(win, path);
}
function goBack(win) {
  if (win.historyIdx > 0) { win.historyIdx--; renderFinder(win, win.history[win.historyIdx]); }
}
function goForward(win) {
  if (win.historyIdx < win.history.length - 1) { win.historyIdx++; renderFinder(win, win.history[win.historyIdx]); }
}
function setView(win, view) { win.view = view; renderFinder(win, win.finderPath); }
function toggleSidebar(win) { /* demo */ }
function openSelected(win) { if (win.selected) finder.openFile(win.selected); }
function createItem(win, type) {
  const name = type === "folder" ? "New Folder" : "New File.txt";
  fs.create(win.finderPath, name, type);
  renderFinder(win, win.finderPath);
  toast("Finder", `Created ${name}`, "finder");
}
function deleteSelected(win) {
  if (!win.selected) return;
  const name = win.selected.name;
  // find path
  const path = win.finderPath === "/" ? win.selected.name : win.finderPath + "/" + win.selected.name;
  fs.remove(path);
  import("./trash.js").then((m) => m.addTrash({ name, type: win.selected.type, content: win.selected.content }));
  renderFinder(win, win.finderPath);
  toast("Finder", `Moved "${name}" to Trash`, "finder");
}
function renameSelected(win) {
  if (!win.selected) return;
  const newName = prompt("Rename to:", win.selected.name);
  if (newName && newName !== win.selected.name) {
    const path = win.finderPath === "/" ? win.selected.name : win.finderPath + "/" + win.selected.name;
    fs.rename(path, newName);
    renderFinder(win, win.finderPath);
  }
}

registerApp(finder);
export default finder;
