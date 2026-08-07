// ===================================================================
// main.js — boot sequence & system initialization
// ===================================================================
import { $, state, setState, emit, applyTheme, on } from "./core/state.js";
import { initMenuBar } from "./core/menuBar.js";
import { initDock } from "./core/dock.js";
import { initDesktop } from "./core/desktop.js";
import { initSpotlight, openSpotlight, closeSpotlight } from "./core/spotlight.js";
import { initLaunchpad, openLaunchpad, closeLaunchpad } from "./core/launchpad.js";
import { loadFS } from "./core/filesystem.js";
import { toast } from "./core/notifications.js";

// Import all apps so they self-register
import "./apps/finder.js";
import "./apps/calculator.js";
import "./apps/notes.js";
import "./apps/terminal.js";
import "./apps/safari.js";
import "./apps/settings.js";
import "./apps/textedit.js";
import "./apps/calendar.js";
import "./apps/music.js";
import "./apps/photos.js";
import "./apps/weather.js";
import "./apps/clock.js";
import "./apps/reminders.js";
import "./apps/mail.js";
import "./apps/maps.js";
import "./apps/preview.js";
import "./apps/trash.js";
import "./apps/appstore.js";
import "./apps/about.js";
import "./apps/forcequit.js";
import "./apps/messages.js";
import "./apps/stocks.js";
import "./apps/podcast.js";
import "./apps/tv.js";
import "./apps/news.js";
import "./apps/facetime.js";
import "./apps/home.js";

import { getApp } from "./apps/registry.js";

// ---- Theme & global listeners ----
applyTheme();
document.documentElement.style.setProperty("--accent", state.accent);
on("themechange", () => { applyTheme(); document.documentElement.style.setProperty("--accent", state.accent); });

// ---- Boot sequence ----
function boot() {
  loadFS();
  const bootBar = $(".boot-progress-bar");
  const bootScreen = $("#boot-screen");
  let p = 0;
  const t = setInterval(() => {
    p += Math.random() * 18 + 6;
    if (p >= 100) { p = 100; clearInterval(t); bootBar.style.width = "100%"; setTimeout(showLogin, 400); }
    bootBar.style.width = Math.min(p, 100) + "%";
  }, 160);
}

function showLogin() {
  const bootScreen = $("#boot-screen");
  bootScreen.style.opacity = "0";
  setTimeout(() => {
    bootScreen.classList.add("hidden");
    const ls = $("#login-screen");
    ls.classList.remove("hidden");
    applyTheme();
    const input = $("#login-input");
    const btn = $("#login-btn");
    const enter = () => {
      ls.style.opacity = "0";
      setTimeout(() => {
        ls.classList.add("hidden");
        ls.style.opacity = "";
        startDesktop();
      }, 500);
    };
    btn.addEventListener("click", enter);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") enter(); });
    setTimeout(() => input.focus(), 100);

    $("#sleep-btn").addEventListener("click", () => location.reload());
    $("#restart-btn").addEventListener("click", () => location.reload());
    $("#shutdown-btn").addEventListener("click", () => { if (confirm("Shut Down?")) document.body.innerHTML = ""; });
  }, 600);
}

function startDesktop() {
  const desktop = $("#desktop");
  desktop.classList.remove("hidden");
  applyTheme();

  initMenuBar();
  initDock();
  initDesktop();
  initSpotlight();
  initLaunchpad();

  // global keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    const cmd = e.metaKey || e.ctrlKey;
    if (cmd && e.code === "Space") { e.preventDefault(); openSpotlight(); }
    else if (e.key === "Escape") { closeSpotlight(); closeLaunchpad(); }
    else if (cmd && e.key === "f" && e.shiftKey) { e.preventDefault(); import("./apps/finder.js").then(m => m.default.launch()); }
    else if (e.key === "F4") { openLaunchpad(); }
    // app shortcuts handled per-app via menu actions
  });

  // open Finder by default
  setTimeout(() => {
    getApp("finder")?.launch();
    setTimeout(() => toast("Welcome to macOS Tahoe", "Tip: Press ⌘Space for Spotlight", "finder"), 800);
  }, 300);
}

// start
boot();
