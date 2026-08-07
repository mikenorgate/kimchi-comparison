// ===================================================================
// Spotlight search
// ===================================================================
import { $, $$, el } from "./state.js";
import { allApps } from "../apps/registry.js";
import { fs } from "./filesystem.js";
import { iconSVG, icons } from "../icons.js";

let activeIndex = 0;
let results = [];
let open = false;

export function openSpotlight() {
  if (open) return closeSpotlight();
  open = true;
  const sp = $("#spotlight");
  sp.classList.remove("hidden");
  const input = $("#spotlight-input");
  input.value = "";
  renderResults("");
  setTimeout(() => input.focus(), 30);
}

export function closeSpotlight() {
  open = false;
  $("#spotlight").classList.add("hidden");
}

export function initSpotlight() {
  const sp = $("#spotlight");
  sp.addEventListener("click", (e) => { if (e.target === sp) closeSpotlight(); });
  const input = $("#spotlight-input");
  input.addEventListener("input", () => { activeIndex = 0; renderResults(input.value); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, results.length - 1); highlight(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); highlight(); }
    else if (e.key === "Enter") { e.preventDefault(); launch(results[activeIndex]); }
    else if (e.key === "Escape") closeSpotlight();
  });
}

function search(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return allApps().slice(0, 8).map((a) => ({ type: "app", app: a, label: a.name, sub: "Application", icon: a.icon }));
  }
  const out = [];
  for (const a of allApps()) {
    if (a.name.toLowerCase().includes(q)) out.push({ type: "app", app: a, label: a.name, sub: "Application", icon: a.icon });
  }
  // math
  if (/^[\d\s+\-*/().%^]+$/.test(query) && /[\+\-\*\/]/.test(query)) {
    try {
      const val = Function(`"use strict";return (${query.replace(/\^/g, "**")})`)();
      out.unshift({ type: "calc", label: `${query} = ${val}`, sub: "Calculator", icon: iconSVG("calculator", 28), action: () => {} });
    } catch {}
  }
  // files
  const matches = fs.all().filter((n) => n.name.toLowerCase().includes(q)).slice(0, 6);
  matches.forEach((n) => {
    out.push({
      type: "file", node: n,
      label: n.name, sub: "File",
      icon: n.type === "folder" ? iconSVG("folder", 28) : iconSVG("file", 28),
    });
  });
  return out.slice(0, 12);
}

function renderResults(query) {
  results = search(query);
  const box = $("#spotlight-results");
  box.innerHTML = "";
  if (!results.length) {
    box.append(el("div", { class: "empty-state", text: "No results" }));
    return;
  }
  let lastType = "";
  results.forEach((r, i) => {
    if (r.type !== lastType) {
      box.append(el("div", { class: "spotlight-section", text: r.type === "app" ? "Applications" : r.type === "file" ? "Files" : "Result" }));
      lastType = r.type;
    }
    const row = el("div", { class: "spotlight-result" + (i === activeIndex ? " active" : ""), html: `<div class="sr-icon">${r.icon}</div><div><div class="sr-label">${r.label}</div><div class="sr-sub">${r.sub || ""}</div></div>` });
    row.addEventListener("mouseenter", () => { activeIndex = i; highlight(); });
    row.addEventListener("click", () => launch(r));
    box.append(row);
  });
}

function highlight() {
  $$(".spotlight-result").forEach((r, i) => r.classList.toggle("active", i === activeIndex));
}

function launch(r) {
  if (!r) return;
  if (r.type === "app") r.app.launch?.();
  else if (r.type === "file") {
    import("../apps/finder.js").then((m) => m.default.openFile(r.node));
  }
  closeSpotlight();
}
