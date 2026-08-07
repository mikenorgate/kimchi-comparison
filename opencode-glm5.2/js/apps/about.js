// ===================================================================
// About This Mac
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el } from "../core/state.js";
import { icons, iconSVG } from "../icons.js";

const about = {
  id: "about",
  name: "About This Mac",
  icon: icons.apple,
  hidden: true,
  launch() {
    const existing = windowsForApp("about");
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "about", app: "About", title: "About This Mac", width: 420, height: 480, resizable: false, contentClass: "light-content" });
    win.content.innerHTML = "";
    const root = el("div", { style: { padding: "40px", textAlign: "center", color: "#1d1d1f" } });
    root.innerHTML = `
      <div style="margin:0 auto 20px;display:flex;justify-content:center">${icons.apple.replace('<svg ', '<svg width="64" height="76" ')}</div>
      <div style="font-size:24px;font-weight:600">macOS Tahoe</div>
      <div style="font-size:13px;opacity:0.6;margin-bottom:24px">Version 26.0</div>
      <div style="text-align:left;font-size:13px;line-height:2">
        <div style="display:flex;justify-content:space-between"><span style="opacity:0.6">Chip</span><span>Apple M3</span></div>
        <div style="display:flex;justify-content:space-between"><span style="opacity:0.6">Memory</span><span>16 GB</span></div>
        <div style="display:flex;justify-content:space-between"><span style="opacity:0.6">Startup disk</span><span>Macintosh HD</span></div>
        <div style="display:flex;justify-content:space-between"><span style="opacity:0.6">Serial number</span><span>TAH0E2026</span></div>
      </div>
      <div style="margin-top:28px;display:flex;gap:8px;justify-content:center">
        <button class="btn">More Info…</button>
        <button class="btn">Support</button>
      </div>`;
    win.content.append(root);
  },
};

registerApp(about);
export default about;
