// ===================================================================
// Launchpad
// ===================================================================
import { $, $$, el } from "./state.js";
import { allApps } from "../apps/registry.js";
import { iconSVG } from "../icons.js";

let open = false;

export function openLaunchpad() {
  if (open) return closeLaunchpad();
  open = true;
  const lp = $("#launchpad");
  lp.classList.remove("hidden");
  const grid = $("#launchpad-grid");
  grid.innerHTML = "";
  const apps = allApps().filter((a) => !a.hidden);
  apps.forEach((a) => {
    const item = el("div", { class: "lp-app", html: `<div class="lp-icon">${a.icon}</div><div class="lp-label">${a.name}</div>` });
    item.addEventListener("click", () => { closeLaunchpad(); a.launch?.(); });
    grid.append(item);
  });
  const search = $("#launchpad-search");
  search.value = "";
  search.oninput = () => {
    const q = search.value.toLowerCase();
    $$(".lp-app", grid).forEach((node) => {
      node.style.display = node.querySelector(".lp-label").textContent.toLowerCase().includes(q) ? "" : "none";
    });
  };
  setTimeout(() => search.focus(), 40);
}

export function closeLaunchpad() {
  open = false;
  $("#launchpad").classList.add("hidden");
}

export function initLaunchpad() {
  const lp = $("#launchpad");
  lp.addEventListener("click", (e) => { if (e.target === lp) closeLaunchpad(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) closeLaunchpad(); });
}
