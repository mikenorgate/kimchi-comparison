// ===================================================================
// Safari — browser shell with start page, tabs & favorites
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";
import { toast } from "../core/notifications.js";

const favorites = [
  { name: "Apple", url: "apple.com", color: "#1d1d1f", emoji: "" },
  { name: "Google", url: "google.com", color: "#4285f4", emoji: "🔍" },
  { name: "YouTube", url: "youtube.com", color: "#ff0000", emoji: "▶️" },
  { name: "GitHub", url: "github.com", color: "#24292e", emoji: "🐙" },
  { name: "Wikipedia", url: "wikipedia.org", color: "#000", emoji: "W" },
  { name: "Reddit", url: "reddit.com", color: "#ff4500", emoji: "🤖" },
  { name: "Twitter", url: "x.com", color: "#000", emoji: "𝕏" },
  { name: "Netflix", url: "netflix.com", color: "#e50914", emoji: "N" },
  { name: "Spotify", url: "spotify.com", color: "#1db954", emoji: "♫" },
  { name: "Amazon", url: "amazon.com", color: "#ff9900", emoji: "a" },
  { name: "Maps", url: "maps.apple.com", color: "#34a834", emoji: "📍" },
  { name: "iCloud", url: "icloud.com", color: "#3693f3", emoji: "☁️" },
];

const safari = {
  id: "safari",
  name: "Safari",
  icon: icons.safari,
  launch() {
    const existing = windowsForApp("safari").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "safari", app: "Safari", title: "Safari", width: 900, height: 600, contentClass: "light-content" });
    win._tabs = [{ id: "t1", title: "Start Page", url: "" }];
    win._activeTab = "t1";
    renderSafari(win);
  },
  menus: (win) => [
    { label: "File", rows: [
      { label: "New Window", shortcut: "⌘N", action: () => safari.launch() },
      { label: "New Tab", shortcut: "⌘T", action: () => newTab(win) },
      { label: "Close Tab", shortcut: "⌘W", action: () => closeTab(win) },
    ]},
    { label: "History", rows: [{ label: "Show All History", disabled: true }, { separator: true }, { label: "Clear History…", action: () => toast("Safari", "History cleared", "safari") }] },
    { label: "Bookmarks", rows: [{ label: "Show Start Page", action: () => navigate(win, "") }] },
  ],
};

function renderSafari(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });

  // tab bar
  const tabBar = el("div", { style: { display: "flex", gap: "2px", padding: "4px 8px", borderBottom: "0.5px solid var(--glass-border-soft)", background: "rgba(0,0,0,0.03)", overflowX: "auto" } });
  win._tabs.forEach((t) => {
    const tab = el("div", { style: { display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "6px", background: t.id === win._activeTab ? "rgba(255,255,255,0.6)" : "transparent", fontSize: "12px", cursor: "default", whiteSpace: "nowrap" }, html: `${iconSVG("safari", 12)}${t.title}<span style="opacity:0.4">✕</span>` });
    tab.addEventListener("click", (e) => { if (e.target.textContent === "✕") closeTab(win, t.id); else { win._activeTab = t.id; renderSafari(win); } });
    tabBar.append(tab);
  });
  const newTabBtn = el("button", { class: "btn icon", html: ui.plus });
  newTabBtn.addEventListener("click", () => newTab(win));
  tabBar.append(newTabBtn);
  root.append(tabBar);

  // toolbar
  const toolbar = el("div", { class: "toolbar-bar" });
  toolbar.innerHTML = `<button class="btn icon" data-act="back">${ui.chevronLeft}</button><button class="btn icon" data-act="fwd">${ui.chevronRight}</button>`;
  const addr = el("input", { class: "field", placeholder: "Search or enter website name", style: { flex: "1", textAlign: "center" } });
  const tab = win._tabs.find((t) => t.id === win._activeTab);
  addr.value = tab.url;
  addr.addEventListener("keydown", (e) => { if (e.key === "Enter") navigate(win, addr.value.trim()); });
  toolbar.append(el("button", { class: "btn icon", html: ui.reload || ui.check }));
  toolbar.querySelector('[data-act="back"]')?.addEventListener("click", () => { if (win._history && win._history.length > 1) { win._history.pop(); navigate(win, win._history[win._history.length - 1], true); } });
  const addrWrap = el("div", { style: { flex: "1", display: "flex", alignItems: "center", background: "rgba(255,255,255,0.1)", borderRadius: "7px", padding: "0 8px", gap: "6px" }, html: ui.search });
  addrWrap.querySelector("svg").style.opacity = "0.4";
  addr.style.background = "transparent";
  addr.style.border = "none";
  addrWrap.append(addr);
  toolbar.querySelector('[data-act="back"]').after();
  // rebuild toolbar properly
  toolbar.innerHTML = "";
  const backBtn = el("button", { class: "btn icon", html: ui.chevronLeft });
  backBtn.addEventListener("click", () => goBack(win));
  const fwdBtn = el("button", { class: "btn icon", html: ui.chevronRight });
  fwdBtn.addEventListener("click", () => goForward(win));
  toolbar.append(backBtn, fwdBtn, addrWrap, el("button", { class: "btn icon", html: ui.share, onclick: () => { navigator.clipboard?.writeText(tab.url); toast("Safari", "Link copied", "safari"); } }));
  root.append(toolbar);

  // page view
  const page = el("div", { class: "content", style: { background: "#fff", color: "#1d1d1f" } });
  renderPage(page, tab, win);
  root.append(page);

  win.content.append(root);
}

function renderPage(container, tab, win) {
  container.innerHTML = "";
  if (!tab.url) {
    // start page
    const start = el("div", { style: { padding: "40px", maxWidth: "640px", margin: "0 auto" } });
    start.append(el("div", { style: { textAlign: "center", fontSize: "28px", fontWeight: "300", marginBottom: "30px", opacity: "0.5" }, text: "Favorites" }));
    const grid = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "20px" } });
    favorites.forEach((f) => {
      const fav = el("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "default", padding: "8px", borderRadius: "10px" } });
      fav.innerHTML = `<div style="width:52px;height:52px;border-radius:12px;background:${f.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">${f.emoji}</div><div style="font-size:12px">${f.name}</div>`;
      fav.addEventListener("mouseenter", () => fav.style.background = "rgba(0,0,0,0.05)");
      fav.addEventListener("mouseleave", () => fav.style.background = "");
      fav.addEventListener("click", () => navigate(win, f.url));
      grid.append(fav);
    });
    start.append(grid);
    start.append(el("div", { style: { textAlign: "center", marginTop: "40px", fontSize: "12px", opacity: "0.4" }, text: "Safari — Start Page (simulated browser)" }));
    container.append(start);
    return;
  }
  const fav = favorites.find((f) => f.url === tab.url) || { name: tab.url, color: "#888", emoji: "🌐" };
  // simulated page
  const page = el("div", { style: { minHeight: "100%" } });
  page.innerHTML = `
    <div style="background:${fav.color};color:#fff;padding:60px 40px;text-align:center">
      <div style="font-size:48px;margin-bottom:10px">${fav.emoji}</div>
      <div style="font-size:32px;font-weight:700">${fav.name}</div>
      <div style="opacity:0.7;margin-top:6px">https://www.${tab.url}</div>
    </div>
    <div style="padding:30px 40px;max-width:720px;margin:0 auto;line-height:1.7;font-size:15px">
      <h2 style="margin-bottom:12px">Welcome to ${fav.name}</h2>
      <p>This is a simulated rendering of <strong>${tab.url}</strong>. In this macOS Tahoe web recreation, Safari shows a stylized placeholder page for each favorite rather than loading live web content (browsers block cross-origin iframe embedding).</p>
      <p>Feel free to explore the rest of the simulated operating system — open apps from the Dock, use Spotlight (⌘Space), drag windows around, and check System Settings.</p>
      <div style="display:flex;gap:12px;margin-top:24px">${favorites.slice(0,5).map(f=>`<div style="flex:1;padding:16px;border-radius:12px;background:#f5f5f7;text-align:center;cursor:pointer" onclick="this.dispatchEvent(new CustomEvent('pick',{bubbles:true}))" data-url="${f.url}"><div style="font-size:24px">${f.emoji}</div><div style="font-size:12px;margin-top:4px">${f.name}</div></div>`).join("")}</div>
    </div>`;
  page.querySelectorAll("[data-url]").forEach((d) => d.addEventListener("pick", (e) => { e.stopPropagation(); navigate(win, d.dataset.url); }));
  // also direct click
  page.querySelectorAll("[data-url]").forEach((d) => d.addEventListener("click", () => navigate(win, d.dataset.url)));
  container.append(page);
}

function navigate(win, url, skipHistory) {
  const tab = win._tabs.find((t) => t.id === win._activeTab);
  tab.url = url;
  tab.title = url ? favorites.find((f) => f.url === url)?.name || url : "Start Page";
  win._history = win._history || [""];
  if (!skipHistory) win._history.push(url);
  renderSafari(win);
}
function goBack(win) { if (win._history && win._history.length > 1) { win._history.pop(); navigate(win, win._history[win._history.length - 1], true); } }
function goForward(win) { /* simple */ }

function newTab(win) {
  const id = "t" + Date.now();
  win._tabs.push({ id, title: "Start Page", url: "" });
  win._activeTab = id;
  win._history = [""];
  renderSafari(win);
}
function closeTab(win, id) {
  id = id || win._activeTab;
  win._tabs = win._tabs.filter((t) => t.id !== id);
  if (!win._tabs.length) { import("../core/windowManager.js").then((m) => m.closeWindow(win.id)); return; }
  win._activeTab = win._tabs[win._tabs.length - 1].id;
  renderSafari(win);
}

registerApp(safari);
export default safari;
