// ===================================================================
// FaceTime
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";

const contacts = [
  { name: "Sarah Chen", color: "#ff375f" },
  { name: "Mom", color: "#0a84ff" },
  { name: "Dev Team", color: "#30d158" },
  { name: "Jordan", color: "#ff9f0a" },
];

const facetime = {
  id: "facetime",
  name: "FaceTime",
  icon: icons.facetime,
  launch() {
    const existing = windowsForApp("facetime").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "facetime", app: "FaceTime", title: "FaceTime", width: 700, height: 500, contentClass: "dark-content" });
    render(win);
  },
};

function render(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  root.append(el("div", { style: { padding: "24px", textAlign: "center" }, html: `<div style="font-size:24px;font-weight:700">FaceTime</div><div style="opacity:0.6;margin-top:4px">Connect with video or audio</div>` }));
  const grid = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px", padding: "0 24px" } });
  contacts.forEach((c) => {
    const card = el("div", { style: { textAlign: "center", cursor: "default" } });
    card.innerHTML = `<div style="width:80px;height:80px;border-radius:50%;background:${c.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:600;margin:0 auto 8px">${c.name[0]}</div><div style="font-size:13px">${c.name}</div>`;
    card.addEventListener("click", () => startCall(win, c));
    grid.append(card);
  });
  root.append(grid);
  win.content.append(root);
}

function startCall(win, contact) {
  win.content.innerHTML = "";
  win.content.style.background = "#0a0a0c";
  const root = el("div", { style: { height: "100%", display: "flex", flexDirection: "column", position: "relative", background: `linear-gradient(135deg, ${contact.color}, #000)` } });
  root.append(el("div", { style: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }, html: `<div style="width:120px;height:120px;border-radius:50%;background:${contact.color};display:flex;align-items:center;justify-content:center;font-size:48px;color:#fff;font-weight:600;margin:0 auto">${contact.name[0]}</div><div style="margin-top:16px;font-size:22px;font-weight:600">${contact.name}</div><div style="opacity:0.7;margin-top:4px">connecting…</div>` }));
  // self preview
  root.append(el("div", { style: { position: "absolute", top: "16px", right: "16px", width: "120px", height: "90px", borderRadius: "10px", background: "linear-gradient(135deg,#5e5ce6,#0a84ff)", border: "2px solid rgba(255,255,255,0.3)" } }));
  // controls
  const bar = el("div", { style: { position: "absolute", bottom: "30px", left: "0", right: "0", display: "flex", justifyContent: "center", gap: "16px" } });
  bar.append(el("button", { class: "btn", style: { width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }, html: ui.volume }));
  bar.append(el("button", { class: "btn", style: { width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.2)" }, html: ui.grid }));
  const end = el("button", { class: "btn", style: { width: "56px", height: "56px", borderRadius: "50%", background: "var(--danger)", color: "#fff" }, html: ui.close });
  end.addEventListener("click", () => render(win));
  bar.append(end);
  root.append(bar);
  win.content.append(root);
}

registerApp(facetime);
export default facetime;
