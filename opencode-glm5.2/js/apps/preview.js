// ===================================================================
// Preview
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow, setTitle } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";

const preview = {
  id: "preview",
  name: "Preview",
  icon: icons.preview,
  launch() {
    const existing = windowsForApp("preview").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    openFile(null);
  },
  openFile(node) { openFile(node); },
  menus: (win) => [{ label: "File", rows: [{ label: "Open…", action: () => import("./finder.js").then(m=>m.default.launch()) }, { label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }, { label: "Tools", rows: [{ label: "Crop", disabled: true }, { label: "Adjust Color", disabled: true }] }],
};

function openFile(node) {
  const win = createWindow({ appId: "preview", app: "Preview", title: node ? node.name : "Preview", width: 640, height: 480, contentClass: "dark-content" });
  renderPreview(win, node);
}

function renderPreview(win, node) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  const toolbar = el("div", { class: "toolbar-bar", html: `<button class="btn icon">${ui.chevronLeft}</button><button class="btn icon">${ui.chevronRight}</button><div style="flex:1;text-align:center;font-size:13px">${node ? node.name : "No document open"}</div><button class="btn icon">${ui.share}</button><button class="btn icon">${ui.grid}</button>` });
  root.append(toolbar);
  const view = el("div", { style: { flex: "1", overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(0,0,0,0.3)" } });
  if (!node) {
    view.append(el("div", { class: "empty-state", html: `${iconSVG("preview", 48)}<div>No document open</div><div style="font-size:12px">Open a file from Finder</div>` }));
  } else {
    // render content based on type
    if (node.ext === "txt" && node.content && node.content.startsWith("[image:")) {
      // draw a placeholder image
      const canvas = el("canvas", { width: 600, height: 400, style: { maxWidth: "100%", borderRadius: "8px", boxShadow: "0 8px 30px rgba(0,0,0,0.4)" } });
      const ctx = canvas.getContext("2d");
      const grads = [["#ff9f0a","#ff453a"],["#0a84ff","#5ac8fa"],["#30d158","#a7e8a7"]];
      const g = grads[node.name.length % grads.length];
      const grad = ctx.createLinearGradient(0, 0, 600, 400);
      grad.addColorStop(0, g[0]); grad.addColorStop(1, g[1]);
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.font = "20px sans-serif";
      ctx.fillText(node.content.replace(/^\[image:\s*|\]$/g, ""), 20, 380);
      view.append(canvas);
    } else {
      view.append(el("div", { style: { background: "#fff", color: "#1d1d1f", padding: "40px", borderRadius: "8px", maxWidth: "600px", whiteSpace: "pre-wrap", lineHeight: "1.6" }, text: node.content || "(empty file)" }));
    }
  }
  root.append(view);
  win.content.append(root);
}

registerApp(preview);
export default preview;
