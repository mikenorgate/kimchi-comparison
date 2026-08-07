// ===================================================================
// Podcasts
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el } from "../core/state.js";
import { icons, iconSVG } from "../icons.js";

const shows = [
  { title: "The Daily", host: "The NYT", cat: "News", color: "#1d1d1f" },
  { title: "Waveform", host: "MKBHD", cat: "Tech", color: "#ff453a" },
  { title: "Code Story", host: "Harris", cat: "Tech", color: "#0a84ff" },
  { title: "Hidden Brain", host: "Shankar", cat: "Science", color: "#bf5af2" },
  { title: "Planet Money", host: "NPR", cat: "Business", color: "#30d158" },
  { title: "Crime Junkie", host: "Brit & Ash", cat: "True Crime", color: "#8e8e93" },
];

const podcast = {
  id: "podcast",
  name: "Podcasts",
  icon: icons.podcast,
  launch() {
    const existing = windowsForApp("podcast").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "podcast", app: "Podcasts", title: "Podcasts", width: 820, height: 540, contentClass: "dark-content" });
    render(win);
  },
};

function render(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  root.append(el("div", { style: { padding: "24px" }, html: `<div style="font-size:28px;font-weight:700">Listen Now</div><div style="opacity:0.6;margin-top:4px">Your shows, all in one place</div>` }));
  shows.forEach((s) => {
    const card = el("div", { style: { display: "flex", alignItems: "center", gap: "14px", padding: "12px 24px", cursor: "default" } });
    card.innerHTML = `<div style="width:60px;height:60px;border-radius:12px;background:${s.color};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:28px">🎙️</div><div style="flex:1"><div style="font-weight:600">${s.title}</div><div style="font-size:13px;opacity:0.6">${s.host} · ${s.cat}</div></div><button class="btn primary" style="border-radius:20px;padding:6px 16px">Play</button>`;
    root.append(card);
  });
  win.content.append(root);
}

registerApp(podcast);
export default podcast;
