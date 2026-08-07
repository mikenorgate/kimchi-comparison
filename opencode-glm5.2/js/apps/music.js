// ===================================================================
// Music
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $, state } from "../core/state.js";
import { icons, iconSVG, ui } from "../icons.js";

const playlist = [
  { title: "Midnight Drive", artist: "Neon Skyline", duration: 213, color: "#5e5ce6" },
  { title: "Lake Tahoe", artist: "The Alpines", duration: 187, color: "#0a84ff" },
  { title: "Glass Horizon", artist: "Aurora Bay", duration: 245, color: "#ff375f" },
  { title: "Crystal Clear", artist: "Echo Park", duration: 198, color: "#30d158" },
  { title: "Liquid Light", artist: "Synth Wave", duration: 224, color: "#ff9f0a" },
  { title: "Tahoe Sunset", artist: "Mountain Air", duration: 267, color: "#bf5af2" },
  { title: "Neon Rain", artist: "City Lights", duration: 201, color: "#5ac8fa" },
  { title: "Pacific Blue", artist: "Coast Line", duration: 234, color: "#0a84ff" },
];

const music = {
  id: "music",
  name: "Music",
  icon: icons.music,
  launch() {
    const existing = windowsForApp("music").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "music", app: "Music", title: "Music", width: 840, height: 560, contentClass: "dark-content" });
    win._idx = 0;
    win._playing = false;
    win._progress = 0;
    renderMusic(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }, { label: "Controls", rows: [{ label: "Play/Pause", shortcut: "Space", action: () => togglePlay(win) }, { label: "Next", shortcut: "⌘→", action: () => next(win) }, { label: "Previous", shortcut: "⌘←", action: () => prev(win) }] }],
};

function renderMusic(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  const sidebar = el("div", { class: "sidebar", style: { width: "200px", background: "rgba(0,0,0,0.3)" } });
  sidebar.innerHTML = `
    <div class="sidebar-section">Apple Music</div>
    <div class="sidebar-item active">Listen Now</div>
    <div class="sidebar-item">Browse</div>
    <div class="sidebar-item">Radio</div>
    <div class="sidebar-section">Library</div>
    <div class="sidebar-item">Recently Added</div>
    <div class="sidebar-item">Artists</div>
    <div class="sidebar-item">Albums</div>
    <div class="sidebar-item">Songs</div>
    <div class="sidebar-section">Playlists</div>
    <div class="sidebar-item">My Favorites</div>
    <div class="sidebar-item">Chill Mix</div>
    <div class="sidebar-item">Workout</div>`;

  const main = el("div", { style: { flex: "1", display: "flex", flexDirection: "column", minWidth: "0" } });
  main.append(el("div", { style: { padding: "20px 24px", fontSize: "20px", fontWeight: "700" }, text: "Listen Now" }));
  const listWrap = el("div", { class: "content", style: { padding: "0 16px 100px" } });
  playlist.forEach((track, i) => {
    const row = el("div", { class: "list-item", style: { background: i === win._idx ? "rgba(10,132,255,0.2)" : "" }, html: `<div style="width:40px;height:40px;border-radius:6px;background:${track.color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px">${ui.play}</div><div style="flex:1"><div style="font-weight:600;font-size:14px">${track.title}</div><div style="font-size:12px;opacity:0.6">${track.artist}</div></div><div style="font-size:12px;opacity:0.5">${fmtDur(track.duration)}</div>` });
    row.addEventListener("click", () => { win._idx = i; win._playing = true; win._progress = 0; renderMusic(win); startProgress(win); });
    listWrap.append(row);
  });
  main.append(listWrap);

  // player bar
  const bar = el("div", { style: { height: "76px", borderTop: "0.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", padding: "0 20px", gap: "16px", background: "rgba(0,0,0,0.3)" } });
  const track = playlist[win._idx];
  bar.innerHTML = `
    <div style="width:50px;height:50px;border-radius:6px;background:${track.color};flex-shrink:0"></div>
    <div style="min-width:120px"><div style="font-size:13px;font-weight:600">${track.title}</div><div style="font-size:12px;opacity:0.6">${track.artist}</div></div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="display:flex;gap:16px;align-items:center">
        <button class="btn icon" id="prev">${ui.prev}</button>
        <button class="btn icon" id="play" style="font-size:18px">${win._playing ? ui.pause : ui.play}</button>
        <button class="btn icon" id="next">${ui.next}</button>
      </div>
      <div style="display:flex;align-items:center;gap:8px;width:100%;max-width:400px">
        <span style="font-size:10px;opacity:0.5" id="cur">${fmtDur(win._progress)}</span>
        <div style="flex:1;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;overflow:hidden"><div id="prog" style="height:100%;width:${(win._progress/track.duration*100)}%;background:var(--accent)"></div></div>
        <span style="font-size:10px;opacity:0.5">${fmtDur(track.duration)}</span>
      </div>
    </div>`;
  bar.querySelector("#play").addEventListener("click", () => togglePlay(win));
  bar.querySelector("#prev").addEventListener("click", () => prev(win));
  bar.querySelector("#next").addEventListener("click", () => next(win));
  main.append(bar);

  win.content.append(sidebar, main);
  root.innerHTML = "";
  root.append(sidebar, main);
  win.content.append(root);
}

function togglePlay(win) { win._playing = !win._playing; renderMusic(win); if (win._playing) startProgress(win); }
function next(win) { win._idx = (win._idx + 1) % playlist.length; win._progress = 0; renderMusic(win); if (win._playing) startProgress(win); }
function prev(win) { win._idx = (win._idx - 1 + playlist.length) % playlist.length; win._progress = 0; renderMusic(win); if (win._playing) startProgress(win); }

function startProgress(win) {
  clearInterval(win._timer);
  if (!win._playing) return;
  win._timer = setInterval(() => {
    win._progress += 1;
    const track = playlist[win._idx];
    const prog = win.content.querySelector("#prog");
    const cur = win.content.querySelector("#cur");
    if (prog) prog.style.width = (win._progress / track.duration * 100) + "%";
    if (cur) cur.textContent = fmtDur(win._progress);
    if (win._progress >= track.duration) { clearInterval(win._timer); next(win); }
  }, 1000);
}

function fmtDur(s) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${String(sec).padStart(2, "0")}`; }

registerApp(music);
export default music;
