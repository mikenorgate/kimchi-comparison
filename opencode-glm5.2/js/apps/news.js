// ===================================================================
// News
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el } from "../core/state.js";
import { icons, iconSVG } from "../icons.js";

const articles = [
  { title: "Apple unveils macOS Tahoe with Liquid Glass design", src: "Apple Newsroom", cat: "Technology", time: "2h ago", color: "#0a84ff" },
  { title: "Lake Tahoe sees record visitors this summer", src: "Tahoe Daily", cat: "Local", time: "4h ago", color: "#30d158" },
  { title: "New breakthrough in battery technology announced", src: "TechCrunch", cat: "Science", time: "5h ago", color: "#bf5af2" },
  { title: "Markets rally as tech stocks surge", src: "Bloomberg", cat: "Business", time: "6h ago", color: "#ff9f0a" },
  { title: "The best hiking trails around Lake Tahoe", src: "Outside", cat: "Sports", time: "8h ago", color: "#ff453a" },
  { title: "Film review: A stunning new thriller", src: "Variety", cat: "Entertainment", time: "10h ago", color: "#5e5ce6" },
];

const news = {
  id: "news",
  name: "News",
  icon: icons.news,
  launch() {
    const existing = windowsForApp("news").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "news", app: "News", title: "News", width: 820, height: 560, contentClass: "light-content" });
    render(win);
  },
};

function render(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app", style: { overflow: "auto" } });
  const hero = articles[0];
  root.append(el("div", { style: { background: `linear-gradient(135deg, ${hero.color}, #000)`, padding: "36px", color: "#fff", cursor: "default" }, html: `<div style="font-size:12px;opacity:0.8;text-transform:uppercase">${hero.cat}</div><div style="font-size:26px;font-weight:700;margin-top:8px;line-height:1.2">${hero.title}</div><div style="opacity:0.7;margin-top:8px;font-size:13px">${hero.src} · ${hero.time}</div>` }));
  root.append(el("div", { style: { padding: "20px 24px", fontSize: "20px", fontWeight: "700" }, text: "Top Stories" }));
  const grid = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", padding: "0 24px 24px" } });
  articles.slice(1).forEach((a) => {
    grid.append(el("div", { style: { display: "flex", gap: "12px", cursor: "default" }, html: `<div style="width:90px;height:90px;border-radius:10px;background:linear-gradient(135deg, ${a.color}, #000);flex-shrink:0"></div><div><div style="font-size:11px;color:var(--accent);text-transform:uppercase">${a.cat}</div><div style="font-weight:600;font-size:14px;margin:4px 0">${a.title}</div><div style="font-size:11px;opacity:0.5">${a.src} · ${a.time}</div></div>` }));
  });
  root.append(grid);
  win.content.append(root);
}

registerApp(news);
export default news;
