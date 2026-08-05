const desktop = document.getElementById("desktop");
const windowLayer = document.getElementById("windowLayer");
const dock = document.getElementById("dock");
const menuPopover = document.getElementById("menuPopover");
const spotlight = document.getElementById("spotlight");
const spotlightInput = document.getElementById("spotlightInput");
const spotlightResults = document.getElementById("spotlightResults");
const controlCenter = document.getElementById("controlCenter");
const notificationCenter = document.getElementById("notificationCenter");
const activeAppMenu = document.getElementById("activeAppMenu");
const toast = document.getElementById("toast");
const buildStatus = document.getElementById("buildStatus");

let z = 30;
let focusedApp = "Finder";
let noteCount = 3;
const state = {
  wifi: true,
  bluetooth: true,
  focus: false,
  stage: false,
  dark: false,
  clearIcons: false,
  volume: 58,
  brightness: 82,
  windows: new Map()
};

const apps = [
  { id: "finder", name: "Finder", icon: "F", color: "cyan" },
  { id: "safari", name: "Safari", icon: "S", color: "blue" },
  { id: "mail", name: "Mail", icon: "M", color: "cyan" },
  { id: "calendar", name: "Calendar", icon: "C", color: "red" },
  { id: "notes", name: "Notes", icon: "N", color: "gold" },
  { id: "photos", name: "Photos", icon: "P", color: "rose" },
  { id: "music", name: "Music", icon: "A", color: "coral" },
  { id: "phone", name: "Phone", icon: "T", color: "green" },
  { id: "settings", name: "Settings", icon: "G", color: "slate" },
  { id: "terminal", name: "Terminal", icon: ">", color: "slate" }
];

const menuTemplates = {
  system: [
    ["About This Mac", () => showAbout()],
    ["System Settings...", () => openApp("settings")],
    ["App Store...", () => notify("App Store", "This web desktop keeps installs inside the simulation.")],
    "-",
    ["Lock Screen", () => notify("Lock Screen", "The desktop is ready to unlock.")],
    ["Restart...", () => notify("Restart", "Session restarted visually.")],
    ["Shut Down...", () => notify("Shut Down", "Power controls are simulated.")]
  ],
  app: [
    ["About " + focusedApp, () => showAbout(focusedApp)],
    ["Settings...", () => openApp("settings")],
    "-",
    ["Hide " + focusedApp, () => minimizeFocused()],
    ["Hide Others", () => minimizeOthers()],
    ["Show All", () => showAllWindows()],
    "-",
    ["Quit " + focusedApp, () => closeFocused()]
  ],
  file: [
    ["New Finder Window", () => openApp("finder", true), "⌘N"],
    ["New Note", () => createNote(), "⇧⌘N"],
    ["New Browser Tab", () => openApp("safari"), "⌘T"],
    "-",
    ["Open Spotlight", () => toggleSpotlight(true), "⌘Space"],
    ["Print...", () => notify("Print", "A print sheet would open here.")]
  ],
  edit: [
    ["Undo", () => notify("Undo", "Last interface action reversed where possible."), "⌘Z"],
    ["Redo", () => notify("Redo", "Nothing to redo."), "⇧⌘Z"],
    "-",
    ["Cut", () => document.execCommand("cut"), "⌘X"],
    ["Copy", () => document.execCommand("copy"), "⌘C"],
    ["Paste", () => document.execCommand("paste"), "⌘V"],
    "-",
    ["Select All", () => document.execCommand("selectAll"), "⌘A"]
  ],
  view: [
    ["Toggle Widgets", () => document.getElementById("widgets").classList.toggle("hidden")],
    ["Use Dark Appearance", () => toggleDark()],
    ["Clear Icon Look", () => toggleClearIcons()],
    "-",
    ["Arrange Windows", () => arrangeWindows()],
    ["Enter Full Screen", () => maximizeFocused()]
  ],
  go: [
    ["Applications", () => openApp("finder")],
    ["Documents", () => openApp("notes")],
    ["Pictures", () => openApp("photos")],
    ["Music", () => openApp("music")],
    ["Utilities", () => openApp("terminal")]
  ],
  window: [
    ["Minimize", () => minimizeFocused(), "⌘M"],
    ["Zoom", () => maximizeFocused()],
    ["Bring All to Front", () => showAllWindows()],
    ["Close", () => closeFocused(), "⌘W"]
  ],
  help: [
    ["Tahoe Desktop Help", () => openHelp()],
    ["Search Menus", () => toggleSpotlight(true)],
    ["Send Feedback", () => notify("Feedback", "Thanks. Feedback was captured locally.")]
  ]
};

function iconHTML(app) {
  return `<span class="app-icon ${app.color}">${app.icon}</span>`;
}

function renderDock() {
  dock.innerHTML = apps.map(app => `
    <button data-open="${app.id}" title="${app.name}">
      ${iconHTML(app)}
      <small>${app.name}</small>
      <span class="running-dot ${state.windows.has(app.id) ? "" : "hidden"}"></span>
    </button>
  `).join("");
}

function focusWindow(win) {
  document.querySelectorAll(".window").forEach(w => w.classList.remove("focused"));
  win.classList.add("focused");
  win.style.zIndex = ++z;
  focusedApp = win.dataset.name;
  activeAppMenu.textContent = focusedApp;
}

function openApp(id, fresh = false) {
  const app = apps.find(a => a.id === id);
  if (!app) return;
  const key = fresh ? `${id}-${Date.now()}` : id;
  if (!fresh && state.windows.has(id)) {
    const existing = state.windows.get(id);
    existing.classList.remove("hidden");
    focusWindow(existing);
    return;
  }
  const win = document.createElement("section");
  win.className = "window glass";
  win.dataset.app = id;
  win.dataset.name = app.name;
  win.style.width = `${Math.min(760, window.innerWidth - 80)}px`;
  win.style.height = `${Math.min(520, window.innerHeight - 150)}px`;
  win.style.left = `${70 + state.windows.size * 34}px`;
  win.style.top = `${62 + state.windows.size * 26}px`;
  win.innerHTML = `
    <div class="titlebar">
      <div class="traffic">
        <button class="close" title="Close"></button>
        <button class="min" title="Minimize"></button>
        <button class="max" title="Zoom"></button>
      </div>
      <div class="window-title">${app.name}</div>
      <div class="toolbar">${toolbarFor(id)}</div>
    </div>
    ${contentFor(id)}
  `;
  windowLayer.appendChild(win);
  state.windows.set(key, win);
  wireWindow(win, key);
  focusWindow(win);
  renderDock();
}

function toolbarFor(id) {
  const map = {
    finder: `<button class="tool" data-action="arrange">Grid</button><button class="tool" data-action="new-note">New</button>`,
    safari: `<button class="tool" data-action="back">Back</button><button class="tool" data-action="reload">Reload</button>`,
    notes: `<button class="tool" data-action="new-note">New</button>`,
    mail: `<button class="tool" data-action="send-mail">Send</button>`,
    music: `<button class="tool" data-action="play">Play</button>`,
    phone: `<button class="tool" data-action="call">Call</button>`,
    terminal: `<button class="tool" data-action="clear-terminal">Clear</button>`,
    settings: `<button class="tool" data-action="toggle-dark">Appearance</button>`
  };
  return map[id] || `<button class="tool" data-action="refresh">Refresh</button>`;
}

function contentFor(id) {
  const today = new Date();
  const day = today.getDate();
  const files = ["Applications", "Desktop", "Documents", "Downloads", "Pictures", "Music", "Movies", "AirDrop", "iCloud Drive"];
  const side = items => `<aside class="sidebar">${items.map((x, i) => `<button class="${i === 0 ? "selected" : ""}">${x}</button>`).join("")}</aside>`;
  if (id === "finder") return `<div class="content split">${side(["Favorites", "iCloud Drive", "Applications", "Desktop", "Documents", "Downloads", "Pictures", "Shared"])}<div class="pane grid">${files.map((x, i) => `<button class="file-tile" data-open="${i === 2 ? "notes" : i === 4 ? "photos" : ""}"><span class="folder-icon ${["cyan","violet","gold","green"][i % 4]}">${x[0]}</span><span>${x}</span></button>`).join("")}</div></div>`;
  if (id === "safari") return `<div class="content"><div class="pane"><div class="browser-bar"><button class="tool" data-action="back">Back</button><input class="address" value="https://www.apple.com/macos/tahoe/" aria-label="Address"><button class="tool" data-action="go-url">Go</button></div><div class="start-page">${apps.slice(0,8).map(a => `<button class="file-tile" data-open="${a.id}">${iconHTML(a)}<span>${a.name}</span></button>`).join("")}</div><h2>Start Page</h2><p>Favorites, Reading List, privacy report, and web previews work inside this simulated browser shell.</p></div></div>`;
  if (id === "notes") return `<div class="content split">${side(["Tahoe checklist", "Meeting notes", "Ideas", "Archive"])}<div class="pane"><textarea class="notes-editor">Tahoe interface checklist\n\n- Liquid Glass menu bar, Dock, windows, sidebars, and toolbars\n- Spotlight actions\n- Custom Control Center\n- Working representative apps\n- Draggable and resizable windows\n\nEdit this note directly.</textarea></div></div>`;
  if (id === "mail") return `<div class="content split">${side(["Inbox 12", "VIP", "Sent", "Drafts", "Archive"])}<div class="pane"><h2>New Message</h2><input class="address" value="team@example.com"><textarea class="mail-editor">Here is the Tahoe desktop prototype. Menus, controls, windows, and apps are interactive.</textarea></div></div>`;
  if (id === "calendar") return `<div class="content"><div class="pane"><h2>${today.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2><div class="calendar-grid">${Array.from({length: 35}, (_, i) => `<div class="day ${i + 1 === day ? "today" : ""}">${i + 1 <= 31 ? i + 1 : ""}</div>`).join("")}</div></div></div>`;
  if (id === "photos") return `<div class="content"><div class="pane"><h2>Library</h2><div class="photo-grid">${["linear-gradient(135deg,#39b7dd,#f6d365)","linear-gradient(135deg,#2dd4bf,#155e75)","linear-gradient(135deg,#ff9966,#ff5e62)","url(assets/tahoe-wallpaper.png) center/cover","linear-gradient(135deg,#a1c4fd,#c2e9fb)","linear-gradient(135deg,#84fab0,#8fd3f4)"].map(bg => `<button class="photo" style="--bg:${bg}" data-action="photo"></button>`).join("")}</div></div></div>`;
  if (id === "music") return `<div class="content"><div class="pane music-now"><div class="album"></div><div><h2>Tahoe Mix</h2><p>Glass Lake Drive</p><input type="range" value="34"><p><button class="pill" data-action="play">Play/Pause</button> <button class="pill" data-action="next-track">Next</button></p></div></div></div>`;
  if (id === "phone") return `<div class="content"><div class="pane"><h2>Phone</h2><p class="muted">Continuity calling simulation</p><div class="phone-keypad">${["1","2","3","4","5","6","7","8","9","*","0","#"].map(n => `<button data-action="dial">${n}</button>`).join("")}</div><p><button class="pill" data-action="call">Call</button></p></div></div>`;
  if (id === "settings") return `<div class="content split">${side(["Appearance", "Control Center", "Desktop & Dock", "Wi-Fi", "Notifications", "Privacy"])}<div class="pane"><h2>Appearance</h2>${settingRow("Dark Appearance", "toggle-dark", state.dark)}${settingRow("Clear Icon Look", "toggle-clear", state.clearIcons)}${settingRow("Show Widgets", "toggle-widgets", !document.getElementById("widgets").classList.contains("hidden"))}<div class="slider-row"><span>Liquid Glass diffusion</span><input type="range" min="20" max="90" value="58" data-action="glass-range"></div></div></div>`;
  return `<div class="content"><div class="terminal" id="term"><p>Tahoe Web Terminal</p><p>Try: help, apps, open safari, theme dark, clear</p><div id="termLog"></div><label>$ <input data-terminal autocomplete="off"></label></div></div>`;
}

function settingRow(label, action, active) {
  return `<div class="settings-row"><span>${label}</span><button class="switch ${active ? "active" : ""}" data-action="${action}" aria-label="${label}"></button></div>`;
}

function wireWindow(win, key) {
  win.addEventListener("pointerdown", () => focusWindow(win));
  win.querySelector(".close").addEventListener("click", () => {
    win.remove();
    state.windows.delete(key);
    renderDock();
  });
  win.querySelector(".min").addEventListener("click", () => win.classList.add("hidden"));
  win.querySelector(".max").addEventListener("click", () => maximize(win));
  const titlebar = win.querySelector(".titlebar");
  titlebar.addEventListener("pointerdown", event => dragWindow(event, win));
  win.addEventListener("click", event => {
    const target = event.target.closest("[data-open], [data-action]");
    if (!target) return;
    if (target.dataset.open) openApp(target.dataset.open);
    if (target.dataset.action) runAction(target.dataset.action, target, win);
  });
  const terminalInput = win.querySelector("[data-terminal]");
  if (terminalInput) {
    terminalInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        runTerminal(terminalInput.value, win);
        terminalInput.value = "";
      }
    });
  }
}

function dragWindow(event, win) {
  if (event.target.tagName === "BUTTON") return;
  const startX = event.clientX;
  const startY = event.clientY;
  const rect = win.getBoundingClientRect();
  titlePointer(event.currentTarget, true);
  const move = e => {
    const left = Math.max(0, Math.min(window.innerWidth - 90, rect.left + e.clientX - startX));
    const top = Math.max(34, Math.min(window.innerHeight - 100, rect.top + e.clientY - startY));
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
  };
  const up = () => {
    titlePointer(event.currentTarget, false);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

function titlePointer(el, grabbing) {
  el.style.cursor = grabbing ? "grabbing" : "grab";
}

function maximize(win = document.querySelector(".window.focused")) {
  if (!win) return;
  if (win.dataset.max === "true") {
    Object.assign(win.style, JSON.parse(win.dataset.prev));
    win.dataset.max = "false";
  } else {
    win.dataset.prev = JSON.stringify({ left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height });
    Object.assign(win.style, { left: "10px", top: "42px", width: "calc(100vw - 20px)", height: "calc(100vh - 138px)" });
    win.dataset.max = "true";
  }
}

function runAction(action, target, win) {
  const actions = {
    arrange: arrangeWindows,
    "new-note": createNote,
    back: () => notify("Safari", "Navigation history is empty."),
    reload: () => notify("Safari", "Page reloaded."),
    "go-url": () => notify("Safari", "Loaded the typed address in the simulated page."),
    "send-mail": () => notify("Mail", "Message sent."),
    play: () => notify("Music", "Playback toggled."),
    "next-track": () => notify("Music", "Next track: Emerald Bay."),
    call: () => notify("Phone", "Calling from nearby iPhone..."),
    dial: () => notify("Phone", `Dialed ${target.textContent.trim()}`),
    photo: () => notify("Photos", "Photo opened in preview."),
    "clear-terminal": () => win.querySelector("#termLog").innerHTML = "",
    refresh: () => notify("Refresh", "Content refreshed."),
    "toggle-dark": toggleDark,
    "toggle-clear": toggleClearIcons,
    "toggle-widgets": () => document.getElementById("widgets").classList.toggle("hidden"),
    "glass-range": () => {}
  };
  actions[action]?.();
}

function runTerminal(command, win) {
  const log = win.querySelector("#termLog");
  const line = document.createElement("p");
  const cmd = command.trim();
  let out = "command not found";
  if (cmd === "help") out = "Commands: help, apps, open <app>, theme dark, theme light, clear";
  if (cmd === "apps") out = apps.map(a => a.name).join(", ");
  if (cmd.startsWith("open ")) {
    const app = apps.find(a => a.name.toLowerCase() === cmd.slice(5).toLowerCase() || a.id === cmd.slice(5).toLowerCase());
    out = app ? `Opening ${app.name}` : "No matching app";
    if (app) openApp(app.id);
  }
  if (cmd === "theme dark") { document.body.classList.add("dark"); state.dark = true; out = "Dark appearance enabled"; }
  if (cmd === "theme light") { document.body.classList.remove("dark"); state.dark = false; out = "Light appearance enabled"; }
  if (cmd === "clear") { log.innerHTML = ""; return; }
  line.textContent = `$ ${cmd}\n${out}`;
  log.appendChild(line);
}

function renderMenus(name, button) {
  const items = menuTemplates[name] || [];
  menuPopover.innerHTML = items.map(item => item === "-" ? `<div class="menu-sep"></div>` : `<button class="menu-item"><span>${item[0]}</span><small>${item[2] || ""}</small></button>`).join("");
  const rect = button.getBoundingClientRect();
  menuPopover.style.left = `${rect.left}px`;
  menuPopover.style.top = `${rect.bottom + 5}px`;
  menuPopover.hidden = false;
  [...menuPopover.querySelectorAll(".menu-item")].forEach((node, i) => {
    const actions = items.filter(Boolean).filter(x => x !== "-");
    node.addEventListener("click", () => {
      menuPopover.hidden = true;
      actions[i][1]();
    });
  });
}

function renderControlCenter() {
  controlCenter.innerHTML = `
    <div class="control-grid">
      ${controlTile("wifi", "Wi-Fi", state.wifi ? "TahoeNet" : "Off")}
      ${controlTile("bluetooth", "Bluetooth", state.bluetooth ? "On" : "Off")}
      ${controlTile("focus", "Focus", state.focus ? "Do Not Disturb" : "Off")}
      ${controlTile("stage", "Stage Manager", state.stage ? "On" : "Off")}
    </div>
    <div class="slider-row"><span>Display</span><input type="range" min="10" max="100" value="${state.brightness}" data-slider="brightness"></div>
    <div class="slider-row"><span>Sound</span><input type="range" min="0" max="100" value="${state.volume}" data-slider="volume"></div>
    <button class="app-button" data-open="settings">Customize Controls...</button>
  `;
}

function controlTile(id, title, subtitle) {
  return `<button class="control-tile ${state[id] ? "active" : ""}" data-toggle="${id}"><strong>${title}</strong><span>${subtitle}</span></button>`;
}

function renderNotifications() {
  notificationCenter.innerHTML = `
    <div class="widget"><span>Today</span><strong>${new Date().toLocaleDateString(undefined, { weekday: "long" })}</strong><small>No critical alerts</small></div>
    <div class="widget"><span>Calendar</span><strong>2:30</strong><small>Design review</small></div>
    <div class="widget"><span>Mail</span><strong>12</strong><small>Unread messages</small></div>
  `;
}

function renderSpotlight() {
  const q = spotlightInput.value.toLowerCase();
  const appResults = apps.filter(a => a.name.toLowerCase().includes(q) || a.id.includes(q));
  const actions = [
    ["Toggle Dark Appearance", toggleDark],
    ["Arrange Windows", arrangeWindows],
    ["Open Control Center", () => toggleControl(true)],
    ["Create New Note", createNote]
  ].filter(a => a[0].toLowerCase().includes(q));
  spotlightResults.innerHTML = [
    ...appResults.map(a => `<button class="result-row" data-open="${a.id}">${iconHTML(a)}<span>${a.name}</span><small>Application</small></button>`),
    ...actions.map((a, i) => `<button class="result-row" data-spot-action="${i}"><span class="app-icon mint">A</span><span>${a[0]}</span><small>Action</small></button>`)
  ].join("") || `<div class="result-row"><span></span><span>No results</span><small></small></div>`;
  spotlightResults.querySelectorAll("[data-spot-action]").forEach(node => node.addEventListener("click", () => {
    actions[Number(node.dataset.spotAction)][1]();
    toggleSpotlight(false);
  }));
}

function toggleSpotlight(show = spotlight.hidden) {
  spotlight.hidden = !show;
  if (show) {
    closePanels("spotlight");
    spotlightInput.value = "";
    renderSpotlight();
    spotlightInput.focus();
  }
}

function toggleControl(show = controlCenter.hidden) {
  controlCenter.hidden = !show;
  if (show) {
    closePanels("control");
    renderControlCenter();
  }
}

function closePanels(except = "") {
  if (except !== "spotlight") spotlight.hidden = true;
  if (except !== "control") controlCenter.hidden = true;
  if (except !== "notifications") notificationCenter.hidden = true;
  menuPopover.hidden = true;
}

function notify(title, message) {
  toast.innerHTML = `<strong>${title}</strong><div>${message}</div>`;
  toast.hidden = false;
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => toast.hidden = true, 2400);
  buildStatus.textContent = message.slice(0, 34);
}

function showAbout(name = "Tahoe Desktop") {
  notify(name, "A browser-based desktop simulation inspired by macOS Tahoe 26 Liquid Glass.");
}

function openHelp() {
  notify("Help", "Use the Dock, menu bar, Control Center, Spotlight, desktop icons, and window controls.");
}

function createNote() {
  openApp("notes");
  noteCount += 1;
  notify("Notes", `Created note ${noteCount}.`);
}

function toggleDark() {
  state.dark = !state.dark;
  document.body.classList.toggle("dark", state.dark);
  notify("Appearance", state.dark ? "Dark appearance enabled." : "Light appearance enabled.");
}

function toggleClearIcons() {
  state.clearIcons = !state.clearIcons;
  document.body.classList.toggle("clear-icons", state.clearIcons);
  notify("Icons", state.clearIcons ? "Clear icon look enabled." : "Color icon look enabled.");
}

function arrangeWindows() {
  [...document.querySelectorAll(".window")].forEach((win, i) => {
    Object.assign(win.style, {
      left: `${24 + (i % 3) * 42}px`,
      top: `${48 + (i % 4) * 34}px`,
      width: `${Math.min(720, window.innerWidth - 96)}px`,
      height: `${Math.min(500, window.innerHeight - 168)}px`
    });
    win.classList.remove("hidden");
  });
}

function focusedWindow() {
  return document.querySelector(".window.focused");
}

function closeFocused() {
  const win = focusedWindow();
  if (win) win.querySelector(".close").click();
}

function minimizeFocused() {
  const win = focusedWindow();
  if (win) win.classList.add("hidden");
}

function minimizeOthers() {
  const focused = focusedWindow();
  document.querySelectorAll(".window").forEach(win => {
    if (win !== focused) win.classList.add("hidden");
  });
}

function showAllWindows() {
  document.querySelectorAll(".window").forEach(win => win.classList.remove("hidden"));
}

function maximizeFocused() {
  maximize(focusedWindow());
}

function tickClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
  document.getElementById("dateTile").textContent = now.getDate();
}

document.addEventListener("click", event => {
  const menuButton = event.target.closest(".menu-trigger");
  if (menuButton) {
    document.querySelectorAll(".menu-trigger").forEach(b => b.classList.remove("active"));
    menuButton.classList.add("active");
    renderMenus(menuButton.dataset.menu, menuButton);
    return;
  }
  const dockButton = event.target.closest("[data-open]");
  if (dockButton && !event.target.closest(".window")) {
    openApp(dockButton.dataset.open);
    return;
  }
  if (!event.target.closest(".popover,.spotlight,.control-center,.notification-center,.menu-bar")) {
    closePanels();
    document.querySelectorAll(".menu-trigger").forEach(b => b.classList.remove("active"));
  }
});

document.getElementById("spotlightBtn").addEventListener("click", () => toggleSpotlight(true));
document.getElementById("controlBtn").addEventListener("click", () => toggleControl());
document.getElementById("focusBtn").addEventListener("click", () => { state.focus = !state.focus; notify("Focus", state.focus ? "Do Not Disturb on." : "Focus off."); });
document.getElementById("wifiBtn").addEventListener("click", () => { state.wifi = !state.wifi; notify("Wi-Fi", state.wifi ? "Connected to TahoeNet." : "Wi-Fi off."); });
document.getElementById("clock").addEventListener("click", () => {
  notificationCenter.hidden = !notificationCenter.hidden;
  if (!notificationCenter.hidden) {
    closePanels("notifications");
    renderNotifications();
  }
});

controlCenter.addEventListener("click", event => {
  const toggle = event.target.closest("[data-toggle]");
  if (toggle) {
    state[toggle.dataset.toggle] = !state[toggle.dataset.toggle];
    renderControlCenter();
  }
  const opener = event.target.closest("[data-open]");
  if (opener) openApp(opener.dataset.open);
});

controlCenter.addEventListener("input", event => {
  if (event.target.dataset.slider) {
    state[event.target.dataset.slider] = event.target.value;
    notify(event.target.dataset.slider, `${event.target.value}%`);
  }
});

spotlightInput.addEventListener("input", renderSpotlight);
spotlightResults.addEventListener("click", event => {
  const row = event.target.closest("[data-open]");
  if (row) {
    openApp(row.dataset.open);
    toggleSpotlight(false);
  }
});

document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.code === "Space") {
    event.preventDefault();
    toggleSpotlight(true);
  }
  if (event.key === "Escape") closePanels();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "w") closeFocused();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") openApp("finder", true);
});

renderDock();
tickClock();
setInterval(tickClock, 1000);
openApp("finder");
